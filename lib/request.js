import configurator from './configurator.js';
import Body from './body.js';
import {checkStatus} from './pipelets.js';

class Request extends Body {

  constructor(url, init, {factory}={}) {
    super();

    Object.assign(this, configurator.mixin);

    if(url instanceof Request) {
      this.url = url.url;
      configurator.assign(this, url);
    } else if(typeof url==='string'){
      this.url = url;
    }

    if(typeof this.url!=='string') {
      throw 'URL required for request';
    }

    configurator.assign(this, init);
    this.factory = factory;
  }
  clone(init) {
    return new this.constructor(this, init, {factory:this.factory});
  }
  checkStatus() {
    return this.after(checkStatus());
  }

  get() {
    return this.clone({method:'GET'});
  }

  head() {
    return this.clone({method:'HEAD'});
  }

  delete() {
    return this.clone({method:'DELETE'});
  }

  post() {
    return this.clone({method:'POST'});
  }

  put() {
    return this.clone({method:'PUT'});
  }

  patch() {
    return this.clone({method:'PATCH'});
  }

  fetch() {
    if(!this.factory) {
      throw 'fetch() is only available on requests created with a pajax instance';
    }
    return this.factory.fetch(this);
  }
}

export default Request;
