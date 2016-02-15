import {merge,unique} from './utils';

function set(target, option, value) {
  if(value!==undefined) {
    target.opts[option] = value;
  } else {
    delete target.opts[option];
  }
  return target;
}

class Configurator {
  constructor(opts) {
    // Opts will be modified, so we create a clone by assigning
    this.opts = {};
    this.assignOpts(opts);
  }
  assignOpts(...objects) {
    const map = Configurator.assignMap;
    objects.forEach(o=>{
      o = o || {};
      // Merge and uniquify keys
      let keys = [...Object.keys(o), ...Object.keys(map)].filter(unique);
      keys.forEach(key=>{
        if(map[key]) {
          this.opts[key] = map[key](this.opts[key], o[key]);
        } else {
          this.opts[key] = o[key];
        }
      });
    });
    return this;
  }
  before(func) {
    this.opts.pipelets.before.push(func);
    return this;
  }
  after(func) {
    this.opts.pipelets.after.push(func);
    return this;
  }
  afterSuccess(func) {
    this.opts.pipelets.afterSuccess.push(func);
    return this;
  }
  afterFailure(func) {
    this.opts.pipelets.afterFailure.push(func);
    return this;
  }
  attach(body) {
    return set(this, 'body', body);
  }
  setTimeout(timeout) {
    return set(this, 'timeout', timeout);
  }
  setBaseURL(baseURL) {
    return set(this, 'baseURL', baseURL);
  }
  setContentType(contentType) {
    return set(this, 'contentType', contentType);
  }
  setResponseContentType(responseContentType) {
    return set(this, 'responseContentType', responseContentType);
  }
  setResponseType(responseType) {
    return set(this, 'responseType', responseType);
  }
  onProgress(progressCb) {
    return set(this, 'progress', progressCb);
  }
  withCredentials(cred) {
    return set(this, 'credentials', typeof cred==='string' ? cred : 'include');
  }
  noCache(noCache) {
    return set(this, 'cache', noCache===false ? 'default' : 'no-cache');
  }
  asText() {
    return set(this, 'responseContentType', 'text/plain');
  }
  asJSON() {
    return set(this, 'responseContentType', 'application/json');
  }
  header(header, value) {
    this.opts.headers = this.opts.headers || {};
    if(typeof header==='string' && value!==undefined) {
      this.opts.headers[header] = value;
    } else if(typeof header==='string' && value===undefined) {
      delete this.opts.headers[header];
    } else if(typeof header==='object') {
      this.opts.headers = merge(this.opts.headers, header);
    } else {
      delete this.opts.headers;
    }
    return this;
  }
  query(key, value) {
    this.opts.queryParams = this.opts.queryParams || {};
    if(typeof key==='string' && value!==undefined) {
      this.opts.queryParams[key] = value;
    } else if(typeof key==='string' && value===undefined) {
      delete this.opts.queryParams[key];
    } else if(typeof key==='object') {
      this.opts.queryParams = merge(this.opts.queryParams, key);
    } else {
      delete this.opts.queryParams;
    }
    return this;
  }
}

Configurator.assignMap = {
  queryParams: (qp1,qp2)=>{
    return merge(qp1 || {}, qp2 || {});
  },
  headers: (h1,h2)=>{
    return merge(h1 || {}, h2 || {});
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

export default Configurator;
