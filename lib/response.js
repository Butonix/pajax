import qs from './qs.js';
import {deserializers} from './serializers.js';

// Parses that string into a user-friendly key/value pair object.
// http://www.w3.org/TR/XMLHttpRequest/#the-getallresponseheaders-method
export let parseResponseHeaders = function(headerStr) {
  let headers = {};
  if (!headerStr) {
    return headers;
  }
  let headerPairs = headerStr.split('\u000d\u000a');
  for (let i = 0; i < headerPairs.length; i++) {
    let headerPair = headerPairs[i];
    // Can't use split() here because it does the wrong thing
    // if the header value has the string ": " in it.
    let index = headerPair.indexOf('\u003a\u0020');
    if (index > 0) {
      let key = headerPair.substring(0, index).toLowerCase();
      let value = headerPair.substring(index + 2);
      headers[key.trim()] = value.trim();
    }
  }
  return headers;
}

export default class Response {

  constructor(req, xhr) {
    this.request = req;
    this.xhr = xhr;
    this.error = null;
    this.headers = parseResponseHeaders(xhr.getAllResponseHeaders());

    let body = this.response;

    try {
      let responseType = req.responseType;
      let contentType = req.responseContentType || this.contentType;

      // When the response type is not set or text and a string is delivered try to find a matching parser via the content type
      if((!responseType || responseType==='text') &&
          typeof body==='string' &&
          body.length &&
          contentType &&
          deserializers[contentType]) {
        try {
          body = deserializers[contentType](body);
        } catch(ex) {
          throw 'Invalid response';
        }
      // When the responseType is set and the response body is null, reject the request
      } else if(responseType &&
                this.status!==204 &&
                this.status!==205 &&
                body===null) {
                  throw 'Invalid response';
      }
    } catch(ex) {
      this.error = ex;
    }

    this.body = body;
  }

  get url() {
    return this.request.url;
  }

  get opts() {
    return this.request.opts;
  }

  get factory() {
    return this.request.factory;
  }

  get method() {
    return this.request.method;
  }

  get ok() {
    return !this.error;
  }

  get response() {
    return (!('response' in this.xhr)) ? this.xhr.responseText : this.xhr.response;
  }

  get status() {
    return this.xhr.status;
  }

  get statusText() {
    return this.xhr.statusText;
  }

  get contentType() {
    if(this.headers['content-type']) {
      return this.headers['content-type'].split(/ *; */).shift(); // char set
    } else {
      return null;
    }
  }
}
