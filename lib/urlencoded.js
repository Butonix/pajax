import Pajax from './pajax';

class PajaxURLEncoded extends Pajax {
  constructor(...args) {
    super(...args);
    this.setContentType('application/x-www-form-urlencoded');
  }
}

export default PajaxURLEncoded;
