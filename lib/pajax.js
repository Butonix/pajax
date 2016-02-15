import {resolvePipelets} from './utils';
import {serializers} from './serializers';
import Request from './request';
import Response from './response';
import Configurator from './configurator';
import async from './async';

class Pajax extends Configurator{

  get(url, opts={}) {
    opts.method = 'GET';
    return this.request(url, opts);
  }

  head(url, opts={}) {
    opts.method = 'HEAD';
    return this.request(url, opts);
  }

  post(url, opts={}) {
    opts.method = 'POST';
    return this.request(url, opts);
  }

  put(url, opts={}) {
    opts.method = 'PUT';
    return this.request(url, opts);
  }

  patch(url, opts={}) {
    opts.method = 'PATCH';
    return this.request(url, opts);
  }

  delete(url, opts={}) {
    opts.method = 'DELETE';
    return this.request(url, opts);
  }

  del(...args) {
    return this.delete(...args);
  }

  request(url, opts) {
    return this.createRequest(url, this.opts, this)
               .assignOpts(opts)
               .checkStatus();
  }

  createRequest(url, opts, factory) {
    let RequestClass = this.constructor.Request || Request;
    return new RequestClass(url, opts, factory || this);
  }

  createResponse(req, xhr) {
    let ResponseClass = this.constructor.Response || Response;
    return new ResponseClass(req, xhr);
  }

  fetch(url, opts) {
    let req;
    if (url instanceof Request) {
      req = url;
    } else {
      req = this.createRequest(url, this.opts, this)
                .assignOpts(opts)
    }

    // The XMLHttpRequest object is recreated at every request to defeat caching problems in IE
    let xhr;
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

        let method = req.method || 'GET';

        xhr.open(method, url, true);

        let body = req.body;

        // Try to serialize body
        if (body && typeof body==='object') {
          try {
            let serialize = serializers[req.contentType];
            if(req.contentType && serializers[req.contentType]) {
              body = serializers[req.contentType](body);
            } else if(req.contentType===undefined) {
              body = JSON.stringify(body);
              xhr.setRequestHeader('Content-Type', 'application/json');
            }
          } catch(ex) {
            let res = this.createResponse(req, xhr);
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
          let res = this.createResponse(req, xhr);
          res.error = 'Network error';
          resolve(res);
        };

        // Callback for timeouts
        xhr.ontimeout = () => {
          let res = this.createResponse(req, xhr);
          res.error = 'Timeout';
          resolve(res);
        };

        // Callback for document loaded.
        xhr.onload = () => {
          let res = this.createResponse(req, xhr);
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

  static request(...args) {
    return new this().request(...args);
  }
  static fetch(...args) {
    return new this().fetch(...args);
  }
  static get(...args) {
    return new this().get(...args);
  }
  static head(...args) {
    return new this().head(...args);
  }
  static post(...args) {
    return new this().post(...args);
  }
  static put(...args) {
    return new this().put(...args);
  }
  static delete(...args) {
    return new this().delete(...args);
  }
  static patch(...args) {
    return new this().patch(...args);
  }
  static del(...args) {
    return this.delete(...args);
  }
}

Pajax.async = async;
Pajax.Request = Request;
Pajax.Response = Response;

export default Pajax;
