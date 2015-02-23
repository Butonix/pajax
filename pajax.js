import log from 'log';
import qs from 'querystring';
import _defaults from 'lodash/object/defaults';
import _clone from 'lodash/lang/clone';

import parseResponseHeaders from './parseResponseHeaders';
import parseIRI from './iri';
import typeProcessors from './typeProcessors';

function createResult(xhr, error, errorText) {
  return {
    response: xhr.response,
    status: xhr.status,
    statusText: xhr.statusText,
    xhr: xhr,
    error: error || 0,
    errorText: errorText || null
  };
}

function startsWith(s, val){
  return s.slice(0, s.length)===val;
}

function callHandlers(handlers, handlerType, ...args) {
  var promises = [];
  handlers.forEach(function(obj) {
    if(obj && typeof obj[handlerType]==='function') {
      let p = obj[handlerType].apply(obj, args);
      promises.push(p);
    }
  });
  return Promise.all(promises).catch(err=> {
    // Errors are ignored
    log.warn('Ajax handler', handlerType, err);
  });
}

// Predefined options
var defaults = {
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


function Ajax(type, opts) {
  this._handlers = [];
  if(typeof type==='string') {
    this.opts = _defaults(opts || {}, defaults[type]);
  } else if(type && typeof type==='object') {
    this.opts = type;
  }
}



Ajax.prototype.ERROR_DEFAULT = 1;
Ajax.prototype.ERROR_NETWORK = 2;
Ajax.prototype.ERROR_TIMEOUT = 3;
Ajax.prototype.ERROR_INVALID_RESPONSE_CODE = 4;
Ajax.prototype.ERROR_INVALID_JSON = 5;

Ajax.prototype.defaultOpts = {
  cache: true // We embrace HTTP caching semantics
};

Ajax.prototype.use = function(obj, cb) {
  if(typeof obj==='string') {
    obj = {
      [obj]: cb
    }
  }

  log.assert(typeof obj === 'object', 'use argument must be string/function or object');
  this._handlers.push(obj);
};

Ajax.prototype.get = function(url, opts) {
  return this.send({ url, opts, method: 'GET', data: null });
};

Ajax.prototype.head = function(url, opts) {
  return this.send({ url, opts, method: 'HEAD', data: null });
};

Ajax.prototype.post = function(url, data, opts) {
  return this.send({ url, opts, method: 'POST', data });
};

Ajax.prototype.put = function(url, data, opts) {
  return this.send({ url, opts, method: 'PUT', data });
};

Ajax.prototype.patch = function(url, data, opts) {
  return this.send({ url, opts, method: 'PATCH', data });
};

Ajax.prototype.del = function(url, data, opts) {
  return this.send({ url, opts, method: 'DELETE', data });
};

Ajax.prototype.send = function(req) {

  var handlers = this._handlers;

  // The XMLHttpRequest object is recreated at every call - to defeat Cache problem in IE
  var xhr;
  try { xhr = new XMLHttpRequest(); } catch (e) {}
  log.assert(xhr, 'Could not create XMLHttpRequest object');

  // We manipulate the req object, so we clone it
  req = _clone(req);

  req.method = req.method || 'GET';

  req.opts = req.opts || {};
  // Use overridable defaults
  req.opts = _defaults(req.opts, this.opts);

  // Call before request handlers
  return callHandlers(handlers, 'beforeRequest', req, xhr).then(()=> {

    return new Promise((resolve, reject) => {

      var url = req.url;
      log.assert(req.url, 'URL required for request');

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
          qp = _defaults(qs.parse(search), qp);
        }
      }

      // Merge options params into qp hash
      if (opts.queryParams) {
        qp = _defaults(opts.queryParams, qp);
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

      //Default response type is 'text'
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

      if (opts.responseType) {
        try {
          xhr.responseType = opts.responseType;
        } catch (err) {
          log.warn('xhr responseType is not supported');
        }
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
        var result = createResult(xhr, Ajax.prototype.ERROR_NETWORK, 'Network error');
        reject(result);
      };

      // Callback for timeout
      xhr.ontimeout = function() {
        var result = createResult(xhr, Ajax.prototype.ERROR_TIMEOUT, 'Timeout');
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
                result.error = Ajax.prototype.ERROR_INVALID_RESPONSE_CODE;
                result.errorText = 'Invalid response code';
              } else if(!result.error) {
                result.error = Ajax.prototype.ERROR_DEFAULT;
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
};

Ajax.get = function(url, opts, type) {
  return new Ajax(type).get(url, opts);
};
Ajax.head = function(url, opts, type) {
  return new Ajax(type).head(url, opts);
};
Ajax.put = function(url, data, opts, type) {
  return new Ajax(type).put(url, data, opts);
};
Ajax.post = function(url, data, opts, type) {
  return new Ajax(type).post(url, data, opts);
};
Ajax.del = function(url, data, opts, type) {
  return new Ajax(type).del(url, data, opts);
};
Ajax.patch = function(url, data, opts, type) {
  return new Ajax(type).patch(url, data, opts);
};

// Export Ajax
export default Ajax;
export {
  parseIRI,
  isIRI
} from './iri';
