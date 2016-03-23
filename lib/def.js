import Headers from './headers.js';

export default {
  operators: {
    before(func) {
      return this.spawn({before:[func]});
    },
    after(func) {
      return this.spawn({after:[func]});
    },
    afterSuccess(func) {
      return this.spawn({afterSuccess:[func]});
    },
    afterFailure(func) {
      return this.spawn({afterFailure:[func]});
    },
    setTimeout(timeout) {
      return this.spawn({'timeout': timeout});
    },
    type(contentType) {
      return this.spawn({'contentType': contentType});
    },
    is(method) {
      return this.spawn({'method': method});
    },
    onProgress(progressCb) {
      return this.spawn({'progress': progressCb});
    },
    withCredentials() {
      return this.spawn({
        'credentials': 'include'
      });
    },
    noCache(noCache) {
      return this.spawn({
        'cache': noCache===false ? 'default' : 'no-cache'
      });
    },
    header(header, value) {
      if(typeof header==='string' && value!==undefined) {
        return this.spawn({headers: {[header]:value}});
      } else if(typeof header==='string' && value===undefined) {
        return this.spawn({headers: {[header]:undefined}});
      } else if(typeof header==='object') {
        return this.spawn({headers: header});
      }
      return this;
    },
    accept(ct) {
      return this.header('Accept', ct);
    },
    attach(body) {
      return this.spawn({'body': body});
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
