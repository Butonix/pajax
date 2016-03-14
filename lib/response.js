import {default as Body, prepare} from './body.js';
import def from './def.js';

function match(ct) {
  if(!ct) {
    return null;
  }
  let key = Object.keys(def.dataTypeMap).find(key=>ct.startsWith(key));
  return key ? def.dataTypeMap[key] : null;
}

class Response extends Body {

  constructor(body, {status,statusText,headers,url,error,dataType}={}) {
    super();
    this.body = body;
    this.status = status;
    this.statusText = statusText;
    this.headers = headers;
    this.url = url;
    this.error = error || null;
    this.dataType = dataType;
  }

  get ok() {
    // Success: status between 200 and 299 or 304
    // Failure: status below 200 or beyond 299 excluding 304
    return (this.status >= 200 && this.status < 300) || this.status===304;
  }

  clone() {
    return new this.constructor(this.body, {
      status: this.status,
      statusText: this.statusText,
      headers: this.headers,
      url: this.url,
      error: this.error,
      dataType: this.dataType
    });
  }

  // autoconverts body based on the dataType or the response's contentType
  // dataType is determined in the following order
  // - the dataType field on a request
  // - if the response is a blob, by the blobs content type
  // - content type in the response header
  auto() {
    let dataType;
    if(this.dataType) {
      dataType = this.dataType;
    } else if(Blob.prototype.isPrototypeOf(this.body)) {
      dataType = match(this.body.type);
    } else if(this.headers.get('content-type')){
      let contentType = this.headers.get('content-type').split(/ *; */).shift();
      dataType = match(contentType);
    }

    if(dataType) {
      return this.convert(dataType).catch(err=>{
        // Set error and reject the response when convertion fails
        this.error = err;
        return Promise.reject(this);
      });
    } else {
      return Promise.resolve(this.body)
    }
  }
}

export default Response;
