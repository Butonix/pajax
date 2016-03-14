import Headers from './headers.js';

export default {
  fetch: {
    url: [],
    xhr: [],
  },
  dataTypeMap: {
    'application/json': 'json',
    'application/ld+json': 'json',
    'text/': 'text',
    'application/xml': 'text'
  },
  request: {
    method: true,
    body: true,
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
  }
};
