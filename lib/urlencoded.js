import Pajax from './pajax';
import * as _ from './utils';

class PajaxURLEncoded extends Pajax {

  constructor(opts) {
    // Use overridable defaults
    opts = _.defaults(opts || {}, {
      contentType: 'application/x-www-form-urlencoded'
    });

    return super(opts);
  }
}

_.decorate(PajaxURLEncoded, new PajaxURLEncoded());

export default PajaxURLEncoded;
