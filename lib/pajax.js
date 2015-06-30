import * as _ from './utils';
import PajaxRequest from './request';

class Pajax {

  constructor(opts) {
    this.opts = opts;
  }

  get(url, opts) {
    return this.request('GET', url, opts);
  }

  head(url, opts) {
    return this.request('HEAD', url, opts);
  }

  post(url, opts) {
    return this.request('POST', url, opts);
  }

  put(url, data, opts) {
    return this.request('PUT', url, opts);
  }

  patch(url, data, opts) {
    return this.request('PATCH', url, opts);
  }

  del(url, data, opts) {
    return this.request('DELETE', url, opts);
  }

  request(method, url, opts) {
    // Use overridable defaults
    opts = _.defaults(opts, this.opts || {});
    return new PajaxRequest(method, url, opts, this);
  }
}

_.decorate(Pajax, new Pajax());

export default Pajax;
