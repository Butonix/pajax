import Body from './body.js';
import { checkStatus } from './check-status.js';
import def from './def.js';
import operators from './operators.js';
import send from './send.js';

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
export default function options(...inits) {
  let result = {};
  const request = def.request;
  inits.forEach(init=>{
    if(typeof init==='object' && init) {
      Object.keys(init).forEach(key=>{
        if(request[key] && init[key]!==undefined) {
          // Merge options
          if(request[key] && request[key].merge) {
            result[key] = request[key].merge(result[key], init[key]);
          } else {
            result[key] = init[key];
          }
        }
      });
    }
  });
  return result;
}

class Request extends Body {
  constructor(url, inits, pajax=null) {
    super();

    if(url instanceof Request) {
      // Extract the request options from the request and
      inits = [].concat(extractInit(url), inits);
      pajax = url.pajax || pajax;
      url = url.url;
    }
    // make sure inits is an array
    inits = [].concat(inits);

    // Convert init array into single init object
    let init = options(...inits);

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
  as(method) {
    return this.fork({'method': method});
  }
  noCheck(noCheck) {
    return this.fork({'noStatusCheck': noCheck===false ? false : true});
  }
  send() {
    return send(this);
  }
  fetch() {
    return this.noCheck().send();
  }
  get() {
    return this.as('GET').send();
  }
  getAuto() {
    return this.as('GET').send().then(res=>res.auto());
  }
  getJSON() {
    return this.as('GET').send().then(res=>res.json());
  }
  getText() {
    return this.as('GET').send().then(res=>res.text());
  }
  getBlob() {
    return this.as('GET').send().then(res=>res.blob());
  }
  getArrayBuffer() {
    return this.as('GET').send().then(res=>res.arrayBuffer());
  }
  getFormData() {
    return this.as('GET').send().then(res=>res.formData());
  }
  delete() {
    return this.as('DELETE').send();
  }
  post() {
    return this.as('POST').send();
  }
  put() {
    return this.as('PUT').send();
  }
  patch() {
    return this.as('PATCH').send();
  }
}

operators(Request.prototype);

export default Request;
