import * as _ from './utils';

const configurator = {
  setOption(option, value) {
    if(value!==undefined) {
      this.opts[option] = value;
    } else {
      delete this.opts[option];
    }
    return this;
  },
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
    this.setOption('body', body);
    return this;
  },
  setTimeout(timeout) {
    this.setOption('timeout', timeout);
    return this;
  },
  setBaseURL(baseURL) {
    this.setOption('baseURL', baseURL);
    return this;
  },
  setContentType(contentType) {
    this.setOption('contentType', contentType);
    return this;
  },
  setResponseContentType(responseContentType) {
    this.setOption('responseContentType', responseContentType);
    return this;
  },
  setResponseType(responseType) {
    this.setOption('responseType', responseType);
    return this;
  },
  onProgress(progressCb) {
    this.setOption('progress', progressCb);
    return this;
  },
  withCredentials(cred) {
    this.setOption('credentials', typeof cred==='string' ? cred : 'include');
    return this;
  },
  noCache(noCache) {
    this.setOption('cache', noCache===false ? 'default' : 'no-cache');
    return this;
  },
  asText() {
    this.setOption('responseContentType', 'text/plain');
    return this;
  },
  asJSON() {
    this.setOption('responseContentType', 'application/json');
    return this;
  },
  header(header, value) {
    this.opts.headers = this.opts.headers || {};
    if(typeof header==='string' && value!==undefined) {
      this.opts.headers[header] = value;
    } else if(typeof header==='string' && value===undefined) {
      delete this.opts.headers[header];
    } else if(typeof header==='object') {
      this.opts.headers = _.merge(this.opts.headers, header);
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
      this.opts.queryParams = _.merge(this.opts.queryParams, key);
    } else {
      delete this.opts.queryParams;
    }
    return this;
  }
};

export default function(obj) {
  Object.assign(obj, configurator);
}
