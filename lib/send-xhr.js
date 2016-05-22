import def from './def.js';
import Response from './response.js';

export default function(req) {
  // The XMLHttpRequest object is recreated on every request to defeat caching problems in IE
  let xhr;
  try { xhr = new XMLHttpRequest(); } catch (e) {
    throw 'Could not create XMLHttpRequest object';
  }

  let onLoad;
  let onError;
  let onTimeout;
  let aborted = false;

  let abort = () => {
    if(onLoad) xhr.removeEventListener('load', onLoad);
    if(onError) xhr.removeEventListener('error', onError);
    if(onTimeout) xhr.removeEventListener('timeout', onTimeout);
    aborted = true;
    xhr.abort();
  };

  let pajax = req.pajax;

  let beforePipe$ = pajax ? pajax.pipe('before', req) : Promise.resolve(req);

  // Resolve before pipelets
  let fetch$ = beforePipe$.then((req)=>{
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
          let ResponseCtor = (pajax && pajax.option('Response')) || Response;

          let res = new ResponseCtor(resBody, {
            error,
            headers: xhr.getAllResponseHeaders(),
            status: xhr.status,
            statusText: xhr.statusText,
            pajax,
            request: req,
            url
          });

          if(!req.noStatusCheck && !res.error && !res.ok) {
            res.error = res.statusText || 'Request failed';
          }

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
    return pajax ? pajax.pipe('after', res) : Promise.resolve(res);
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
