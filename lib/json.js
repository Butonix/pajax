import Pajax from './pajax';

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

export default PajaxJSON;
