import {default as Body, prepare} from './body.js';

export default class Response extends Body {

  constructor(body, {status,statusText,headers}={}, {factory,xhr,req,error}={}) {
    super();
    this.body = body;

    this.status = status;
    this.statusText = statusText;
    this.headers = headers;

    this.factory = factory;
    this.request = req;
    this.xhr = xhr;
    this.error = error || null;
  }

  get url() {
    return this.request.url;
  }

  get ok() {
    // SUCCESS: status between 200 and 299 or 304
    // Failure: status below 200 or beyond 299 excluding 304
    return (this.status >= 200 && this.status < 300) || this.status===304;
  }
}
