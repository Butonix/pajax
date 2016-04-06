import Request from './request.js';
import Response from './response.js';
import def from './def.js';

export default function pipe(pajax, handler, data) {
  let pipe$ = Promise.resolve(data);
  let pipelets = pajax ? pajax.getPipelets(handler) : [];
  // Merge global and pajax pipelets
  [...def.pipelets[handler], ...pipelets].forEach(pipelet=>{
    // chain together
    if(typeof pipelet==='function') {
      pipe$ = pipe$.then(data=>{
        // Resolve the return value of the pipelet
        return Promise.all([pipelet(data), data]);
      }).then(([init,data])=>{
        if(handler==='before') {
          // Requests can be manipulated or switched in the before handler
          if(init instanceof Request) {
            return init;
          } else if(typeof init==='object' && init && data instanceof Request) {
            // Create a new requests with the return value of the pipelet
            return data.fork(init);
          }
        } else if(handler==='after') {
          // Responses can be switches in the after handler
          if(init instanceof Response) {
            return init;
          }
        }
        return data;
      });
    }
  });
  return pipe$;
}
