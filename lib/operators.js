export default {
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
  setTimeout(timeout) {
    return this.clone({'timeout': timeout});
  },
  type(contentType) {
    return this.clone({'contentType': contentType});
  },
  is(method) {
    return this.clone({'method': method});
  },
  onProgress(progressCb) {
    return this.clone({'progress': progressCb});
  },
  withCredentials() {
    return this.clone({
      'credentials': 'include'
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
  },
  accept(ct) {
    return this.header('Accept', ct);
  },
  attach(body) {
    return this.clone({'body': body});
  }
}
