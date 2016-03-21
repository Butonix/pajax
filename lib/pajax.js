import Request from './request.js';
import Response from './response.js';
import Headers from './headers.js';
import { checkStatus } from './pipelets.js';
import fetch from './fetch.js';
import def from './def.js';
import operators from './operators.js';
import join from './join.js';

class Pajax {
  constructor(...inits) {
    this.defaults = join(...inits);
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
    if(url instanceof Request) {
      init = url.probe();
      url = url.url;
    }

    let RequestCtor = this.constructor.Request || Request;
    // Merge defaults
    return new RequestCtor(url, this.defaults, init, {
      pajax: this,
      Response: this.constructor.Response || Response
    });
  }
  clone(init) {
    return new this.constructor(this.defaults, init);
  }
  JSON() {
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
  static getAuto(...args) {
    return new this().getAuto(...args);
  }
  static getJSON(...args) {
    return new this().getJSON(...args);
  }
  static getText(...args) {
    return new this().getText(...args);
  }
  static getBlob(...args) {
    return new this().getBlob(...args);
  }
  static getArrayBuffer(...args) {
    return new this().getArrayBuffer(...args);
  }
  static getFormData(...args) {
    return new this().getFormData(...args);
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
