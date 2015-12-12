export function clone(o) {
  if(o===null || typeof o!=='object') {
    return o;
  }
  let c = o.constructor();
  Object.keys(o).forEach(key=>{
    c[key] = clone(o[key], false);
  });
  return c;
}

export function merge(...objects) {
  let result = {};
  objects.forEach(o=>{
    o = o || {};
    Object.keys(o).forEach(key=>{
      result[key] = o[key];
    });
  });
  return result;
}

export function decorate(Class, ...args) {
  // Add static methods
  var o = new Class(...args);
  Class.get = (...args)=>o.get(...args);
  Class.head = (...args)=>o.head(...args);
  Class.post = (...args)=>o.post(...args);
  Class.put = (...args)=>o.put(...args);
  Class.del = (...args)=>o.del(...args);
  Class.delete = (...args)=>o.delete(...args);
  Class.patch = (...args)=>o.patch(...args);
  Class.request = (...args)=>o.request(...args);
}

export function createPipelets(o) {
  o = o || {};
  return {
    before: (o.before || []).slice(0),
    after: (o.after || []).slice(0),
    afterSuccess: (o.afterSuccess || []).slice(0),
    afterFailure: (o.afterFailure || []).slice(0)
  };
}
