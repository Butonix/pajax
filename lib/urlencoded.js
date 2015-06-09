import Pajax from './pajax';
import * as _ from './utils';

export default class PajaxURLEncoded extends Pajax {

  constructor(opts) {
    // Use overridable defaults
    opts = _.defaults(opts || {}, {
      contentType: 'application/x-www-form-urlencoded'
    });

    return super(opts);
  }
}
