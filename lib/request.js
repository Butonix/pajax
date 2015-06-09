import * as _ from './utils';
import parseIRI from './iri';
import qs from './qs';

// Pipelet for filtering sucessfull requests
function filterSuccess() {
  return req => {
    if(!req.error && ((req.status >= 200 && req.status < 300) || req.status===304)) {
      return Promise.resolve(req);
    } else {
      if(req.status<100 || req.status >=1000) {
        // Unknown status code
        req.error = 'Invalid status code';
      } else {
        if(req.statusText) {
          req.error = req.statusText;
        } else {
          req.error = 'Request failed';
        }
      }
      return Promise.reject(req);
    }
  }
}

function resolvePipelets(pipelets, req) {
  var pipeChain = Promise.resolve(req);
  for (let pipelet of (pipelets || [])) {
    pipeChain = pipeChain.then(pipelet).then(req=>{
      return req;
    });
  }
  return pipeChain;
}

// Parses that string into a user-friendly key/value pair object.
// http://www.w3.org/TR/XMLHttpRequest/#the-getallresponseheaders-method
export var parseResponseHeaders = function(headerStr) {
  var headers = {};
  if (!headerStr) {
    return headers;
  }
  var headerPairs = headerStr.split('\u000d\u000a');
  for (var i = 0; i < headerPairs.length; i++) {
    var headerPair = headerPairs[i];
    // Can't use split() here because it does the wrong thing
    // if the header value has the string ": " in it.
    var index = headerPair.indexOf('\u003a\u0020');
    if (index > 0) {
      var key = headerPair.substring(0, index).toLowerCase();
      headers[key] = headerPair.substring(index + 2);
    }
  }
  return headers;
}

var serializers = {
   'application/json': JSON.stringify,
   'application/ld+json': JSON.stringify,
   'application/x-www-form-urlencoded': qs.stringify
};

var parsers = {
  'application/json': JSON.parse,
  'application/ld+json': JSON.parse,
  'application/x-www-form-urlencoded': qs.parse
};

export default class PajaxRequest {

  constructor(method, url, opts, factory) {
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

    this.factory = factory;
    this.xhr = xhr;
    this.method = method;
    this.url = url;
    this.opts = opts || {};
    this.url = url;
    this.error = null;
    this.headers = {};
    this.body = null;
    this.contentType = null;
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
      return resolvePipelets(this.pipelets.before || [], this);
    }).then(()=>{
      return new Promise((resolve, reject) => {
        var opts = this.opts;

        var method = this.method || 'GET';

        var url = this.processedURL;

        xhr.open(method, url, true);

        var data = opts.data;

        if (data && typeof data==='object') {
          try {
            var serialize = opts.serialize || serializers[opts.contentType];
            if(serialize) {
              data = serialize(data);
            } else {
              // Fallback to json if content type not set or serializer not found
              if(!opts.contentType) {
                opts.contentType = 'application/json';
                data = JSON.stringify(data);
              }
            }
          } catch(ex) {
            this.error = 'Invalid data';
            reject(this);
          }
        }

        // Add content type header only when sending dat
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
          this.headers = parseResponseHeaders(xhr.getAllResponseHeaders());
          if(this.headers['content-type']) {
            this.contentType = this.headers['content-type'].split(/ *; */).shift(); // char set
          }

          var body = xhr.response;

          try {
            // When the response type is not set and a string is delivered try to find a matching parser via the content type
            if(!opts.responseType &&
                typeof body==='string' &&
                body.length &&
                this.contentType &&
                parsers[this.contentType]) {
              try {
                body = parsers[this.contentType](body);
              } catch(ex) {
                throw 'Invalid response';
              }
            // When the responseType is set and the response body is null, reject the request
            } else if(opts.responseType &&
                      this.status!==204 &&
                      this.status!==205 &&
                      body===null) {
                        throw 'Invalid response';
            }

            this.body = body;
            resolve(this);
          } catch(ex) {
            this.body = body;
            this.error = ex;
            reject(this);
          }
        };

        xhr.send(data);
      });
    }).then(()=>{
      return resolvePipelets(this.pipelets.after || [], this);
    }).then(()=>{
      return this;
    }).then(filterSuccess());
  }
}
