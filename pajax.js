import parseIRI from './iri';
import typeProcessors from './typeProcessors';
import * as qs from './qs';
import {
          clone,
          defaults,
          parseResponseHeaders,
          createResult,
          startsWith,
          callHandlers
        }
        from './helpers';

// Predefined options
var defaultOpts = {
  'urlencoded': {
    contentType: 'application/x-www-form-urlencoded',
    responseType: 'string'
  },
  'json': {
    contentType: 'application/json',
    responseType: 'json',
    headers: {
      Accept : "application/json"
    }
  },
  'json-ld': {
    contentType: 'application/json',
    responseType: 'json',
    headers: {
      Accept : "application/ld+json"
    }
  }
};

class Pajax {
  constructor(type, opts) {
    this._handlers = [];
    if(typeof type==='string') {
      this.opts = defaults(opts || {}, defaultOpts[type]);
    } else if(type && typeof type==='object') {
      this.opts = type;
    }
  }

  use(obj, cb) {
    if(typeof obj==='string') {
      obj = {
        [obj]: cb
      }
    }

    if(typeof obj !== 'object') {
      throw 'use argument must be string/function or object';
    }
    this._handlers.push(obj);
  }

  get(url, opts) {
    return this.send({ url, opts, method: 'GET', data: null });
  }

  head(url, opts) {
    return this.send({ url, opts, method: 'HEAD', data: null });
  }

  post(url, data, opts) {
    return this.send({ url, opts, method: 'POST', data });
  }

  put(url, data, opts) {
    return this.send({ url, opts, method: 'PUT', data });
  }

  patch(url, data, opts) {
    return this.send({ url, opts, method: 'PATCH', data });
  }

  del(url, data, opts) {
    return this.send({ url, opts, method: 'DELETE', data });
  }

  send(req) {

    var handlers = this._handlers;

    // The XMLHttpRequest object is recreated at every call - to defeat Cache problem in IE
    var xhr;
    try { xhr = new XMLHttpRequest(); } catch (e) {
      throw 'Could not create XMLHttpRequest object';
    }

    // We manipulate the req and opts object, so we clone them
    req = clone(req);
    req.opts = clone(req.opts || {});

    req.method = req.method || 'GET';
    // Use overridable defaults
    req.opts = defaults(req.opts, this.opts);

    // Call before request handlers
    return callHandlers(handlers, 'beforeRequest', req, xhr).then(()=> {

      return new Promise((resolve, reject) => {

        var url = req.url;
        if(!url) {
          throw 'URL required for request';
        }

        var opts = req.opts;

        var pURL = '';
        var parsedURL = parseIRI(req.url);
        // Add base url when url is just a path
        var baseURL = opts.baseURL;
        if(parsedURL.isRelative && baseURL) {
          pURL = baseURL;
        } else if(!parsedURL.isRelative) {
          pURL = parsedURL.protocol + '//' + parsedURL.host;
        }

        pURL += parsedURL.pathname + parsedURL.hash;

        var qp = {};

        // When url contains query params, merge them into qp hash
        if(parsedURL.search) {
          var search = parsedURL.search.replace(/^\?/, '');
          if(search) {
            qp = defaults(qs.parse(search), qp);
          }
        }

        // Merge options params into qp hash
        if (opts.queryParams) {
          qp = defaults(opts.queryParams, qp);
        }

        // Merge caching param into qp hash
        if(req.method === 'GET' && typeof opts.cache==='boolean' && !opts.cache) {
          var ts = Date.now();
          qp._ = ++ts;
        }

        if(Object.keys(qp).length > 0) {
          // Serialize query parameters into query string
          pURL += '?' + qs.stringify(qp);
        }

        req.url = pURL;

        // Default response type is 'text'
        opts.responseType = opts.responseType || 'text';
        opts.responseType = opts.responseType.toLowerCase();

        opts.data = req.data || opts.data;

        if (opts.data && typeof opts.data==='object' && typeof opts.contentType==='string' &&  startsWith(opts.contentType, 'application/x-www-form-urlencoded')) {
          // URL encode the data if the content type requires it
          opts.data = qs.stringify(opts.data);
        } else if (opts.data && typeof opts.data==='object' && typeof opts.contentType==='string' && startsWith(opts.contentType, 'application/json')) {
          // Stringify JSON
          try {
            opts.data = JSON.stringify(opts.data);
          } catch(ex) {
            return Promise.reject('Invalid data:' + ex);
          }
        }

        xhr.open(req.method, req.url, true);

        // Add content type header only when sending dat
        if(opts.data && opts.contentType) {
          xhr.setRequestHeader('Content-Type', opts.contentType);
        }

        if(opts.headers) {
          for(var p in opts.headers) {
            if(opts.headers.hasOwnProperty(p)) {
              xhr.setRequestHeader(p, opts.headers[p]);
            }
          }
        }

        if(opts.progress && xhr.upload) {
          xhr.upload.addEventListener("progress", opts.progress, false);
        }

        if(opts.timeout) {
          xhr.timeout = opts.timeout;
        }

        // Callback for errors
        xhr.onerror = function() {
          var result = createResult(xhr, 'Network error');
          reject(result);
        };

        // Callback for timeout
        xhr.ontimeout = function() {
          var result = createResult(xhr, 'Timeout');
          reject(result);
        };

        // Callback for document loaded.
        xhr.onload = function() {

          //Ready State will be 4 when the document is loaded.
          if (xhr.readyState===4) {
            var result = createResult(xhr);

            if(opts.responseHeaders) {
              result.responseHeaders = parseResponseHeaders(xhr.getAllResponseHeaders());
            }

            if(typeProcessors[opts.responseType]) {
              typeProcessors[opts.responseType](xhr, result);
            }

            callHandlers(handlers, 'afterSend', req, xhr, result).then(()=>{
              if(!result.error && xhr.status >= 200 && xhr.status < 300) {
                if(opts.meta) {
                  resolve(result);
                } else {
                  resolve(result.response);
                }
              } else {
                if(xhr.status<100) {
                  // Unknown status code
                  result.error = 'Invalid response code';
                } else if(!result.error) {
                  result.error = 'Unknown error';
                }
                reject(result);
              }
            });
          }
        };

        callHandlers(handlers, 'beforeSend', req, xhr).then(()=> {
          xhr.send(opts.data);
        });
      });
    });
  }

  static get(url, opts, type) {
    return new Pajax(type).get(url, opts);
  }
  static head(url, opts, type) {
    return new Pajax(type).head(url, opts);
  }
  static put(url, data, opts, type) {
    return new Pajax(type).put(url, data, opts);
  }
  static post(url, data, opts, type) {
    return new Pajax(type).post(url, data, opts);
  }
  static del(url, data, opts, type) {
    return new Pajax(type).del(url, data, opts);
  }
  static patch(url, data, opts, type) {
    return new Pajax(type).patch(url, data, opts);
  }
}

// Export Pajax
export default Pajax;
export * from './iri';
export * from './qs';
