/* */
import * as _ from './utils';
import qs from './qs';
import PajaxResponse from './response';
import {parseURL} from './url-parser';
import Options from './options';
import {serializers} from './serializers';

function resolvePipelets(pipelets, o) {
  var pipeChain = Promise.resolve(o);
  for (let pipelet of (pipelets || [])) {
    pipeChain = pipeChain.then(pipelet).then(()=>{
      return o;
    });
  }
  return pipeChain;
}

export default class PajaxRequest extends Options {

  constructor({url, opts, pipelets, factory, Response, request}={}) {
    super(opts, pipelets);

    if(typeof url!=='string') {
      return Promise.reject('URL required for request')
    }

    this.url = url;
    this.factory = factory;
    this.Response = Response || PajaxResponse;
    Object.keys(request||{}).forEach(key=>{
      this[key] = request[key];
    })
  }

  get processedURL() {
    var parsedURL = parseURL(this.url);
    let url = '';

    // Add base url when url is just a path
    var baseURL = this.opts.baseURL;
    if(parsedURL.isRelative && baseURL) {
      url = baseURL;
    } else if(!parsedURL.isRelative) {
      url = parsedURL.protocol + '//' + parsedURL.host;
    }

    url += parsedURL.pathname + parsedURL.hash;

    var qp = {};

    // Merge options params into qp hash
    if (this.opts.queryParams) {
      qp = _.defaults(qp, this.opts.queryParams);
    }

    // When url contains query params, merge them into qp hash
    if(parsedURL.search) {
      var search = parsedURL.search.replace(/^\?/, '');
      if(search) {
        qp = _.defaults(qp, qs.parse(search));
      }
    }

    // Merge caching param into qp hash
    if(this.method === 'GET' && this.opts.noCache) {
      var ts = Date.now();
      qp._ = ++ts;
    }

    if(Object.keys(qp).length > 0) {
      // Serialize query parameters into query string
      url += '?' + qs.stringify(qp);
    }

    return url;
  }

  checkStatus() {
    return this.after(res=>{
      // SUCCESS: status between 200 and 299 or 304
      // Failure: status below 200 or beyond 299 excluding 304
      if(res.status < 200 || (res.status >= 300 && res.status!==304)) {
        // Unknown status code
        if(res.status<100 || res.status >=1000) {
          res.error = 'Invalid status code';
        } else {
          // Use statusText as error
          if(res.statusText) {
            res.error = res.statusText;
          } else {
            // Unknown error
            res.error = 'Request failed';
          }
        }
      }
    });
  }

  send() {
    // The XMLHttpRequest object is recreated at every send - to defeat Cache problem in IE
    var xhr;
    try { xhr = new XMLHttpRequest(); } catch (e) {
      throw 'Could not create XMLHttpRequest object';
    }

    // Resolve before pipelets
    return Promise.resolve().then(()=>{
      return resolvePipelets(this.pipelets.before || [], this);
    })
    .then(()=>{
      return new Promise((resolve, reject) => {
        let url = this.url;

        url = this.processedURL;

        var method = this.opts.method || 'GET';

        xhr.open(method, url, true);

        var body = this.opts.body;

        // Try to serialize body
        if (body && typeof body==='object') {
          try {
            var serialize = serializers[this.opts.contentType];
            if(this.opts.contentType && serializers[this.opts.contentType]) {
              body = serializers[this.opts.contentType](body);
            } else if(this.opts.contentType===undefined) {
              this.opts.contentType = 'application/json';
              body = JSON.stringify(body);
            }
          } catch(ex) {
            var res = new this.Response(this, xhr);
            res.error = 'Invalid body';
            reject(res);
          }
        }

        // Add content type header only when body is attached
        if(body!==undefined && this.opts.contentType) {
          xhr.setRequestHeader('Content-Type', this.opts.contentType);
        }

        try {
          // Default response type is 'text'
          xhr.responseType = this.opts.responseType ?
                             this.opts.responseType.toLowerCase() :
                             'text';
        } catch (err) {
          // Fallback to type processor
          this.opts.responseType = null;
        }

        // Add custom headers
        if(this.opts.headers) {
          Object.keys(this.opts.headers).forEach(key=>{
            xhr.setRequestHeader(key, this.opts.headers[key]);
          })
        }

        // Register upload progress listener
        if(this.opts.progress && xhr.upload) {
          xhr.upload.addEventListener("progress", (...args)=> {
            this.opts.progress(this, ...args);
          }, false);
        }

        // Set the timeout
        if(typeof this.opts.timeout==='number') {
          xhr.timeout = this.opts.timeout;
        }

        // Set withCredentials
        if(this.opts.withCredentials!==undefined) {
          xhr.withCredentials = !!this.opts.withCredentials;
        }

        // Callback for errors
        xhr.onerror = () => {
          var res = new this.Response(this, xhr);
          res.error = 'Network error';
          reject(res);
        };

        // Callback for timeouts
        xhr.ontimeout = () => {
          var res = new this.Response(this, xhr);
          res.error = 'Timeout';
          reject(res);
        };

        // Callback for document loaded.
        xhr.onload = () => {
          var res = new this.Response(this, xhr);
          resolve(res);
        };

        xhr.send(body);
      });
    })
    // Pipelet for marking unsucessfull requests
    .then(res=>{
      // Resolve after pipelets
      return resolvePipelets(this.pipelets.after || [], res);
    }).then(res=>{
      if(res.error) {
        // Resolve afterFailure pipelets
        return resolvePipelets(this.pipelets.afterFailure || [], res);
      } else {
        // Resolve afterSuccess pipelets
        return resolvePipelets(this.pipelets.afterSuccess || [], res);
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
