import def from './def.js';

// Merges multiple request options
// The result object is independent of the source options
export default function options(...inits) {
  let result = {};
  const assign = def.request.assign;
  const merge = def.request.merge;
  inits.forEach(init=>{
    Object.keys(init || {}).forEach(key=>{
      if(init[key]!==undefined) {
        // Merge options
        if(typeof merge[key]==='function') {
          result[key] = merge[key](result[key], init[key]);
        } else {
          result[key] = init[key];
        }
      }
    });
  });
  return result;
}
