export function resolvePipelets(pipelets, o) {
  var pipeChain = Promise.resolve(o);
  for (let pipelet of (pipelets || [])) {
    pipeChain = pipeChain.then(pipelet).then(()=>{
      return o;
    });
  }
  return pipeChain;
}

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
  Class.fetch = (...args)=>o.fetch(...args);
}

var assignMap = {
  method: m=>m||'GET',
  body: null,
  timeout: null,
  baseURL: null,
  contentType: null,
  responseContentType: null,
  responseType: null,
  progress: null,
  credentials: null,
  cache: null,
  queryParams: (qp)=>clone(qp||{}),
  headers: (h)=>clone(h||{}),
  pipelets: (p)=>{
    p = p || {};
    return {
      before: (p.before || []).slice(0),
      after: (p.after || []).slice(0),
      afterSuccess: (p.afterSuccess || []).slice(0),
      afterFailure: (p.afterFailure || []).slice(0)
    };
  }
};

export function assignOpts(opts, target) {
  Object.keys(assignMap).forEach(key=>{
    if(opts[key]!==undefined || assignMap[key]) {
      target[key] = assignMap[key] ? assignMap[key](opts[key]) : opts[key];
    }
  });
}

var mergeMap = {
  method: (m1,m2) => m2||m1||'GET',
  queryParams: (qp1,qp2)=>{
    return merge(qp1||{}, qp2||{});
  },
  headers: (h1,h2)=>{
    return merge(h1||{}, h2||{});
  },
  pipelets: (p1,p2)=>{
    p1 = p1 || {};
    p2 = p2 || {};
    return {
      before: (p2.before || []).concat(p1.before || []),
      after: (p2.after || []).concat(p1.after || []),
      afterSuccess: (p2.afterSuccess || []).concat(p1.afterSuccess || []),
      afterFailure: (p2.afterFailure || []).concat(p1.afterFailure || []),
    };
  }
};

export function mergeOpts(...objects) {
  let result = {};
  objects.forEach(o=>{
    o = o || {};
    Object.keys(o).forEach(key=>{
      if(mergeMap[key]) {
        result[key] = mergeMap[key](result[key], o[key]);
      } else {
        result[key] = o[key];
      }
    });
  });
  return result;
}
