import * as _ from './utils';


export default function(obj, target) {

  function set(option, value) {
    if(value!==undefined) {
      target[option] = value;
    } else {
      delete target[option];
    }
    return this;
  }

  var configurator = {
    before(func) {
      target.pipelets = target.pipelets || {};
      target.pipelets.before = target.pipelets.before || [];
      target.pipelets.before.push(func);
      return this;
    },
    after(func) {
      target.pipelets = target.pipelets || {};
      target.pipelets.after = target.pipelets.after || [];
      target.pipelets.after.push(func);
      return this;
    },
    afterSuccess(func) {
      target.pipelets = target.pipelets || {};
      target.pipelets.afterSuccess = target.pipelets.afterSuccess || [];
      target.pipelets.afterSuccess.push(func);
      return this;
    },
    afterFailure(func) {
      target.pipelets = target.pipelets || {};
      target.pipelets.afterFailure = target.pipelets.afterFailure || [];
      target.pipelets.afterFailure.push(func);
      return this;
    },
    attach(body) {
      set('body', body);
      return this;
    },
    setTimeout(timeout) {
      set('timeout', timeout);
      return this;
    },
    setBaseURL(baseURL) {
      set('baseURL', baseURL);
      return this;
    },
    setContentType(contentType) {
      set('contentType', contentType);
      return this;
    },
    setResponseContentType(responseContentType) {
      set('responseContentType', responseContentType);
      return this;
    },
    setResponseType(responseType) {
      set('responseType', responseType);
      return this;
    },
    onProgress(progressCb) {
      set('progress', progressCb);
      return this;
    },
    withCredentials(cred) {
      set('credentials', typeof cred==='string' ? cred : 'include');
      return this;
    },
    noCache(noCache) {
      set('cache', noCache===false ? 'default' : 'no-cache');
      return this;
    },
    asText() {
      set('responseContentType', 'text/plain');
      return this;
    },
    asJSON() {
      set('responseContentType', 'application/json');
      return this;
    },
    header(header, value) {
      target.headers = target.headers || {};
      if(typeof header==='string') {
        target.headers[header] = value;
      } else if(typeof header==='object') {
        target.headers = _.merge(target.headers, header);
      } else {
        delete target.headers;
      }
      return this;
    },
    query(key, value) {
      target.queryParams = target.queryParams || {};
      if(typeof key==='string') {
        target.queryParams[key] = value;
      } else if(typeof key==='object') {
        target.queryParams = _.merge(target.queryParams, key);
      } else {
        delete target.queryParams;
      }
      return this;
    }
  };

  Object.assign(obj, configurator);
}
