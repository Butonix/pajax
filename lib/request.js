import Body from './body.js';
import {checkStatus} from './pipelets.js';
import fetch from './fetch.js';
import operators from './operators.js';
import def from './def.js';

function drawInit(req) {
  let init = {};
  // Assign request options
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
    if(url instanceof Request) {
      init = drawInit(url);
    } else if(typeof url==='string'){
      this.assign({url});
    }
    this.assign(init);
  }
  assign(init = {}) {
    // Assign request options
    const assign = def.request.assign;
    const merge = def.request.merge;
    Object.keys(init).forEach(key=>{
      if(init[key]!==undefined) {
        let prop = typeof assign[key]==='string' ? assign[key] : key;
        if(typeof merge[key]==='function') {
          this[key] = merge[key](init[key], this[prop]);
        } else {
          this[prop] = init[key];
        }
      }
    });
    return this;
  }
  clone(init) {
    return new this.constructor(this).assign(init);
  }
  spawn(url, init) {
    let req = new this.constructor(this);
    if(url instanceof Request) {
      init = drawInit(url);
    } else if(typeof url==='string'){
      req.assign({url});
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
