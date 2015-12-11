import Pajax from './pajax';
import PajaxRequest from './request';
import qs from './qs';
import * as _ from './utils';

class PajaxJSON extends Pajax {
  constructor(init) {
    init = init || {};
    super(init);
    this.contentType('application/json');
    this.header('Accept', 'application/json');
    if(init.forceJSON) {
      this.responseContentType('application/json');
    }
  }
}

_.decorate(PajaxJSON);

export default PajaxJSON;
