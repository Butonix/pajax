import Pajax from './pajax';
import * as _ from './utils';

class PajaxURLEncoded extends Pajax {
  constructor(init) {
    init = init || {};
    super(init);
    this.setContentType('application/x-www-form-urlencoded');
  }
}


_.decorate(PajaxURLEncoded);

export default PajaxURLEncoded;
