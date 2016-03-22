import Headers from './headers.js';

export default {
  operators: {
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
      headers: (headers, reqHeaders) => {
        return new Headers(reqHeaders, headers);
      },
      pipelets: (pipelets, reqPipelets)=>{
        pipelets = pipelets || {};
        reqPipelets = reqPipelets || {};
        return {
          before: (reqPipelets.before || []).concat(pipelets.before || []),
          after: (reqPipelets.after || []).concat(pipelets.after || []),
          afterSuccess: (reqPipelets.afterSuccess || []).concat(pipelets.afterSuccess || []),
          afterFailure: (reqPipelets.afterFailure || []).concat(pipelets.afterFailure || []),
        };
      }
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
      pipelets: true
    }
  }
};
