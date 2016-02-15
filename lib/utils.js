export function resolvePipelets(pipelets, o) {
  let pipeChain = Promise.resolve(o);
  let resolve = ()=>{
    return o;
  };
  for (let pipelet of (pipelets || [])) {
    pipeChain = pipeChain.then(pipelet).then(resolve);
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

export function unique(value, index, self) {
  return self.indexOf(value) === index;
}
