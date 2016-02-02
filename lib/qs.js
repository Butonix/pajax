function conv(value) {
  switch (typeof value) {
    case 'string':
      return value;
    case 'boolean':
      return value ? 'true' : 'false';
    case 'number':
      return isFinite(value) ? value.toString() : '';
    default:
      return '';
  }
}

// stringify and parse query parameters
export default {
  stringify: function(obj) {
    if(obj && typeof obj === 'object') {
      let res = [];
      for (let p in obj) {
        if (obj.hasOwnProperty(p)) {
          let s = encodeURIComponent(p) + '=';
          s+= encodeURIComponent(conv(obj[p]));
          res.push(s);
        }
      }
      return res.join('&');
    } else {
      return '';
    }
  },
  parse: function(qs) {
    let res = {};

    if (typeof qs !== 'string' || !qs) {
      return res;
    }

    qs = qs.split('&');

    for (let i=0;i<qs.length;i++) {
      let s = qs[i].replace(/\+/g, '%20');
      let eqidx = s.indexOf('=');

      let prop, value;

      if (eqidx >= 0) {
        prop = s.substr(0, eqidx);
        value = s.substr(eqidx + 1);
      } else {
        prop = s;
        value = '';
      }

      prop = decodeURIComponent(prop);
      value = decodeURIComponent(value);

      res[prop] = value;
    }

    return res;
  }
}
