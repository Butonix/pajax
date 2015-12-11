import * as _ from './utils';

export default class Options {

  constructor(opts, pipelets) {
    this.opts = opts || {};
    this.pipelets = _.createPipelets(pipelets);
  }

  before(func) {
    this.pipelets.before.push(func);
    return this;
  }

  after(func) {
    this.pipelets.after.push(func);
    return this;
  }

  afterSuccess(func) {
    this.pipelets.afterSuccess.push(func);
    return this;
  }

  afterFailure(func) {
    this.pipelets.afterFailure.push(func);
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

  baseURL(baseURL) {
    return this.setOption('baseURL', baseURL);
  }

  method(method) {
    return this.setOption('method', method);
  }

  attach(body) {
    return this.setOption('body', body);
  }

  timeout(timeout) {
    return this.setOption('timeout', timeout);
  }

  progress(progressCb) {
    return this.setOption('progress', progressCb);
  }

  withCredentials(wc) {
    this.opts.withCredentials = typeof wc==='boolean' ? wc : true;
    return this;
  }

  noCache(noCache) {
    this.opts.noCache = typeof noCache==='boolean' ? noCache : true;
    return this;
  }

  responseType(responseType) {
    return this.setOption('responseType', responseType);
  }

  responseContentType(responseContentType) {
    return this.setOption('responseContentType', responseContentType);
  }
  contentType(contentType) {
    return this.setOption('contentType', contentType);
  }

  asText() {
    this.setOption('responseContentType', 'text/plain');
    return this;
  }

  asJSON() {
    this.setOption('responseContentType', 'application/json');
    return this;
  }

  header(header, value) {
    let headers = this.opts.headers = this.opts.headers || {};
    if(typeof header==='string') {
      headers[header] = value;
    } else if(typeof header==='object') {
      headers = _.merge(this._headers, header);
    } else {
      delete this.opts.headers;
    }
    return this;
  }

  query(key, value) {
    let qp = this.opts.queryParams = this.opts.queryParams || {};
    if(typeof key==='string') {
      qp[key] = value;
    } else if(typeof key==='object') {
      qp = _.merge(qp, key);
    } else {
      delete this.opts.queryParams;
    }
    return this;
  }
}
