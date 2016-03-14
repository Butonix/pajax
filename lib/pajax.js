import Request from './request.js';
import Response from './response.js';
import Headers from './headers.js';
import { checkStatus } from './pipelets.js';
import fetch from './fetch.js';
import def from './def.js';
import operators from './operators.js';

class Pajax {
  constructor(init) {
    let RequestCtor = this.constructor.Request || Request;
    let ResponseCtor = this.constructor.Response || Response;
    this.req = new RequestCtor(null, init, {Response: ResponseCtor});
  }
  get(url, init={}) {
    return this.request(url, init).is('GET').checkStatus().fetch().then(res=>res.auto());
  }
  delete(url, init={}) {
    return this.request(url, init).is('DELETE').checkStatus().fetch().then(res=>res.auto());
  }
  post(url, body, init={}) {
    return this.request(url, init).is('POST').attach(body).checkStatus().fetch().then(res=>res.auto());
  }
  put(url, body, init={}) {
    return this.request(url, init).is('PUT').attach(body).checkStatus().fetch().then(res=>res.auto());
  }
  patch(url, body, init={}) {
    return this.request(url, init).is('PATCH').attach(body).checkStatus().fetch().then(res=>res.auto());
  }
  request(url, init) {
    // Merge defaults
    return this.req.spawn(url, init);
  }
  fetch(url, init) {
    // Merge defaults
    return fetch(this.req.spawn(url, init));
  }
  clone(init) {
    return new this.constructor(this.req.clone(init));
  }
  JSON(force) {
    const ct = 'application/json';
    return this.header('Accept', ct).asJSON();
  }
  static fetch(...args) {
    return fetch(...args);
  }
  static request(...args) {
    return new Request(...args);
  }
  static get(...args) {
    return new this().get(...args);
  }
  static post(...args) {
    return new this().post(...args);
  }
  static put(...args) {
    return new this().put(...args);
  }
  static delete(...args) {
    return new this().delete(...args);
  }
  static patch(...args) {
    return new this().patch(...args);
  }
  static checkStatus(...args) {
    return checkStatus(...args);
  }
}

Object.assign(Pajax.prototype, operators);

Pajax.def = def;
Pajax.Headers = Headers;
Pajax.Request = Request;
Pajax.Response = Response;

export default Pajax;
