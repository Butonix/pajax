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
    this._url = url;
    this.factory = factory;
    this.opts = assign(opts);
    configurator(this)
  }

  get url() {
    let parsedURL = parseURL(this._url);
    let url = '';

    // Add base url when url is just a path
    let baseURL = this.baseURL;
    if(parsedURL.isRelative && baseURL) {
      url = baseURL;
    } else if(!parsedURL.isRelative) {
      url = parsedURL.protocol + '//' + parsedURL.host;
    }

    url += parsedURL.pathname + parsedURL.hash;

    let qp = {};

    // Merge options params into qp hash
    if (this.queryParams) {
      qp = merge(qp, this.queryParams);
    }

    // When url contains query params, merge them into qp hash
    if(parsedURL.search) {
      let search = parsedURL.search.replace(/^\?/, '');
      if(search) {
        qp = merge(qs.parse(search), qp);
      }
    }

    // Merge caching param into qp hash
    if(this.method === 'GET' && this.cache==='no-cache') {
      let ts = Date.now();
      qp._ = ++ts;
    }

    if(Object.keys(qp).length > 0) {
      // Serialize query parameters into query string
      url += '?' + qs.stringify(qp);
    }

    return url;
  }

  set url(url) { this._url = url; }

  get baseURL() { return this.opts.baseURL; }
  set baseURL(baseURL) { this.opts.baseURL = baseURL; }

  get queryParams() { return this.opts.queryParams; }
  set queryParams(queryParams) { this.opts.queryParams = queryParams; }

  get method() { return this.opts.method; }
  set method(method) { this.opts.method = method; }

  get body() { return this.opts.body; }
  set body(body) { this.opts.body = body; }

  get headers() { return this.opts.headers; }
  set headers(headers) { this.opts.headers = headers; }

  get credentials() { return this.opts.credentials; }
  set credentials(credentials) { this.opts.credentials = credentials; }

  get cache() { return this.opts.cache; }
  set cache(cache) { this.opts.cache = cache; }

  get contentType() { return this.opts.contentType; }
  set contentType(contentType) { this.opts.contentType = contentType; }

  get progress() { return this.opts.progress; }
  set progress(progress) { this.opts.progress = progress; }

  get timeout() { return this.opts.timeout; }
  set timeout(timeout) { this.opts.timeout = timeout; }

  get responseType() { return this.opts.responseType; }
  set responseType(responseType) { this.opts.responseType = responseType; }

  get pipelets() { return this.opts.pipelets; }
  set pipelets(pipelets) { this.opts.pipelets = pipelets; }

  get responseContentType() { return this.opts.responseContentType; }
  set responseContentType(responseContentType) { this.opts.responseContentType = responseContentType; }

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
