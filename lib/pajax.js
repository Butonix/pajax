import qs from './qs';
import * as _ from './helpers';
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
    return new PajaxRequest(method, url, opts);
  }
}

Pajax.JSON = class extends Pajax {

  request(method, url, opts) {
    // Use overridable defaults
    opts = _.defaults(opts, {
      contentType: 'application/json',
      responseType: 'json',
      headers: {
        Accept : "application/json"
      }
    });

    return super.request(method, url, opts).after(Pajax.JSON.toJSON());
  }

  // Pipelet for jsons
  static toJSON(res) {
    return res => {
      try {
        // IE11 and old(new?) Safari does not support responseType = json
        // so try parsing, when json was expected and string is delivered
        // Note: response can be empty string in Cordova
        if (typeof res.body==='string' && res.body && res.body.length !== 0) {
          res.body = JSON.parse(res.body);
        }
        // Throw error if response has no json body and status is not 204/205 (no content/reset content)
        if(res.status!==204 && res.status!==205 && (res.body===null || typeof res.body!=='object')) {
          throw 'Invalid JSON';
        }
      } catch(ex) {
        res.error = 'Invalid JSON';
        return Promise.reject(res);
      }
      return Promise.resolve(res);
    }
  }
}

Pajax.URLEncoded = class extends Pajax {

  request(method, url, opts) {
    // Use overridable defaults
    opts = _.defaults(opts, {
      contentType: 'application/x-www-form-urlencoded',
      responseType: 'string'
    });

    return super.request(method, url, opts);
  }
}

export default Pajax;
export * from './iri';
export * from './request';
export * from './qs';
