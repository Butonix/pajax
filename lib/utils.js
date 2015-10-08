export var clone = function(obj) {
  if(obj===null || typeof obj!=='object') {
    return obj;
  }
  var temp = obj.constructor();
  for (var prop in obj) {
    if(obj.hasOwnProperty(prop)) {
      temp[prop] = clone(obj[prop]);
    }
  }
  return temp;
};

export var merge = function(o, updates, override=true) {
  o = clone(o || {});
  updates = updates || {};
  for (let prop in updates || {}) {
    if(updates.hasOwnProperty(prop) && (!o.hasOwnProperty(prop) || override)) {
      o[prop] = clone(updates[prop]);
    }
  }
  return o;
};

export var defaults = function(original, updates) {
  return merge(original, updates, false);
};

export var decorate = function(Class, ...args) {
  // Add static methods
  var o = new Class(...args);
  Class.get = (...args)=>o.get(...args);
  Class.head = (...args)=>o.head(...args);
  Class.post = (...args)=>o.post(...args);
  Class.put = (...args)=>o.put(...args);
  Class.del = (...args)=>o.del(...args);
  Class.patch = (...args)=>o.patch(...args);
  Class.request = (...args)=>o.request(...args);
};
