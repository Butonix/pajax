import qs from './qs';

// Parses that string into a user-friendly key/value pair object.
// http://www.w3.org/TR/XMLHttpRequest/#the-getallresponseheaders-method
export var parseResponseHeaders = function(headerStr) {
  var headers = {};
  if (!headerStr) {
    return headers;
  }
  var headerPairs = headerStr.split('\u000d\u000a');
  for (var i = 0; i < headerPairs.length; i++) {
    var headerPair = headerPairs[i];
    // Can't use split() here because it does the wrong thing
    // if the header value has the string ": " in it.
    var index = headerPair.indexOf('\u003a\u0020');
    if (index > 0) {
      var key = headerPair.substring(0, index).toLowerCase();
      headers[key] = headerPair.substring(index + 2);
    }
  }
  return headers;
}

var parsers = {
  'application/json': JSON.parse,
  'application/ld+json': JSON.parse,
  'application/x-www-form-urlencoded': qs.parse
};

export default class PajaxResult {

  constructor(req, xhr) {
    this.request = req;
    this.xhr = xhr;
    this.error = null;
    this.headers = parseResponseHeaders(xhr.getAllResponseHeaders());

    var body = this.response;

    try {
      var responseType = req.opts.responseType;
      var contentType = req.opts.responseContentType || this.contentType;

      // When the response type is not set or text and a string is delivered try to find a matching parser via the content type
      if((!responseType || responseType==='text') &&
          typeof body==='string' &&
          body.length &&
          contentType &&
          parsers[contentType]) {
        try {
          body = parsers[contentType](body);
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

  get factory() {
    return this.request.factory;
  }

  get method() {
    return this.request.method;
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
