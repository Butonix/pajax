import Body from './body.js';
import {checkStatus} from './pipelets.js';
import fetch from './fetch.js';
import operators from './operators.js';
import def from './def.js';

class Request extends Body {
  constructor(url, init) {
    super();

    if(url instanceof Request) {
      this.url = url.url;
      this.assign(url);
    } else if(typeof url==='string'){
      this.url = url;
    }
    if(typeof init==='object') {
      this.assign(init);
    }
  }
  assign(init = {}) {
    // Assign request options
    const options = def.request;
    Object.keys(options).forEach(key=>{
      if(typeof options[key]==='function') {
        this[key] = options[key](init[key], this[key]);
      } else if(init[key]) {
        this[key] = init[key];
      }
    });
    return this;
  }
  clone(init) {
    return new this.constructor(this, init);
  }
  spawn(url, init) {
    let req = new this.constructor(this);
    if(url instanceof Request) {
      req.assign(url);
    } else if(typeof url==='string'){
      req.url = url;
      return req.assign(init);
    }
    return req.assign(init);
  }
  checkStatus() {
    return this.after(checkStatus());
  }
  fetch() {
    return fetch(this);
  }
  get() {
    return this.is('GET').checkStatus().fetch();
  }
  getAuto() {
    return this.is('GET').checkStatus().fetch().then(res=>res.auto());
  }
  getJSON() {
    return this.is('GET').checkStatus().fetch().then(res=>res.json());
  }
  getText() {
    return this.is('GET').checkStatus().fetch().then(res=>res.text());
  }
  getBlob() {
    return this.is('GET').checkStatus().fetch().then(res=>res.blob());
  }
  getArrayBuffer() {
    return this.is('GET').checkStatus().fetch().then(res=>res.arrayBuffer());
  }
  getFormData() {
    return this.is('GET').checkStatus().fetch().then(res=>res.formData());
  }
  delete() {
    return this.is('DELETE').checkStatus().fetch();
  }
  post() {
    return this.is('POST').checkStatus().fetch();
  }
  put() {
    return this.is('PUT').checkStatus().fetch();
  }
  patch() {
    return this.is('PATCH').checkStatus().fetch();
  }
}

Object.assign(Request.prototype, operators);

export default Request;
