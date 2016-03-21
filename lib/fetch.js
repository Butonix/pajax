import Request from './request.js';
import Response from './response.js';
import Headers from './headers.js';
import {checkStatus} from './pipelets.js';
import def from './def.js';

export default function fetch(url, init) {
  let req;
  if (url instanceof Request) {
    req = url;
  } else {
    req = new Request(url, init);
  }

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

  let reqPipelets = req.pipelets || {};

  function pipe(handler, o) {
    let chain = Promise.resolve(o);
    // Merge Pajax and request pipelets
    let pipelets = [...def.pipelets[handler], ...(reqPipelets[handler] || [])];
    pipelets.forEach(pipelet=>{
      // chain together
      chain = chain.then(o=>{
        // Resolve the return value of the pipelet
        return Promise.all([pipelet(o), o]);
      }).then(([init,o])=>{
        // Requests can be manipulated in the before handler
        if(handler==='before') {
          // Create a new requests with the return value of the pipelet
          if(typeof init==='object' && init && o instanceof Request) {
            return o.clone(init);
          } else if(init instanceof Request) {
            return init;
          }
        }
        return o;
      });
    });
    return chain;
  }

  // Resolve before pipelets
  let promise = pipe('before', req).then((req)=>{
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

      let xhrOnLoad = () => {
        return () => {
          let headers = new Headers(xhr.getAllResponseHeaders());
          let resBody = (!('response' in xhr)) ? xhr.responseText : xhr.response;

          let resInit = {
            headers,
            status: xhr.status,
            statusText: xhr.statusText,
            dataType: req.dataType,
            pajax: req.pajax,
            url
          };

          let ResponseCtor = req.Response || Response;
          resolve(new ResponseCtor(resBody, resInit));
        }
      };

      let xhrOnError = (error) => {
        return () => {
          let resInit = {
            status: xhr.status,
            statusText: xhr.statusText,
            dataType: req.dataType,
            pajax: req.pajax,
            url,
            error
          };
          let ResponseCtor = req.Response || Response;
          resolve(new ResponseCtor(null, resInit));
        }
      };

      // Callback for document loaded.
      onLoad = xhrOnLoad();
      xhr.addEventListener('load', onLoad);

      // Callback for network errors.
      onError = xhrOnError('Network error');
      xhr.addEventListener('error', onLoad);

      // Callback for timeouts
      onTimeout = xhrOnError('Timeout');
      xhr.addEventListener('timeout', onTimeout);

      let contentType = req.contentType;

      req.consumeBody().then(reqBody=>{
        // Fallback to json if body is object and no content type is set
        if(typeof reqBody==='object' && reqBody && !contentType) {
          contentType = 'application/json';
          return req.text();
        } else {
          return Promise.resolve(reqBody);
        }
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
        reject('Invalid request body');
      });
    });
  }).then(res=>{
    // Resolve after pipelets
    return pipe('after', res)
  }, res=>{
    // Resolve after pipelets and reject afterwards
    return pipe('after', res).then(res=>{
      return Promise.reject(res);
    });
  }).then(res=>{
    // Resolve or reject based on error
    if(res.error) {
      return Promise.reject(res);
    } else {
      return Promise.resolve(res);
    }
  }).then(res=>{
    // Still not rejected? Resolve afterSuccess
    return pipe('afterSuccess', res)
  }, res=>{
    if(res instanceof Response) {
      // When any pipelet rejects with a response object
      // resolve the afterFailure pipelets but still reject
      return pipe('afterFailure', res).then(res=>{
        return Promise.reject(res);
      });
    } else {
      // Otherwise just pass through the error
      return Promise.reject(res);
    }
  });

  // Decorate promise with abort() method
  promise.abort = abort;
  return promise;
}
