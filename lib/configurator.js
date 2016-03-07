import Headers from './headers.js';

function merge(...objects) {
  let result = {};
  objects.forEach(o=>{
    o = o || {};
    Object.keys(o).forEach(key=>{
      result[key] = o[key];
    });
  });
  return result;
}

const mixin = {
  before(func) {
    return this.clone({'pipelets': {before:[func]}});
  },
  after(func) {
    return this.clone({'pipelets': {after:[func]}});
  },
  afterSuccess(func) {
    return this.clone({'pipelets': {afterSuccess:[func]}});
  },
  afterFailure(func) {
    return this.clone({'pipelets': {afterFailure:[func]}});
  },
  attach(body) {
    return this.clone({'body': body});
  },
  setTimeout(timeout) {
    return this.clone({'timeout': timeout});
  },
  setContentType(contentType) {
    return this.clone({'contentType': contentType});
  },
  setConvertResponse(convertResponse) {
    return this.clone({'convertResponse': convertResponse});
  },
  setConvertRequest(convertRequest) {
    return this.clone({'convertRequest': convertRequest});
  },
  setResponseContentType(responseContentType) {
    return this.clone({'responseContentType': responseContentType});
  },
  onProgress(progressCb) {
    return this.clone({'progress': progressCb});
  },
  withCredentials(cred) {
    return this.clone({
      'credentials': typeof cred==='string' ? cred : 'include'
    });
  },
  noCache(noCache) {
    return this.clone({
      'cache': noCache===false ? 'default' : 'no-cache'
    });
  },
  header(header, value) {
    if(typeof header==='string' && value!==undefined) {
      return this.clone({headers: {[header]:value}});
    } else if(typeof header==='string' && value===undefined) {
      return this.clone({headers: {[header]:undefined}});
    } else if(typeof header==='object') {
      return this.clone({headers: header});
    }
    return this;
  }
};

export default {
  map: {
    body: true,
    method: true,
    timeout: true,
    contentType: true,
    convertRequest: true,
    convertResponse: true,
    responseContentType: true,
    mode: true,
    redirect: true,
    referrer: true,
    integrity: true,
    progress: true,
    credentials: true,
    cache: true,
    headers: (h1,h2) => {
      return new Headers(h1, h2);
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
  },
  mixin(Class) {
    Object.assign(Class.prototype, mixin);
  },
  assign(target, ...inits) {
    let map = this.map;
    inits.forEach(init=>{
      init = init || {};
      // Merge and uniquify keys
      Object.keys(map).forEach(key=>{
        if(typeof map[key]==='function') {
          target[key] = map[key](target[key], init[key]);
        } else if(map[key]==='merge') {
          if(typeof init[key]==='object') {
            target[key] = merge(target[key], init[key]);
          }
        } else if(init[key]) {
          target[key] = init[key];
        }
      });
    });
    return target;
  }
}
