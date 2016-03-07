import Request from './request.js';
import Response from './response.js';
import configurator from './configurator.js';
import convert from './convert.js';
import {checkStatus} from './pipelets.js';
import fetch from './fetch.js';
import Headers from './headers.js';

class Pajax {
  constructor(defaults) {
    this.defaults = {};
    configurator.assign(this.defaults, defaults);
  }

  get(url, init={}) {
    init.method = 'GET';
    return this.request(url, init);
  }

  head(url, init={}) {
    init.method = 'HEAD';
    return this.request(url, init);
  }

  post(url, init={}) {
    init.method = 'POST';
    return this.request(url, init);
  }

  put(url, init={}) {
    init.method = 'PUT';
    return this.request(url, init);
  }

  patch(url, init={}) {
    init.method = 'PATCH';
    return this.request(url, init);
  }

  delete(url, init={}) {
    init.method = 'DELETE';
    return this.request(url, init);
  }

  del(...args) {
    return this.delete(...args);
  }

  request(url, init) {
    // Merge defaults
    init = configurator.assign({}, this.defaults, init);
    let RequestCtor = this.constructor.Request || Request;
    return new RequestCtor(url, init, {factory: this}).checkStatus();
  }

  fetch(url, init) {
    // Merge defaults
    init = configurator.assign({}, this.defaults, init);
    return fetch(url, init, {factory:this});
  }

  JSON(force) {
    const ct = 'application/json';
    let pajax = this.setContentType(ct)
                    .header('Accept', ct);

    if(force) {
      return pajax.setResponseContentType(ct);
    } else {
      return pajax;
    }
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

  static extend(ext={}) {
    if(ext.pajax) {
      Object.assign(Pajax.prototype, ext.pajax);
    }
    if(ext.request) {
      Object.assign(Request.prototype, ext.request);
    }
    if(ext.response) {
      Object.assign(Response.prototype, ext.response);
    }
  }
}

configurator.mixin(Pajax);

Pajax.meta = {
  convert,
  configurator
};

Pajax.Headers = Headers;
Pajax.Request = Request;
Pajax.Response = Response;

export default Pajax;
