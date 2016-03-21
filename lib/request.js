import Body from './body.js';
import {checkStatus} from './pipelets.js';
import fetch from './fetch.js';
import operators from './operators.js';
import def from './def.js';
import join from './join.js';

class Request extends Body {
  constructor(url, ...inits) {
    super();
    let init;
    if(url instanceof Request) {
      init = join(url.probe());
      url = url.url;
    } else {
      init = join(...inits);
    }

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
  clone(init) {
    return new this.constructor(this.url, this.probe(), init);
  }
  checkStatus() {
    return this.after(checkStatus());
  }
  probe() {
    // Draws the request options from the request
    let init = {};
    const assign = def.request.assign;
    Object.keys(assign).forEach(key=>{
      let prop = typeof assign[key]==='string' ? assign[key] : key;
      if(this[prop]!==undefined) {
        init[key] = this[prop];
      }
    });
    return join(init);
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
