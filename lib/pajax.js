import Request from './request.js';
import Response from './response.js';
import Headers from './headers.js';
import Body from './body.js';
import { checkStatus } from './check-status.js';
import def from './def.js';
import operators from './operators.js';

class Pajax {
  constructor(init, ...defaults) {
    // Store init always as an array
    this.inits = [].concat(init);
    this.defaults = defaults;
  }
  // Creates init array by merging pajax inits, defaults and provided inits
  options(...inits) {
    return [...this.defaults, ...this.inits, ...inits]
           .filter(init=>init!==undefined); // filter undefined inits
  }
  // Return specific options
  option(key, ...inits) {
    return this.options(...inits).map(init=>init[key]).filter(R=>R!==undefined).pop();
  }
  // Creates a request instance
  request(url, init) {
    // Merge class defaults
    init = this.options(init);
    // Determines the Request class
    let RequestCtor = this.option('Request') || Request;
    return new RequestCtor(url, init, this);
  }
  // Resolves global and pajax pipelets
  pipe(handler, result) {
    let pipe$ = Promise.resolve(result);
    // Draw pipelets from options
    let pipelets = this.options().map(init=>init[handler]);
    // Flatten and filter the pipelets
    pipelets = [].concat(...pipelets).filter(func=>{
      return typeof func==='function';
    });
    // Merge global and pajax pipelets
    pipelets = [...def.pipelets[handler], ...pipelets];

    pipelets.forEach(pipelet=>{
      // chain together
      if(typeof pipelet==='function') {
        pipe$ = pipe$.then(result=>{
          // Resolve the return value of the pipelet
          return Promise.all([pipelet(result), result]);
        }).then(([init,result])=>{
          if(handler==='before') {
            // Requests can be manipulated or switched in the before handler
            if(init instanceof Request) {
              return init;
            } else if(typeof init==='object' && init && result instanceof Request) {
              // Create a new requests with the return value of the pipelet
              return result.fork(init);
            }
          } else if(handler==='after') {
            // Responses can be switches in the after handler
            if(init instanceof Response) {
              return init;
            }
          }
          return result;
        });
      }
    });
    return pipe$;
  }
  // Extended fetch()
  fetch(url, init) {
    let req;
    if (url instanceof Request) {
      req = url;
    } else {
      req = this.request(url, init);
    }

    // The XMLHttpRequest object is recreated on every request to defeat caching problems in IE
    let xhr;
    try { xhr = new XMLHttpRequest(); } catch (e) {
      throw 'Could not create XMLHttpRequest object';
    }

    let onLoad;
    let onError;
    let onTimeout;
    let aborted = false;

    function abort() {
      if(onLoad) xhr.removeEventListener('load', onLoad);
      if(onError) xhr.removeEventListener('error', onError);
      if(onTimeout) xhr.removeEventListener('timeout', onTimeout);
      aborted = true;
      xhr.abort();
    }

    // Resolve before pipelets
    let fetch$ = this.pipe('before', req).then((req)=>{
      // Do the xhr request
      return new Promise((resolve, reject) => {
        let url = req.url;

        if(typeof url!=='string') {
          throw 'URL required for request';
        }

        let method = req.method || 'GET';

        xhr.open(method, url, true);

        // Add custom headers
        if(req.headers) {
          req.headers.keys().forEach(key=>{
            xhr.setRequestHeader(key, req.headers.get(key));
          });
        }

        // Register upload progress listener
        if(req.progress && xhr.upload) {
          xhr.upload.addEventListener('progress', (...args)=> {
            req.progress(req, ...args);
          }, false);
        }

        // Set the timeout
        if(typeof req.timeout==='number') {
          xhr.timeout = req.timeout;
        }

        // Set credentials
        if(req.credentials==='include') {
          xhr.withCredentials = true;
        }

        // Caching
        if(req.cache) {
          xhr.setRequestHeader('cache-control', req.cache);
        }

        // Use blob whenever possible
        if ('responseType' in xhr && typeof Blob!=='undefined') {
          xhr.responseType = 'blob';
        }

        let xhrReady = (error) => {
          return () => {
            let resBody = (!('response' in xhr)) ? xhr.responseText : xhr.response;

            // Determines the Response class
            let ResponseCtor = this.option('Response') || Response;
            resolve(new ResponseCtor(resBody, {
              error,
              headers: xhr.getAllResponseHeaders(),
              status: xhr.status,
              statusText: xhr.statusText,
              pajax: this,
              request: req,
              url
            }));
          }
        };

        // Callback for document loaded.
        onLoad = xhrReady();
        xhr.addEventListener('load', onLoad);

        // Callback for network errors.
        onError = xhrReady('Network error');
        xhr.addEventListener('error', onError);

        // Callback for timeouts
        onTimeout = xhrReady('Timeout');
        xhr.addEventListener('timeout', onTimeout);

        let contentType = req.contentType;

        req.consumeBody().then(rawBody=>{
          if(rawBody===undefined) {
            return undefined;
          } else if(rawBody &&
             typeof rawBody==='object' &&
             !(rawBody instanceof FormData) &&
             contentType===undefined) {
            // Fallback to json if body is object (excluding formData) and no content type is set
            contentType = 'application/json';
          }
          let serializer = !!contentType && def.serializers[contentType];
          return serializer ? serializer(rawBody) : rawBody;
        }).then(reqBody=>{
          // Add content type header only when body is attached
          if(reqBody!==undefined && contentType) {
            xhr.setRequestHeader('Content-Type', contentType);
          }

          // Don't even call send() if already aborted
          if(aborted) {
            return;
          }
          xhr.send(reqBody);
        }, err=>{
          xhrReady('Cannot serialize body')();
        });
      });
    }).then(res=>{
      // Resolve after pipelets
      return this.pipe('after', res);
    }).then(res=>{
      // Resolve or reject based on error
      if(res.error) {
        return Promise.reject(res);
      } else {
        return Promise.resolve(res);
      }
    });

    // Decorate promise with abort() method
    fetch$.abort = abort;
    return fetch$;
  }

  // pajax pipelets
  before(func) {
    return this.fork({before:[func]});
  }
  after(func) {
    return this.fork({after:[func]});
  }
  clone() {
    return this.fork();
  }
  fork(init) {
    return new this.constructor([...this.inits, init]);
  }
  JSON() {
    const ct = 'application/json';
    return this.type(ct).accept(ct);
  }
  URLEncoded() {
    const ct = 'application/x-www-form-urlencoded';
    return this.type(ct);
  }
  // ===

  // Request helpers
  get(url, init={}) {
    return this.request(url, init).get();
  }
  getAuto(url, init={}) {
    return this.request(url, init).getAuto();
  }
  getJSON(url, init={}) {
    return this.request(url, init).getJSON();
  }
  getText(url, init={}) {
    return this.request(url, init).getText();
  }
  getBlob(url, init={}) {
    return this.request(url, init).getBlob();
  }
  getArrayBuffer(url, init={}) {
    return this.request(url, init).getArrayBuffer();
  }
  getFormData(url, init={}) {
    return this.request(url, init).getFormData();
  }
  delete(url, init={}) {
    return this.request(url, init).delete();
  }
  post(url, body, init={}) {
    return this.request(url, init).attach(body).post();
  }
  put(url, body, init={}) {
    return this.request(url, init).attach(body).put();
  }
  patch(url, body, init={}) {
    return this.request(url, init).attach(body).patch();
  }
  static get(url, init={}) {
    return this.request(url, init).get();
  }
  static getAuto(url, init={}) {
    return this.request(url, init).getAuto();
  }
  static getJSON(url, init={}) {
    return this.request(url, init).getJSON();
  }
  static getText(url, init={}) {
    return this.request(url, init).getText();
  }
  static getBlob(url, init={}) {
    return this.request(url, init).getBlob();
  }
  static getArrayBuffer(url, init={}) {
    return this.request(url, init).getArrayBuffer();
  }
  static getFormData(url, init={}) {
    return this.request(url, init).getFormData();
  }
  static delete(url, init={}) {
    return this.request(url, init).delete();
  }
  static post(url, body, init={}) {
    return this.request(url, init).attach(body).post();
  }
  static put(url, body, init={}) {
    return this.request(url, init).attach(body).put();
  }
  static patch(url, body, init={}) {
    return this.request(url, init).attach(body).patch();
  }
  static request(url, init) {
    return new Pajax().request(url, init);
  }
  static fetch(url, init) {
    return new Pajax().fetch(url, init);
  }
  // ===
}

operators(Pajax.prototype);

Pajax.checkStatus = checkStatus;
Pajax.def = def;
Pajax.Headers = Headers;
Pajax.Body = Body;
Pajax.Request = Request;
Pajax.Response = Response;

export default Pajax;
