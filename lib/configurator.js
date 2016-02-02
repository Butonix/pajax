import {merge} from './utils';

function set(target, option, value) {
  if(value!==undefined) {
    target.opts[option] = value;
  } else {
    delete target.opts[option];
  }
  return target;
}

const configurator = {
  before(func) {
    this.opts.pipelets.before.push(func);
    return this;
  },
  after(func) {
    this.opts.pipelets.after.push(func);
    return this;
  },
  afterSuccess(func) {
    this.opts.pipelets.afterSuccess.push(func);
    return this;
  },
  afterFailure(func) {
    this.opts.pipelets.afterFailure.push(func);
    return this;
  },
  attach(body) {
    return set(this, 'body', body);
  },
  setTimeout(timeout) {
    return set(this, 'timeout', timeout);
  },
  setBaseURL(baseURL) {
    return set(this, 'baseURL', baseURL);
  },
  setContentType(contentType) {
    return set(this, 'contentType', contentType);
  },
  setResponseContentType(responseContentType) {
    return set(this, 'responseContentType', responseContentType);
  },
  setResponseType(responseType) {
    return set(this, 'responseType', responseType);
  },
  onProgress(progressCb) {
    return set(this, 'progress', progressCb);
  },
  withCredentials(cred) {
    return set(this, 'credentials', typeof cred==='string' ? cred : 'include');
  },
  noCache(noCache) {
    return set(this, 'cache', noCache===false ? 'default' : 'no-cache');
  },
  asText() {
    return set(this, 'responseContentType', 'text/plain');
  },
  asJSON() {
    return set(this, 'responseContentType', 'application/json');
  },
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
  },
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
};

export default function(obj) {
  Object.assign(obj, configurator);
}
