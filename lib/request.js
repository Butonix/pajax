import {merge, assign} from './utils';
import qs from './qs';
import {parseURL} from './url-parser';
import configurator from './configurator';
import {checkStatus} from './pipelets';

export default class Request {

  constructor(url, opts, factory) {
    if(typeof url!=='string') {
      throw 'URL required for request';
    }
    this.rawURL = url;
    this.factory = factory;
    this.opts = assign(opts);
    configurator(this)
  }

  get url() {
    var parsedURL = parseURL(this.rawURL);
    let url = '';

    // Add base url when url is just a path
    var baseURL = this.baseURL;
    if(parsedURL.isRelative && baseURL) {
      url = baseURL;
    } else if(!parsedURL.isRelative) {
      url = parsedURL.protocol + '//' + parsedURL.host;
    }

    url += parsedURL.pathname + parsedURL.hash;

    var qp = {};

    // Merge options params into qp hash
    if (this.queryParams) {
      qp = merge(qp, this.queryParams);
    }

    // When url contains query params, merge them into qp hash
    if(parsedURL.search) {
      var search = parsedURL.search.replace(/^\?/, '');
      if(search) {
        qp = merge(qs.parse(search), qp);
      }
    }

    // Merge caching param into qp hash
    if(this.method === 'GET' && this.cache==='no-cache') {
      var ts = Date.now();
      qp._ = ++ts;
    }

    if(Object.keys(qp).length > 0) {
      // Serialize query parameters into query string
      url += '?' + qs.stringify(qp);
    }

    return url;
  }

  get baseURL() { return this.opts.baseURL; }
  get queryParams() { return this.opts.queryParams; }

  get method() { return this.opts.method; }
  get body() { return this.opts.body; }
  get headers() { return this.opts.headers; }
  get credentials() { return this.opts.credentials; }
  get cache() { return this.opts.cache; }
  get contentType() { return this.opts.contentType; }
  get progress() { return this.opts.progress; }
  get timeout() { return this.opts.timeout; }
  get responseType() { return this.opts.responseType; }
  get pipelets() { return this.opts.pipelets; }
  get responseContentType() { return this.opts.responseContentType; }

  checkStatus() {
    return this.after(checkStatus());
  }

  // Alias for fetch()
  send() {
    return this.fetch();
  }

  fetch() {
    return this.factory.fetch(this);
  }
}
