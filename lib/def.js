import Headers from './headers.js';

export default {
  operators: {
    before(func) {
      return this.clone({before:[func]});
    },
    after(func) {
      return this.clone({after:[func]});
    },
    afterSuccess(func) {
      return this.clone({afterSuccess:[func]});
    },
    afterFailure(func) {
      return this.clone({afterFailure:[func]});
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
  },
  pipelets: {
    before: [],
    after: [],
    afterSuccess: [],
    afterFailure: []
  },
  serializers: {
    'application/json': JSON.stringify,
    'application/ld+json': JSON.stringify,
    'application/x-www-form-urlencoded': (body)=>{
      return Object.keys(body)
                   .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(body[k])}`)
                   .join('&');
    }
  },
  autoMap: {
    'application/json': 'json',
    'application/ld+json': 'json',
    'text/': 'text',
    'application/xml': 'text'
  },
  request: {
    merge: {
      headers: (h1, h2) =>new Headers(h1, h2),
      before: (p1, p2)=>[].concat(p1 || [], p2 || []),
      after: (p1, p2)=>[].concat(p1 || [], p2 || []),
      afterSuccess: (p1, p2)=>[].concat(p1 || [], p2 || []),
      afterFailure: (p1, p2)=>[].concat(p1 || [], p2 || [])
    },
    assign: {
      body: '_body',
      url: true,
      method: true,
      pajax: true,
      timeout: true,
      contentType: true,
      mode: true,
      redirect: true,
      referrer: true,
      integrity: true,
      progress: true,
      credentials: true,
      cache: true,
      Response: true,
      headers: true,
      before: 'beforePipelets',
      after: 'afterPipelets',
      afterSuccess: 'afterSuccessPipelets',
      afterFailure: 'afterFailurePipelets'
    }
  }
};
