import {merge, assignOpts} from './utils';
import qs from './qs';
import {parseURL} from './url-parser';
import configurator from './configurator';
import {checkStatus} from './pipelets';

export default class Request {

  constructor(url, opts={}, init={}) {
    if(typeof url!=='string') {
      throw 'URL required for request';
    }
    this.rawURL = url;
    this.factory = init.factory;
    this.data = init.data;
    assignOpts(opts, this);
    configurator(this, this)
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

  set url(url) {
    this.rawURL = url;
  }

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
