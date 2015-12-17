import Pajax from './pajax';
import PajaxRequest from './request';
import qs from './qs';
import * as _ from './utils';

class PajaxJSON extends Pajax {
  constructor(opts={}, init={}) {
    super(opts, init);
    this.setContentType('application/json');
    this.header('Accept', 'application/json');
    if(opts.forceJSON) {
      this.setResponseContentType('application/json');
    }
  }
}

_.decorate(PajaxJSON);

export default PajaxJSON;
