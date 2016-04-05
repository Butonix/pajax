import Request from './request.js';
import Response from './response.js';
import Headers from './headers.js';
import def from './def.js';
import pipe from './pipe.js';

export default function fetch(url, init) {
  let req;
  if (url instanceof Request) {
    req = url;
  } else {
    req = new Request(url, init);
  }

  let pajax = req.pajax;

  // The XMLHttpRequest object is recreated at every request to defeat caching problems in IE
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
  let promise = pipe(pajax, 'before', req).then((req)=>{
    // Fetch request
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

      // Caching
      if(req.cache) {
        xhr.setRequestHeader('cache-control', req.cache);
      }

      // Use blob whenever possible
      if ('responseType' in xhr) {
        xhr.responseType = 'blob';
      }

      let xhrReady = (error) => {
        return () => {
          let headers = new Headers(xhr.getAllResponseHeaders());
          let resBody = (!('response' in xhr)) ? xhr.responseText : xhr.response;

          let resInit = {
            error,
            headers,
            status: xhr.status,
            statusText: xhr.statusText,
            pajax,
            request: req,
            url
          };

          let res = pajax ? pajax.response(resBody, resInit) : new Response(resBody, resInit);
          resolve(res);
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
        // Fallback to json if body is object and no content type is set
        if(typeof rawBody==='object' && rawBody && !contentType) {
          contentType = 'application/json';
        }
        let serializer = def.serializers[contentType];
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
    return pipe(pajax, 'after', res);
  }).then(res=>{
    // Resolve or reject based on error
    if(res.error) {
      return Promise.reject(res);
    } else {
      return Promise.resolve(res);
    }
  });

  // Decorate promise with abort() method
  promise.abort = abort;
  return promise;
}
