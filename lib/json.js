import Pajax from './pajax';
import PajaxRequest from './request';
import qs from './qs';
import * as _ from './utils';

class PajaxJSON extends Pajax {

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
    return super.request(method, url, opts).asJSON();
  }
}

_.decorate(PajaxJSON);

export default PajaxJSON;
