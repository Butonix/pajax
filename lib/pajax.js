import Request from './request.js';
import Response from './response.js';
import {checkStatus} from './pipelets.js';
import Headers from './headers.js';
import fetch from './fetch.js';
import configurator from './configurator.js';
import convertion from './convertion.js';
import handlers from './handlers.js';

class Pajax {
  constructor(defaults) {
    this.defaults = {};
    Object.assign(this, configurator.mixin);
    configurator.assign(this.defaults, defaults);
  }

  get(url, init={}) {
    return this.request(url, init).get().after(checkStatus()).fetch();
  }

  head(url, init={}) {
    return this.request(url, init).head().after(checkStatus()).fetch();
  }

  delete(url, init={}) {
    return this.request(url, init).delete().after(checkStatus()).fetch();
  }

  post(url, body, init={}) {
    return this.request(url, init).post().attach(body).after(checkStatus()).fetch();
  }

  put(url, body, init={}) {
    return this.request(url, init).put().attach(body).after(checkStatus()).fetch();
  }

  patch(url, body, init={}) {
    return this.request(url, init).patch().attach(body).after(checkStatus()).fetch();
  }

  request(url, init) {
    // Merge defaults
    init = configurator.assign({}, this.defaults, init);
    let RequestCtor = this.constructor.Request || Request;
    return new RequestCtor(url, init, {factory: this});
  }

  fetch(url, init) {
    // Merge defaults
    init = configurator.assign({}, this.defaults, init);
    return fetch(url, init, {factory:this});
  }

  JSON(force) {
    const ct = 'application/json';
    let pajax = this.setContentType(ct).header('Accept', ct);
    return force ? pajax.setResponseContentType(ct) : pajax;
  }

  clone(defaults) {
    return new this.constructor(configurator.assign({}, this.defaults, defaults));
  }

  static request(...args) {
    return new this().request(...args);
  }
  static fetch(...args) {
    return fetch(...args);
  }
  static get(...args) {
    return new this().get(...args);
  }
  static head(...args) {
    return new this().head(...args);
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
  static del(...args) {
    return this.delete(...args);
  }
  static checkStatus(...args) {
    return checkStatus(...args);
  }
}

Pajax.handlers = handlers;
Pajax.convertion = convertion;
Pajax.configurator = configurator;
Pajax.Headers = Headers;
Pajax.Request = Request;
Pajax.Response = Response;

export default Pajax;
