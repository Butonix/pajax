import Headers from './headers.js';

export default {
  pipelets: {
    before: [],
    after: []
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
    url: true,
    body: {
      assign: '_body'
    },
    headers: {
      default: ()=>new Headers(),
      merge: (h1, h2) =>new Headers(h1, h2)
    },
    method: true,
    noStatusCheck: true,
    timeout: true,
    contentType: true,
    mode: true,
    redirect: true,
    referrer: true,
    integrity: true,
    progress: true,
    credentials: true,
    cache: true
  }
};
