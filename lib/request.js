import Body from './body.js';
import { checkStatus } from './check-status.js';
import fetch from './fetch.js';
import def from './def.js';
import operators from './operators.js';

// Extract init from request object
function extractInit(req) {
  let init = {};
  const request = def.request;
  Object.keys(request).forEach(key=>{
    let prop = request[key].assign || key;
    if(req[prop]!==undefined) {
      init[key] = req[prop];
    }
  });
  return init;
}

// Merges multiple request options
// The result object is independent of the source options
export default function options(inits) {
  inits = Array.isArray(inits) ? inits : [inits];
  let result = {};
  const request = def.request;
  inits.forEach(init=>{
    Object.keys(init || {}).forEach(key=>{
      if(request[key] && init[key]!==undefined) {
        // Merge options
        if(request[key] && request[key].merge) {
          result[key] = request[key].merge(result[key], init[key]);
        } else {
          result[key] = init[key];
        }
      }
    });
  });
  return result;
}

class Request extends Body {
  constructor(url, init, pajax=null) {
    super();

    if(url instanceof Request) {
      let inits = Array.isArray(init) ? init : [init];
      // Extract the request options from the request
      init = [extractInit(url), ...inits];
      url = url.url;
      pajax = url.pajax || pajax;
    }

    init = options(init);

    // Assign pajax factory
    this.pajax = pajax;
    // prioritize init.url over url
    this.url = url
    // Assign request options
    const request = def.request;
    Object.keys(request).forEach(key=>{
      let prop = request[key].assign || key;
      if(init[key]!==undefined) {
        this[prop] = init[key];
      } else if(request[key].default) {
        this[prop] = request[key].default();
      }
    });
  }
  clone() {
    return this.fork();
  }
  fork(init) {
    return new this.constructor(this, init, this.pajax);
  }
  attach(body) {
    return this.fork({'body': body});
  }
  fetch() {
    return fetch(this);
  }
  get() {
    return fetch(this.as('GET')).then(checkStatus);
  }
  getAuto() {
    return fetch(this.as('GET')).then(checkStatus).then(res=>res.auto());
  }
  getJSON() {
    return fetch(this.as('GET')).then(checkStatus).then(res=>res.json());
  }
  getText() {
    return fetch(this.as('GET')).then(checkStatus).then(res=>res.text());
  }
  getBlob() {
    return fetch(this.as('GET')).then(checkStatus).then(res=>res.blob());
  }
  getArrayBuffer() {
    return fetch(this.as('GET')).then(checkStatus).then(res=>res.arrayBuffer());
  }
  getFormData() {
    return fetch(this.as('GET')).then(checkStatus).then(res=>res.formData());
  }
  delete() {
    return fetch(this.as('DELETE')).then(checkStatus);
  }
  post() {
    return fetch(this.as('POST')).then(checkStatus);
  }
  put() {
    return fetch(this.as('PUT')).then(checkStatus);
  }
  patch() {
    return fetch(this.as('PATCH')).then(checkStatus);
  }
}

operators(Request.prototype);

export default Request;
