import Request from './request.js';
import Response from './response.js';
import convert from './convert.js';
import Headers from './headers.js';

function resolvePipelets(pipelets, o) {
  let pipe = Promise.resolve(o);
  (pipelets || []).forEach(pipelet=>{
    // chain together
    pipe = pipe.then(pipelet);
  });
  return pipe;
}

export default function fetch(url, init, {factory}={}) {
  let RequestCtor = (factory && factory.constructor.Request) || Request;
  let ResponseCtor = (factory && factory.constructor.Response) || Response;

  let req;
  if (url instanceof Request) {
    req = url;
  } else {
    req = new RequestCtor(url, init, {factory});
  }

  // The XMLHttpRequest object is recreated at every request to defeat caching problems in IE
  let xhr;
  try { xhr = new XMLHttpRequest(); } catch (e) {
    throw 'Could not create XMLHttpRequest object';
  }

  let beforePipelets = (req.pipelets || {}).before;
  let afterPipelets;
  let afterSuccessPipelets;
  let afterFailurePipelets;

  // Resolve before pipelets
  return resolvePipelets(beforePipelets, req).then((req)=>{

    afterPipelets = (req.pipelets || {}).after;
    afterSuccessPipelets = (req.pipelets || {}).afterSuccess;
    afterFailurePipelets = (req.pipelets || {}).afterFailure;

    return new Promise((resolve, reject) => {
      let url = req.url;

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

      // Use blob whenever possible
      if ('responseType' in xhr) {
        xhr.responseType = 'blob';
      }

      let xhrCallback = (error) => {
        let headers = new Headers(xhr.getAllResponseHeaders());
        let resBody = (!('response' in xhr)) ? xhr.responseText : xhr.response;

        let resInit = {
          headers,
          status: xhr.status,
          statusText: xhr.statusText
        };

        let convertResponse = typeof req.convertResponse==='boolean' ? convertResponse : true;

        let resBodyP;
        if(convertResponse) {
          // Auto convert response using the content type
          let contentType;
          if(req.responseContentType) {
            contentType = req.responseContentType;
          } else if(Blob.prototype.isPrototypeOf(resBody)) {
            contentType = resBody.type;
          } else if(headers['content-type']){
            contentType = headers['content-type'].split(/ *; */).shift();
          }
          resBodyP = convert.response(resBody, contentType);
        } else {
          resBodyP = Promise.resolve(resBody)
        }

        return resBodyP.then(body=>{
          resolve(new ResponseCtor(body, resInit, {xhr,req,factory}));
        }, error=>{
          reject(new ResponseCtor(resBody, resInit, {xhr,req,factory,error}));
        });
      };

      let convertRequest = typeof req.convertRequest==='boolean' ? convertRequest : true;
      let contentType = req.contentType;

      let reqBodyP;
      if(convertRequest) {
        // Auto convert requests using body's content type
        // Fallback to json if body is object and no content type is set
        if(!contentType && req.body && typeof req.body==='object') {
          contentType = 'application/json';
        }
        reqBodyP = convert.request(req.body, contentType);
      } else {
        reqBodyP = Promise.resolve(req.body);
      }

      reqBodyP.then(reqBody=>{

        // Add content type header only when body is attached
        if(reqBody!==undefined && contentType) {
          xhr.setRequestHeader('Content-Type', contentType);
        }

        // Callback for errors
        xhr.onerror = () => {
          xhrCallback('Network error');
        };

        // Callback for timeouts
        xhr.ontimeout = () => {
          xhrCallback('Timeout');
        };

        // Callback for document loaded.
        xhr.onload = () => {
          xhrCallback();
        };

        xhr.send(reqBody);
      }, err=>{
        xhrCallback('Invalid request body');
      });
    });
  }).then(res=>{
    // Resolve after pipelets
    return resolvePipelets(afterPipelets, res);
  }, res=>{
    // Resolve after pipelets and reject afterwars
    return resolvePipelets(afterPipelets, res).then(res=>{
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
    return resolvePipelets(afterSuccessPipelets, res);
  }, res=>{
    if(res instanceof Response) {
      // When any pipelet rejects with a response object
      // resolve the afterFailure pipelets but still reject
      return resolvePipelets(afterFailurePipelets, res).then(res=>{
        return Promise.reject(res);
      });
    } else {
      // Otherwise just pass through the error
      return Promise.reject(res);
    }
  });
}
