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
  constructor(url, init, ...preInits) {
    super();
    Object.assign(this, def.operators);

    if(url instanceof Request) {
      // Second parameter is overridden when a req object is provided
      init = extractOptions(url);
      url = url.url;
    }

    init = options(...preInits, init);

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
    return new this.constructor(this.url, init, extractOptions(this));
  }
  checkStatus() {
    return this.after(checkStatus);
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

export default Request;
