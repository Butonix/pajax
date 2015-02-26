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

export var stringify = function(obj) {
  if(obj && typeof obj === 'object') {
    var res = [];
    for (var p in obj) {
      if (obj.hasOwnProperty(p)) {
        var s = encodeURIComponent(p) + '=';
        s+= encodeURIComponent(conv(obj[p]));
        res.push(s);
      }
    }
    return res.join('&');
  } else {
    return '';
  }
};

export var parse = function(qs) {
  var res = {};

  if (typeof qs !== 'string' || !qs) {
    return res;
  }

  qs = qs.split('&');

  for (var i=0;i<qs.length;i++) {
    var s = qs[i].replace(/\+/g, '%20');
    var eqidx = s.indexOf('=');

    var prop, value;

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
