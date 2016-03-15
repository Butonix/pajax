import Body from './body.js';
import {checkStatus} from './pipelets.js';
import fetch from './fetch.js';
import operators from './operators.js';
import def from './def.js';

class Request extends Body {
  constructor(url, ...inits) {
    super();

    if(url instanceof Request) {
      this.url = url.url;
      inits = [url, ...inits];
    } else if(typeof url==='string'){
      this.url = url;
    }

    // Assign request options
    const options = def.request;
    inits.forEach(init=>{
      init = init || {};
      Object.keys(options).forEach(key=>{
        if(typeof options[key]==='function') {
          this[key] = options[key](init[key], this[key]);
        } else if(init[key]) {
          this[key] = init[key];
        }
      })
    });
  }
  clone(init) {
    return new this.constructor(this, init);
  }
  spawn(url, init) {
    if(url instanceof Request) {
      return new this.constructor(this, url);
    } else {
      return new this.constructor(url, this, init);
    }
  }
  checkStatus() {
    return this.after(checkStatus());
  }
  fetch() {
    return fetch(this);
  }
  get() {
    return this.is('GET').checkStatus().fetch().then(res=>res.auto());
  }
  delete() {
    return this.is('DELETE').checkStatus().fetch().then(res=>res.auto());
  }
  post() {
    return this.is('POST').checkStatus().fetch().then(res=>res.auto());
  }
  put() {
    return this.is('PUT').checkStatus().fetch().then(res=>res.auto());
  }
  patch() {
    return this.is('PATCH').checkStatus().fetch().then(res=>res.auto());
  }
}

Object.assign(Request.prototype, operators);

export default Request;
