import Pajax from './pajax';
import PajaxRequest from './request';
import qs from './qs';
import * as _ from './utils';

const ct = 'application/json';

class PajaxJSON extends Pajax {
  constructor(...args) {
    super(...args);
    this.setContentType(ct);
    this.header('Accept', ct);
  }

  request(...args) {
    let req = super.request(...args);
    if(req.opts.forceJSON) {
      req.setResponseContentType(ct);
    }
    return req;
  }
}

_.decorate(PajaxJSON);

export default PajaxJSON;
