import {resolvePipelets, decorate, clone, mergeOpts} from './utils';
import Request from './request';
import Response from './response';
import configurator from './configurator';
import {serializers} from './serializers';

class Pajax {

  constructor(opts={}) {
    // Opts will be modified, so we create a clone
    this.opts = clone(opts);
    // Enable this class for configuration
    configurator(this, this.opts);
  }

  get(url, opts) {
    return this.request(url, opts, 'GET');
  }

  head(url, opts) {
    return this.request(url, opts, 'HEAD');
  }

  post(url, opts) {
    return this.request(url, opts, 'POST');
  }

  put(url, opts) {
    return this.request(url, opts, 'PUT');
  }

  patch(url, opts) {
    return this.request(url, opts, 'PATCH');
  }

  delete(url, opts) {
    return this.request(url, opts, 'DELETE');
  }

  del(...args) {
    return this.delete(...args);
  }

  request(url, opts, method) {
    opts = mergeOpts(this.opts, opts);
    opts.method = method || opts.method;
    return this.createRequest(url, opts, this).checkStatus();
  }

  createRequest(url, opts, factory) {
    return new Request(url, opts, factory || this);
  }

  createResponse(req, xhr) {
    return new Response(req, xhr);
  }

  fetch(url, opts) {
    let req;
    if (url instanceof Request) {
      req = url;
    } else {
      // merge default opts into request opts
      opts = mergeOpts(this.opts, opts);
      req = this.createRequest(url, opts, this)
    }

    // The XMLHttpRequest object is recreated at every request to defeat caching problems in IE
    var xhr;
    try { xhr = new XMLHttpRequest(); } catch (e) {
      throw 'Could not create XMLHttpRequest object';
    }

    // Resolve before pipelets
    return Promise.resolve().then(()=>{
      return resolvePipelets(req.pipelets.before || [], req);
    })
    .then(()=>{
      return new Promise((resolve, reject) => {
        let url = req.url;

        var method = req.method || 'GET';

        xhr.open(method, url, true);

        var body = req.body;

        // Try to serialize body
        if (body && typeof body==='object') {
          try {
            var serialize = serializers[req.contentType];
            if(req.contentType && serializers[req.contentType]) {
              body = serializers[req.contentType](body);
            } else if(req.contentType===undefined) {
              req.contentType = 'application/json';
              body = JSON.stringify(body);
            }
          } catch(ex) {
            var res = new this.createResponse(req, xhr);
            res.error = 'Invalid body';
            reject(res);
          }
        }

        // Add content type header only when body is attached
        if(body!==undefined && req.contentType) {
          xhr.setRequestHeader('Content-Type', req.contentType);
        }

        try {
          // Default response type is 'text'
          xhr.responseType = req.responseType ?
                             req.responseType.toLowerCase() :
                             'text';
        } catch (err) {
          // Fallback to type processor
          req.responseType = null;
        }

        // Add custom headers
        if(req.headers) {
          Object.keys(req.headers).forEach(key=>{
            xhr.setRequestHeader(key, req.headers[key]);
          })
        }

        // Register upload progress listener
        if(req.progress && xhr.upload) {
          xhr.upload.addEventListener('progress', (...args)=> {
            req.progress(this, ...args);
          }, false);
        }

        // Set the timeout
        if(typeof req.timeout==='number') {
          xhr.timeout = req.timeout;
        }

        // Set withCredentials
        if(req.credentials==='include') {
          xhr.withCredentials = true;
        }

        // Callback for errors
        xhr.onerror = () => {
          var res = new this.createResponse(req, xhr);
          res.error = 'Network error';
          resolve(res);
        };

        // Callback for timeouts
        xhr.ontimeout = () => {
          var res = new this.createResponse(req, xhr);
          res.error = 'Timeout';
          resolve(res);
        };

        // Callback for document loaded.
        xhr.onload = () => {
          var res = new this.createResponse(req, xhr);
          resolve(res);
        };

        xhr.send(body);
      });
    })
    // Pipelet for marking unsucessfull requests
    .then(res=>{
      // Success
      return resolvePipelets(req.pipelets.after, res);
    }).then(res=>{
      if(res.error) {
        // Resolve afterFailure pipelets
        return resolvePipelets(req.pipelets.afterFailure, res);
      } else {
        // Resolve afterSuccess pipelets
        return resolvePipelets(req.pipelets.afterSuccess, res);
      }
    }, res=>{
      // When an 'after' pipelet rejects with a response object
      // resolve the afterFailure pipelets
      if(res instanceof Response) {
        return resolvePipelets(req.pipelets.afterFailure, res);
      } else {
        return Promise.reject(res);
      }
    }).then(res=>{
      // Resolve or reject based on error
      if(res.error) {
        return Promise.reject(res);
      } else {
        return Promise.resolve(res);
      }
    });
  }
}

decorate(Pajax);

export default Pajax;
