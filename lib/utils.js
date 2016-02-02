export function resolvePipelets(pipelets, o) {
  var pipeChain = Promise.resolve(o);
  for (let pipelet of (pipelets || [])) {
    pipeChain = pipeChain.then(pipelet).then(()=>{
      return o;
    });
  }
  return pipeChain;
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
  let o = new Class(...args);
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

function unique(value, index, self) {
  return self.indexOf(value) === index;
}

const optsMap = {
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

export function assign(...objects) {
  let result = {};
  objects.forEach(o=>{
    o = o || {};
    // Merge and uniquify keys
    let keys = [...Object.keys(o), ...Object.keys(optsMap)].filter(unique);
    keys.forEach(key=>{
      if(optsMap[key]) {
        result[key] = optsMap[key](result[key], o[key]);
      } else {
        result[key] = o[key];
      }
    });
  });
  return result;
}
