import Pajax from './pajax';
import PajaxRequest from './request';
import qs from './qs';
import parseIRI from './iri';
import * as _ from './helpers';

export default class PajaxJSON extends Pajax {

  constructor(opts) {
    // Use overridable defaults
    opts = _.defaults(opts || {}, {
      contentType: 'application/json',
      headers: {
        Accept : "application/json"
      }
    });

    return super(opts);
  }

  request(method, url, opts) {
    return super.request(method, url, opts).after(PajaxJSON.asJSON());
  }

  // Pipelet for jsons
  static asJSON() {
    return res => {
      if(res.opts.asJSON) {
        try {
          // Force string body to be json
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
      }

      return Promise.resolve(res);
    }
  }
}
