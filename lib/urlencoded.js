import Pajax from './pajax';
import {decorate} from './utils';

class PajaxURLEncoded extends Pajax {
  constructor(...args) {
    super(...args);
    this.setContentType('application/x-www-form-urlencoded');
  }
}

decorate(PajaxURLEncoded);

export default PajaxURLEncoded;
