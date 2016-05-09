import {default as Body, convertBody} from './body.js';
import def from './def.js';
import Headers from './headers.js';

function match(ct) {
  if(!ct) {
    return null;
  }
  let key = Object.keys(def.autoMap).find(key=>ct.startsWith(key));
  return key ? def.autoMap[key] : null;
}

class Response extends Body {

  constructor(body, {status,statusText,headers,url,pajax,error,request}={}) {
    super();
    this._body = body;
    this.type = 'default'
    this.status = status;
    this.statusText = statusText;
    this.headers = new Headers(headers);
    this.url = url;
    this.pajax = pajax;
    this.request = request;
    this.error = error || undefined;
  }

  get ok() {
    // Success: status between 200 and 299
    // Failure: status below 200 or beyond 299
    return (this.status >= 200 && this.status < 300);
  }

  clone() {
    return new this.constructor(this._body, {
      status: this.status,
      statusText: this.statusText,
      headers: new Headers(this.headers),
      url: this.url,
      pajax: this.pajax,
      request: this.request,
      error: this.error
    });
  }

  // autoconverts body based on the the response's contentType
  // dataType is determined in the following order
  // - if the response is a blob, by the blobs content type
  // - content type in the response header
  auto() {
    return this.consumeBody().then(body=>{
      let dataType;
      if(typeof Blob!=='undefined' && Blob.prototype.isPrototypeOf(body)) {
        dataType = match(body.type);
      } else if(this.headers.get('content-type')){
        let contentType = this.headers.get('content-type').split(/ *; */).shift();
        dataType = match(contentType);
      }

      if(dataType) {
        return convertBody(body, dataType).catch(err=>{
          // Set error and reject the response when convertion fails
          this.error = err;
          return Promise.reject(this);
        });
      } else {
        return Promise.resolve(body);
      }
    });
  }
}

export default Response;
