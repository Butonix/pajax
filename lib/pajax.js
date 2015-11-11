import * as _ from './utils';
import PajaxRequest from './request';
import PajaxResult from './result';

class Pajax {

  constructor(opts) {
    this.opts = opts;
  }

  get(url, opts) {
    return this.request(url, opts, 'GET');
  }

  head(url, opts) {
    return this.request(url, opts, 'HEAD');
  }

  post(url, opts) {
    return this.request(url, opts, 'POST');
  }

  put(url, data, opts) {
    return this.request(url, opts, 'PUT');
  }

  patch(url, data, opts) {
    return this.request(url, opts, 'PATCH');
  }

  del(url, data, opts) {
    return this.request(url, opts, 'DELETE');
  }

  request(url, opts, method) {
    if(this.opts) {
      // Use overridable defaults
      opts = _.defaults(opts || {}, this.opts);
    }
    return new this.RequestClass(url, opts, method, this);
  }

  get RequestClass() {
    return PajaxRequest;
  }

  get ResultClass() {
    return PajaxResult;
  }

  result(...args) {
    // Deprecated. Use ResultClass instead
    return new this.ResultClass(...args);
  }
}

_.decorate(Pajax);

export default Pajax;
