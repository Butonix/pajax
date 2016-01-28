import Pajax from './pajax';
import PajaxRequest from './request';
import qs from './qs';
import * as _ from './utils';

class PajaxJSON extends Pajax {
  constructor(...args) {
    super(...args);
    this.setContentType('application/json');
    this.header('Accept', 'application/json');
  }
}

_.decorate(PajaxJSON);

export default PajaxJSON;
