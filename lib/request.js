import Body from './body.js';
import {checkStatus} from './pipelets.js';
import fetch from './fetch.js';
import def from './def.js';
import options from './options.js';

function extractOptions(req) {
  // Extract the request options from the request
  let init = {};
  const assign = def.request.assign;
  Object.keys(assign).forEach(key=>{
    let prop = typeof assign[key]==='string' ? assign[key] : key;
    if(req[prop]!==undefined) {
      init[key] = req[prop];
    }
  });
  return init;
}

class Request extends Body {
  constructor(url, init) {
    super();
    Object.assign(this, def.operators);

    if(url instanceof Request) {
      // Second parameter is overridden when a req object is provided
      init = extractOptions(url);
      url = url.url;
    }

    // prioritize init.url over url
    this.url = url

    // Assign request options
    const assign = def.request.assign;
    Object.keys(init).forEach(key=>{
      if(init[key]!==undefined) {
        let prop = typeof assign[key]==='string' ? assign[key] : key;
        this[prop] = init[key];
      }
    });
  }
  clone() {
    return new this.constructor(this);
  }
  spawn(init) {
    init = options(extractOptions(this), init);
    return new this.constructor(this.url, init);
  }
  checkStatus() {
    return this.after(checkStatus);
  }
  fetch() {
    return fetch(this);
  }
  _csfetch(method) {
    return this.spawn({
      method,
      after: checkStatus
    }).fetch();
  }
  get() {
    return this._csfetch('GET');
  }
  getAuto() {
    return this._csfetch('GET').then(res=>res.auto());
  }
  getJSON() {
    return this._csfetch('GET').then(res=>res.json());
  }
  getText() {
    return this._csfetch('GET').then(res=>res.text());
  }
  getBlob() {
    return this._csfetch('GET').then(res=>res.blob());
  }
  getArrayBuffer() {
    return this._csfetch('GET').then(res=>res.arrayBuffer());
  }
  getFormData() {
    return this._csfetch('GET').then(res=>res.formData());
  }
  delete() {
    return this._csfetch('DELETE');
  }
  post() {
    return this._csfetch('POST');
  }
  put() {
    return this._csfetch('PUT');
  }
  patch() {
    return this._csfetch('PATCH');
  }
}

export default Request;
