import * as _ from './utils';
import PajaxRequest from './request';
import PajaxResponse from './response';
import Options from './options';

class Pajax  extends Options {

  constructor(init={}, {Request, Response, requestData}={}) {
    super(init);
    this.Request = Request || PajaxRequest;
    this.Response = Response || PajaxResponse;
    this.requestData = requestData;
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
    opts = _.merge(this.opts, opts, method ? {method} : null );
    return new this.Request(url, opts, {
      requestData: this.requestData,
      Response: this.Response
    });
  }
}

_.decorate(Pajax);

export default Pajax;
