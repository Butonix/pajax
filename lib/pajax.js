import Request from './request.js';
import Response from './response.js';
import Headers from './headers.js';
import { checkStatus } from './check-status.js';
import fetch from './fetch.js';
import def from './def.js';
import operators from './operators.js';

class Pajax {
  constructor(init, pipelets={}) {
    // Multipe inits can be provided in an array
    // store defaults always as an array
    this.defaults = Array.isArray(init) ? init : [init];
    this.pipelets = {
      before: [...(pipelets.before || [])],
      after: [...(pipelets.after || [])]
    };
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
    // Merge class defaults and instance defaults into init
    init = [this.constructor.defaults, ...this.defaults, init];
    return new RequestCtor(url, init, this);
  }
  response(body, init) {
    let ResponseCtor = this.constructor.Response || Response;
    return new ResponseCtor(body, init, this);
  }
  registerPipelet(handler, func) {
    this.pipelets[handler].push(func);
    return this;
  }
  unregisterPipelet(handler, func) {
    let idx = this.pipelets[handler].indexOf(func);
    if(idx>=0){
      this.pipelets[handler].splice(idx, 1);
    }
    return this;
  }
  clone() {
    return this.fork();
  }
  fork(init) {
    return new this.constructor([...this.defaults, init], this.pipelets);
  }
  JSON() {
    const ct = 'application/json';
    return this.type(ct).accept(ct);
  }
  URLEncoded() {
    const ct = 'application/x-www-form-urlencoded';
    return this.type(ct);
  }
  before(func) {
    return this.fork().registerPipelet('before', func);
  }
  after(func) {
    return this.fork().registerPipelet('after', func);
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
    return this.request(url, init).fetch();
  }
  static request(url, init) {
    let RequestCtor = this.Request || Request;
    // Merge class defaults into init
    init = [this.defaults, init];
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
