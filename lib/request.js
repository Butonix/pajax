/* */
import * as _ from './utils';
import {parseURL} from './url-parser';
import qs from './qs';
import PajaxResult from './result';

function resolvePipelets(pipelets, o) {
  var pipeChain = Promise.resolve(o);
  for (let pipelet of (pipelets || [])) {
    pipeChain = pipeChain.then(pipelet).then(()=>{
      return o;
    });
  }
  return pipeChain;
}

var serializers = {
   'application/json': JSON.stringify,
   'application/ld+json': JSON.stringify,
   'application/x-www-form-urlencoded': qs.stringify
};

export default class PajaxRequest {

  constructor(url, opts, method, factory) {
    // The opts will be changed, so we create a clone
    opts = _.clone(opts || {});

    this.opts = opts;
    this.url = url;
    this.method = method || opts.method || 'GET';
    this.factory = factory;

    this.pipelets = {
      before: [],
      after: [],
      afterSuccess: [],
      afterFailure: []
    }
  }

  // Make an copy of the request with the same options
  clone(url, opts, method, factory) {
    var req = new PajaxRequest(url || this.url,
                               opts || this.opts,
                               method || this.method,
                               factory || this.factory);

    for (let pipelet of (this.pipelets.before || [])) {
      req.before(pipelet);
    }
    for (let pipelet of (this.pipelets.after || [])) {
      req.after(pipelet);
    }
    for (let pipelet of (this.pipelets.afterSuccess || [])) {
      req.afterSuccess(pipelet);
    }
    return req;
  }

  get processedURL() {
    return this.processURL(this.url);
  }

  processURL(url) {
    var opts = this.opts;

    var parsedURL = parseURL(url);
    url = '';

    // Add base url when url is just a path
    var baseURL = opts.baseURL;
    if(parsedURL.isRelative && baseURL) {
      url = baseURL;
    } else if(!parsedURL.isRelative) {
      url = parsedURL.protocol + '//' + parsedURL.host;
    }

    url += parsedURL.pathname + parsedURL.hash;

    var qp = {};

    // Merge options params into qp hash
    if (opts.queryParams) {
      qp = _.defaults(qp, opts.queryParams);
    }

    // When url contains query params, merge them into qp hash
    if(parsedURL.search) {
      var search = parsedURL.search.replace(/^\?/, '');
      if(search) {
        qp = _.defaults(qp, qs.parse(search));
      }
    }

    // Merge caching param into qp hash
    if(this.method === 'GET' && opts.noCache) {
      var ts = Date.now();
      qp._ = ++ts;
    }

    if(Object.keys(qp).length > 0) {
      // Serialize query parameters into query string
      url += '?' + qs.stringify(qp);
    }

    return url;
  }

  before(func) {
    this.pipelets.before.push(func);
    return this;
  }

  after(func) {
    this.pipelets.after.push(func);
    return this;
  }

  afterSuccess(func) {
    this.pipelets.afterSuccess.push(func);
    return this;
  }

  afterFailure(func) {
    this.pipelets.afterFailure.push(func);
    return this;
  }

  attach(data) {
    this.opts.data = data;
    return this;
  }

  header(header, value) {
    if(typeof header==='string') {
      this.opts.headers = this.opts.headers || {};
      this.opts.headers[header] = value;
    } else if(typeof header==='object') {
      this.opts.headers = _.merge(this.opts.headers, header);
    }
    return this;
  }

  timeout(timeout) {
    this.opts.timeout = timeout;
    return this;
  }

  progress(cb) {
    this.opts.progress = cb;
    return this;
  }

  withCredentials() {
    this.opts.withCredentials = true;
    return this;
  }

  responseType(responseType) {
    this.opts.responseType = responseType;
    return this;
  }

  responseContentType(responseContentType) {
    this.opts.responseContentType = responseContentType;
    return this;
  }

  contentType(contentType) {
    this.opts.contentType = contentType;
    return this;
  }

  asText() {
    this.opts.responseContentType = 'text/plain';
    return this;
  }

  asJSON() {
    this.opts.responseContentType = 'application/json';
    return this;
  }

  query(qp, value) {
    if(typeof qp==='string') {
      this.opts.queryParams = this.opts.queryParams || {};
      this.opts.queryParams[qp] = value;
    } else if(typeof qp==='object') {
      this.opts.queryParams = _.merge(this.opts.queryParams, qp);
    }
    return this;
  }

  noCache(noCache) {
    this.opts.noCache = typeof noCache==='boolean' ? noCache : true;
    return this;
  }

  createResult(xhr) {
    if(this.factory && typeof this.factory.ResultClass==='function') {
      // Use callback if available on factory
      return new this.factory.ResultClass(this, xhr);
    } else {
      // Otherwise fall back to default result object
      return new PajaxResult(this, xhr)
    }
  }

  send(url) {
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
        var opts = this.opts;

        var method = this.method || 'GET';

        url = url || this.url;

        if(typeof url!=='string') {
          return Promise.reject(' Valid URL required for request')
        }

        url = this.processURL(url);

        xhr.open(method, url, true);

        var data = opts.data;

        // Try to serialize data
        if (data && typeof data==='object') {
          try {
            var serialize = opts.serialize || serializers[opts.contentType];
            if(typeof serialize==='function') {
              data = serialize(data);
            } else if(typeof opts.contentType==='undefined') {
              opts.contentType = 'application/json';
              data = JSON.stringify(data);
            }
          } catch(ex) {
            var res = this.createResult(xhr);
            res.error = 'Invalid data';
            reject(res);
          }
        }

        // Add content type header only when data is attached
        if(data && opts.contentType) {
          xhr.setRequestHeader('Content-Type', opts.contentType);
        }

        try {
          // Default response type is 'text'
          xhr.responseType = opts.responseType ? opts.responseType.toLowerCase() : 'text';
        } catch (err) {
          // Fallback to type processor
          opts.responseType = null;
        }

        // Add custom headers
        if(opts.headers) {
          for(var p in opts.headers) {
            if(opts.headers.hasOwnProperty(p)) {
              xhr.setRequestHeader(p, opts.headers[p]);
            }
          }
        }

        // Register upload progress listener
        if(opts.progress && xhr.upload) {
          xhr.upload.addEventListener("progress", (...args)=> {
            opts.progress(this, ...args);
          }, false);
        }

        // Set the timeout
        if(typeof opts.timeout==='number') {
          xhr.timeout = opts.timeout;
        }

        // Set withCredentials
        if(opts.withCredentials) {
          xhr.withCredentials = typeof opts.withCredentials==='boolean' ? opts.withCredentials : false;
        }

        // Callback for errors
        xhr.onerror = () => {
          var res = this.createResult(xhr);
          res.error = 'Network error';
          reject(res);
        };

        // Callback for timeouts
        xhr.ontimeout = () => {
          var res = this.createResult(xhr);
          res.error = 'Timeout';
          reject(res);
        };

        // Callback for document loaded.
        xhr.onload = () => {
          resolve(this.createResult(xhr));
        };

        xhr.send(data);
      });
    })
    // Pipelet for marking unsucessfull requests
    .then(res=>{
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
