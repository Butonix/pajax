import Request from './request.js';
import Response from './response.js';
import Headers from './headers.js';
import Body from './body.js';
import checkStatus from './check-status.js';
import def from './def.js';
import operators from './operators.js';
import send from './send.js';

class Pajax {
  constructor(init, ...defaults) {
    // Store init always as an array
    this.inits = [].concat(init);
    this.defaults = defaults;
  }
  // Creates init array by merging pajax inits, defaults and provided inits
  options(...inits) {
    return [...this.defaults, ...this.inits, ...inits]
           .filter(init=>init!==undefined); // filter undefined inits
  }
  // Return specific options
  option(key, ...inits) {
    return this.options(...inits).map(init=>init[key]).filter(R=>R!==undefined).pop();
  }
  // Creates a request instance
  request(url, init) {
    // Merge class defaults
    init = this.options(init);
    // Determines the Request class
    let RequestCtor = this.option('Request') || Request;
    return new RequestCtor(url, init, this);
  }
  // Resolves global and pajax pipelets
  pipe(handler, result) {
    let pipe$ = Promise.resolve(result);
    // Draw pipelets from options
    let pipelets = this.options().map(init=>init[handler]);
    // Flatten and filter the pipelets
    pipelets = [].concat(...pipelets).filter(func=>{
      return typeof func==='function';
    });
    // Merge global and pajax pipelets
    pipelets = [...def.pipelets[handler], ...pipelets];

    pipelets.forEach(pipelet=>{
      // chain together
      if(typeof pipelet==='function') {
        pipe$ = pipe$.then(result=>{
          // Resolve the return value of the pipelet
          return Promise.all([pipelet(result), result]);
        }).then(([init,result])=>{
          if(handler==='before') {
            // Requests can be manipulated or switched in the before handler
            if(init instanceof Request) {
              return init;
            } else if(typeof init==='object' && init && result instanceof Request) {
              // Create a new requests with the return value of the pipelet
              return result.fork(init);
            }
          } else if(handler==='after') {
            // Responses can be switches in the after handler
            if(init instanceof Response) {
              return init;
            }
          }
          return result;
        });
      }
    });
    return pipe$;
  }

  // pajax pipelets
  before(func) {
    return this.fork({before:[func]});
  }
  after(func) {
    return this.fork({after:[func]});
  }
  clone() {
    return this.fork();
  }
  fork(init) {
    return new this.constructor([...this.inits, init]);
  }
  JSON() {
    const ct = 'application/json';
    return this.type(ct).accept(ct);
  }
  URLEncoded() {
    const ct = 'application/x-www-form-urlencoded';
    return this.type(ct);
  }
  // ===

  // Request helpers
  fetch(url, init) {
    return this.request(url, init).fetch();
  }
  get(url, init={}) {
    return this.request(url, init).get();
  }
  getAuto(url, init={}) {
    return this.request(url, init).getAuto();
  }
  getJSON(url, init={}) {
    return this.request(url, init).getJSON();
  }
  getText(url, init={}) {
    return this.request(url, init).getText();
  }
  getBlob(url, init={}) {
    return this.request(url, init).getBlob();
  }
  getArrayBuffer(url, init={}) {
    return this.request(url, init).getArrayBuffer();
  }
  getFormData(url, init={}) {
    return this.request(url, init).getFormData();
  }
  delete(url, init={}) {
    return this.request(url, init).delete();
  }
  post(url, body, init={}) {
    return this.request(url, init).attach(body).post();
  }
  put(url, body, init={}) {
    return this.request(url, init).attach(body).put();
  }
  patch(url, body, init={}) {
    return this.request(url, init).attach(body).patch();
  }
  static fetch(url, init) {
    return this.request(url, init).fetch();
  }
  static get(url, init={}) {
    return this.request(url, init).get();
  }
  static getAuto(url, init={}) {
    return this.request(url, init).getAuto();
  }
  static getJSON(url, init={}) {
    return this.request(url, init).getJSON();
  }
  static getText(url, init={}) {
    return this.request(url, init).getText();
  }
  static getBlob(url, init={}) {
    return this.request(url, init).getBlob();
  }
  static getArrayBuffer(url, init={}) {
    return this.request(url, init).getArrayBuffer();
  }
  static getFormData(url, init={}) {
    return this.request(url, init).getFormData();
  }
  static delete(url, init={}) {
    return this.request(url, init).delete();
  }
  static post(url, body, init={}) {
    return this.request(url, init).attach(body).post();
  }
  static put(url, body, init={}) {
    return this.request(url, init).attach(body).put();
  }
  static patch(url, body, init={}) {
    return this.request(url, init).attach(body).patch();
  }
  static request(url, init) {
    return new Pajax().request(url, init);
  }
  // ===
}

operators(Pajax.prototype);

Pajax.checkStatus = checkStatus;
Pajax.send = send;
Pajax.def = def;
Pajax.Headers = Headers;
Pajax.Body = Body;
Pajax.Request = Request;
Pajax.Response = Response;

export default Pajax;
