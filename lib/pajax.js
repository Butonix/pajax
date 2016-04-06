import Request from './request.js';
import Response from './response.js';
import Headers from './headers.js';
import { checkStatus } from './check-status.js';
import fetch from './fetch.js';
import def from './def.js';
import operators from './operators.js';

class Pajax {
  constructor(init, defaults = {}) {
    // Store init always as an array
    this.inits = [].concat(init);
    this.defaults = defaults;
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
    // Merge class defaults, inits with init
    init = [].concat(this.defaults, this.inits, init);
    return new RequestCtor(url, init, this);
  }
  response(body, init) {
    let ResponseCtor = this.constructor.Response || Response;
    return new ResponseCtor(body, init, this);
  }
  getPipelets(handler) {
    // Merge class defaults and init pipelets
    let pipelets = [this.defaults, ...this.inits].map(init=>{
      return init && init[handler];
    });
    // flatten and filter the pipelets
    return [].concat(...pipelets).filter(func=>{
      return typeof func==='function';
    });
  }
  before(func) {
    return this.fork({before:[func]});
  }
  after(func) {
    return this.fork({after:[func]});
  }
  clone() {
    return this.fork();
  }
  fork(init) {
    return new this.constructor([...this.inits, init]);
  }
  JSON() {
    const ct = 'application/json';
    return this.type(ct).accept(ct);
  }
  URLEncoded() {
    const ct = 'application/x-www-form-urlencoded';
    return this.type(ct);
  }
  static get(url, init={}) {
    return this.request(url, init).get();
  }
  static getAuto(url, init={}) {
    return this.request(url, init).getAuto();
  }
  static getJSON(url, init={}) {
    return this.request(url, init).getJSON();
  }
  static getText(url, init={}) {
    return this.request(url, init).getText();
  }
  static getBlob(url, init={}) {
    return this.request(url, init).getBlob();
  }
  static getArrayBuffer(url, init={}) {
    return this.request(url, init).getArrayBuffer();
  }
  static getFormData(url, init={}) {
    return this.request(url, init).getFormData();
  }
  static delete(url, init={}) {
    return this.request(url, init).delete();
  }
  static post(url, body, init={}) {
    return this.request(url, init).attach(body).post();
  }
  static put(url, body, init={}) {
    return this.request(url, init).attach(body).put();
  }
  static patch(url, body, init={}) {
    return this.request(url, init).attach(body).patch();
  }
  static fetch(url, init) {
    return fetch(url, init);
  }
  static request(url, init) {
    let RequestCtor = this.Request || Request;
    return new RequestCtor(url, init);
  }
  static response(body, init) {
    let ResponseCtor = this.Response || Response;
    return new ResponseCtor(body, init, this);
  }
}

operators(Pajax.prototype);

Pajax.checkStatus = checkStatus;
Pajax.def = def;
Pajax.Headers = Headers;
Pajax.Request = Request;
Pajax.Response = Response;

export default Pajax;
