import * as _ from './utils';

function assign(init) {
  return {
    method: init.method || 'GET',
    baseURL: init.baseURL,
    body: init.body,
    timeout: init.timeout,
    progress: init.progress,
    cache: init.cache,
    responseType: init.responseType,
    responseContentType: init.responseContentType,
    contentType: init.contentType,
    credentials: init.credentials,
    queryParams: _.clone(init.queryParams) || {},
    headers: _.clone(init.headers) || {},
    pipelets: _.createPipelets(init.pipelets),
  };
}

export default class Options {

  constructor(init={}) {
    this.opts = assign(init);
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

  setOption(option, value) {
    if(value!==undefined) {
      this.opts[option] = value;
    } else {
      delete this.opts[option];
    }
    return this;
  }

  attach(body) {
    return this.setOption('body', body);
  }

  setTimeout(timeout) {
    return this.setOption('timeout', timeout);
  }

  setContentType(contentType) {
    return this.setOption('contentType', contentType);
  }

  setResponseContentType(responseContentType) {
    return this.setOption('responseContentType', responseContentType);
  }

  setResponseType(responseType) {
    return this.setOption('responseType', responseType);
  }

  onProgress(progressCb) {
    return this.setOption('progress', progressCb);
  }

  withCredentials(cred) {
    return this.setOption('credentials', typeof cred==='string' ? cred : 'include');
  }

  noCache(noCache) {
    return this.setOption('cache', noCache===false ? 'default' : 'no-cache');
  }

  asText() {
    return this.setOption('responseContentType', 'text/plain');
  }

  asJSON() {
    return this.setOption('responseContentType', 'application/json');
  }

  header(header, value) {
    if(typeof header==='string') {
      this.opts.headers[header] = value;
    } else if(typeof header==='object') {
      this.opts.headers = _.merge(this.opts.headers, header);
    } else {
      delete this.opts.headers;
    }
    return this;
  }

  query(key, value) {
    if(typeof key==='string') {
      this.opts.queryParams[key] = value;
    } else if(typeof key==='object') {
      this.opts.queryParams = _.merge(this.opts.queryParams, key);
    } else {
      delete this.opts.queryParams;
    }
    return this;
  }
}
