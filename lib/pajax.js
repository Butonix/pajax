import * as _ from './utils';
import PajaxRequest from './request';
import PajaxResponse from './response';
import Options from './options';

class Pajax  extends Options {

  constructor({opts, Request, Response, request}={}) {
    super(opts);
    this.Request = Request || PajaxRequest;
    this.Response = Response || PajaxResponse;
    this.request = request;
  }

  get(url, opts) {
    return this.fetch(url, opts, 'GET').checkStatus();
  }

  head(url, opts) {
    return this.fetch(url, opts, 'HEAD').checkStatus();
  }

  post(url, opts) {
    return this.fetch(url, opts, 'POST').checkStatus();
  }

  put(url, opts) {
    return this.fetch(url, opts, 'PUT').checkStatus();
  }

  patch(url, opts) {
    return this.fetch(url, opts, 'PATCH').checkStatus();
  }

  delete(url, opts) {
    return this.fetch(url, opts, 'DELETE').checkStatus();
  }

  del(...args) {
    return this.delete(...args);
  }

  fetch(url, opts, method) {
    // The opts will be modified, so let's create a clone
    opts = _.clone(opts || {});
    opts = _.merge(opts, this.opts);
    opts.method = method || opts.method;

    return new this.Request({
      url,
      opts,
      factory: this,
      pipelets: this.pipelets,
      Response: this.Response,
      request: this.request
    });
  }
}

_.decorate(Pajax);

export default Pajax;
