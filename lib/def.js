import Headers from './headers.js';

export default {
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
  dataTypeMap: {
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
      dataType: true,
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
