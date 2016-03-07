import configurator from './configurator.js';
import Body from './body.js';
import {checkStatus} from './pipelets.js';

class Request extends Body {

  constructor(url, init, {factory}={}) {
    super();
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
  fetch() {
    if(!this.factory) {
      throw 'fetch() is only available on request created with a pajax instance';
    }
    return this.factory.fetch(this);
  }
}

configurator.mixin(Request);

export default Request;
