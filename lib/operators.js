const operators = {
  setTimeout(timeout) {
    return this.fork({'timeout': timeout});
  },
  type(contentType) {
    return this.fork({'contentType': contentType});
  },
  as(method) {
    return this.fork({'method': method});
  },
  onProgress(progressCb) {
    return this.fork({'progress': progressCb});
  },
  withCredentials() {
    return this.fork({
      'credentials': 'include'
    });
  },
  noCache(noCache) {
    return this.fork({
      'cache': noCache===false ? 'default' : 'no-cache'
    });
  },
  header(header, value) {
    if(typeof header==='string' && value!==undefined) {
      return this.fork({headers: {[header]:value}});
    } else if(typeof header==='string' && value===undefined) {
      return this.fork({headers: {[header]:undefined}});
    } else if(typeof header==='object') {
      return this.fork({headers: header});
    }
    return this;
  },
  accept(ct) {
    return this.header('Accept', ct);
  }
};

export default function(target) {
  Object.keys(operators).forEach(key=>{
    target[key] = operators[key];
  });
}
