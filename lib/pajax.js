import Request from './request.js';
import Response from './response.js';
import Headers from './headers.js';
import { checkStatus } from './pipelets.js';
import fetch from './fetch.js';
import def from './def.js';
import options from './options.js';

class Pajax {
  constructor(...inits) {
    this.defaults = options(...inits);
    Object.assign(this, def.operators);
  }
  get(url, init={}) {
    return this.request(url, init).get();
  }
  getAuto(url, init={}) {
    return this.request(url, init).getAuto();
  }
  getJSON(url, init={}) {
    return this.request(url, init).getJSON();
  }
  getText(url, init={}) {
    return this.request(url, init).getText();
  }
  getBlob(url, init={}) {
    return this.request(url, init).getBlob();
  }
  getArrayBuffer(url, init={}) {
    return this.request(url, init).getArrayBuffer();
  }
  getFormData(url, init={}) {
    return this.request(url, init).getFormData();
  }
  delete(url, init={}) {
    return this.request(url, init).delete();
  }
  post(url, body, init={}) {
    return this.request(url, init).attach(body).post();
  }
  put(url, body, init={}) {
    return this.request(url, init).attach(body).put();
  }
  patch(url, body, init={}) {
    return this.request(url, init).attach(body).patch();
  }
  fetch(url, init) {
    return this.request(url, init).fetch();
  }
  request(url, init) {
    let RequestCtor = this.constructor.Request || Request;
    let ResponseCtor = this.constructor.Response || Response;
    // Use class defaults, instance defaults and factory/response
    return new RequestCtor(url, init, this.defaults, {
      pajax: this,
      Response: ResponseCtor
    });
  }
  spawn(url, init) {
    if(typeof url==='object') {
      init = url;
    }
    this.defaults = options(this.defaults, init);
    return this;
  }
  JSON() {
    const ct = 'application/json';
    return this.type(ct).header('Accept', ct);
  }
  URLEncoded() {
    const ct = 'application/x-www-form-urlencoded';
    return this.type(ct);
  }
  static get(...args) {
    return this.request(...args).get();
  }
  static getAuto(...args) {
    return this.request(...args).getAuto();
  }
  static getJSON(...args) {
    return this.request(...args).getJSON();
  }
  static getText(...args) {
    return this.request(...args).getText();
  }
  static getBlob(...args) {
    return this.request(...args).getBlob();
  }
  static getArrayBuffer(...args) {
    return this.request(...args).getArrayBuffer();
  }
  static getFormData(...args) {
    return this.request(...args).getFormData();
  }
  static post(...args) {
    return this.request(...args).post();
  }
  static put(...args) {
    return this.request(...args).put();
  }
  static delete(...args) {
    return this.request(...args).delete();
  }
  static patch(...args) {
    return this.request(...args).patch();
  }
  static fetch(...args) {
    return this.request(...args).fetch();
  }
  static request(...args) {
    return new this(this.defaults).request(...args);
  }
}

Pajax.options = options;
Pajax.checkStatus = checkStatus;
Pajax.def = def;
Pajax.Headers = Headers;
Pajax.Request = Request;
Pajax.Response = Response;

export default Pajax;
