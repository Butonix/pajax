import Pajax from './pajax';
import * as _ from './utils';

class PajaxURLEncoded extends Pajax {
  constructor(...args) {
    super(...args);
    this.setContentType('application/x-www-form-urlencoded');
  }
}

_.decorate(PajaxURLEncoded);

export default PajaxURLEncoded;
