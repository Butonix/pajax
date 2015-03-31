import * as _ from './helpers';
import parseIRI from './iri';
import qs from './qs';

// Pipelet for filtering sucessfull requests
function filterSuccess() {
  return req => {
    if(!req.error && ((req.status >= 200 && req.status < 300) || req.status===304)) {
      return Promise.resolve(req);
    } else {
      if(req.status<100) {
        // Unknown status code
        req.error = 'Invalid response code';
      }
      return Promise.reject(req);
    }
  }
}

export default class PajaxRequest {

  constructor(method, url, opts) {
    if(!url) {
      throw 'URL required for request';
    }

    // The XMLHttpRequest object is recreated at every call - to defeat Cache problem in IE
    var xhr;
    try { xhr = new XMLHttpRequest(); } catch (e) {
      throw 'Could not create XMLHttpRequest object';
    }

    this.pipelets = {
      before: [],
      after: []
    }

    this.xhr = xhr;
    this.method = method;
    this.url = url;
    this.opts = opts || {};
    this.url = url;
    this.error = null;
    this.body = null;
    this.headers = {};
  }

  clone(url, opts) {
    url = url || this.url;
    opts = opts || this.opts;
    var req = new PajaxRequest(this.method, url, opts);

    for (let pipelet of (this.pipelets.before || [])) {
      req.before(pipelet);
    }
    for (let pipelet of (this.pipelets.after || [])) {
      req.after(pipelet);
    }

    return req;
  }

  get status() {
    return this.xhr.status;
  }

  get statusText() {
    return this.xhr.statusText;
  }

  get processedURL() {
    var opts = this.opts;

    var url = '';
    var parsedURL = new parseIRI(this.url);

    // Add base url when url is just a path
    var baseURL = opts.baseURL;
    if(parsedURL.isRelative && baseURL) {
      url = baseURL;
    } else if(!parsedURL.isRelative) {
      url = parsedURL.protocol + '//' + parsedURL.host;
    }

    url += parsedURL.pathname + parsedURL.hash;

    var qp = {};

    // When url contains query params, merge them into qp hash
    if(parsedURL.search) {
      var search = parsedURL.search.replace(/^\?/, '');
      if(search) {
        qp = _.defaults(qs.parse(search), qp);
      }
    }

    // Merge options params into qp hash
    if (opts.queryParams) {
      qp = _.defaults(opts.queryParams, qp);
    }

    // Merge caching param into qp hash
    if(this.method === 'GET' && opts.noCache==='boolean') {
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

  send(data) {
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

  done() {
    // The XMLHttpRequest object is recreated at every call - to defeat Cache problem in IE
    var xhr = this.xhr;

    return Promise.resolve().then(()=>{
      return _.resolvePipelets(this.pipelets.before || [], this);
    }).then(()=>{
      return new Promise((resolve, reject) => {
        var opts = this.opts;

        var method = this.method || 'GET';

        var url = this.processedURL;

        xhr.open(method, url, true);

        // Default response type is 'text'
        opts.responseType = opts.responseType || 'text';
        opts.responseType = opts.responseType.toLowerCase();

        var data = opts.data;

        if (data && typeof data==='object' && typeof opts.contentType==='string' &&  _.startsWith(opts.contentType, 'application/x-www-form-urlencoded')) {
          // URL encode the data if the content type requires it
          data = qs.stringify(data);
        } else if (data && typeof data==='object') {
          if(!opts.contentType) {
            // Use JSON if content type not set and data is object
            opts.contentType = 'application/json';
          }

          // Stringify JSON
          try {
            data = JSON.stringify(data);
          } catch(ex) {
            this.error = 'Invalid data';
            reject(this);
          }
        }

        // Add content type header only when sending dat
        if(data && opts.contentType) {
          xhr.setRequestHeader('Content-Type', opts.contentType);
        }

        if (opts.responseType) {
          try {
            xhr.responseType = opts.responseType;
          } catch (err) {
            // Fallback to type processor
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
          xhr.upload.addEventListener("progress", (...args)=> {
            opts.progress(this, ...args);
          }, false);
        }

        if(opts.timeout) {
          xhr.timeout = opts.timeout;
        }

        if(opts.withCredentials) {
          xhr.withCredentials = typeof opts.withCredentials==='boolean' ? opts.withCredentials : false;
        }

        // Callback for errors
        xhr.onerror = () => {
          this.error = 'Network error';
          reject(this);
        };

        // Callback for timeout
        xhr.ontimeout = () => {
          this.error = 'Timeout';
          reject(this);
        };

        // Callback for document loaded.
        xhr.onload = () => {
          this.headers = _.parseResponseHeaders(xhr.getAllResponseHeaders());
          this.body = xhr.response;
          resolve(this);
        };

        xhr.send(data);
      });
    }).then(()=>{
      return _.resolvePipelets(this.pipelets.after || [], this);
    }).then(()=>{
      return this;
    }).then(filterSuccess());
  }
}
