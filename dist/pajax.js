(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.Pajax = factory());
}(this, function () { 'use strict';

  var _classCallCheck = (function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  })

  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };

  var _possibleConstructorReturn = (function (self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  })

  var _inherits = (function (subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  })

  function reader2Promise(reader) {
    return new Promise(function (resolve, reject) {
      reader.onload = function () {
        resolve(reader.result);
      };
      reader.onerror = function () {
        reject(reader.error);
      };
    });
  }

  function blob2ArrayBuffer(blob) {
    var reader = new FileReader();
    reader.readAsArrayBuffer(blob);
    return reader2Promise(reader);
  }

  function blob2text(blob) {
    var reader = new FileReader();
    reader.readAsText(blob);
    return reader2Promise(reader);
  }

  function bodyType(body) {
    if (typeof body === 'string') {
      return 'text';
    } else if (Blob.prototype.isPrototypeOf(body)) {
      return 'blob';
    } else if (FormData.prototype.isPrototypeOf(body)) {
      return 'formData';
    } else if (body && typeof body === 'object') {
      return 'json';
    } else {
      return null;
    }
  }

  function parseJSON(body) {
    try {
      return JSON.parse(body);
    } catch (ex) {
      throw 'Invalid JSON';
    }
  }

  var map = {
    text: {
      json: function json(body) {
        return Promise.resolve(JSON.stringify(body));
      },
      blob: function blob(body) {
        return blob2text(body);
      }
    },
    json: {
      text: function text(body) {
        return Promise.resolve(parseJSON(body));
      },
      blob: function blob(body) {
        return blob2text(body).then(parseJSON);
      }
    },
    blob: {
      text: function text(body) {
        return Promise.resolve(new Blob([body]));
      },
      json: function json(body) {
        return Promise.resolve(new Blob([JSON.stringify(body)]));
      }
    },
    arrayBuffer: {
      blob: function blob(body) {
        return blob2ArrayBuffer(body);
      }
    }
  };

  function convertBody(to) {
    return function (body) {
      var from = bodyType(body);
      if (body === null || body === undefined || !from || from === to) {
        return Promise.resolve(body);
      } else if (map[to] && map[to][from]) {
        return map[to][from](body);
      } else {
        return Promise.reject('Convertion from ' + from + ' to ' + to + ' not supported');
      }
    };
  }

  var Body = function () {
    function Body() {
      _classCallCheck(this, Body);

      this.bodyUsed = false;
    }

    _createClass(Body, [{
      key: 'text',
      value: function text() {
        return this.consumeBody().then(convertBody('text'));
      }
    }, {
      key: 'blob',
      value: function blob() {
        return this.consumeBody().then(convertBody('blob'));
      }
    }, {
      key: 'formData',
      value: function formData() {
        return this.consumeBody().then(convertBody('formData'));
      }
    }, {
      key: 'json',
      value: function json() {
        return this.consumeBody().then(convertBody('json'));
      }
    }, {
      key: 'arrayBuffer',
      value: function arrayBuffer() {
        return this.consumeBody().then(convertBody('ArrayBuffer'));
      }
    }, {
      key: 'consumeBody',
      value: function consumeBody() {
        if (this.bodyUsed) {
          // TODO: Reject when body was used?
          //   return Promise.reject(...);
          return Promise.resolve(this.body);
        } else {
          this.bodyUsed = true;
          return Promise.resolve(this.body);
        }
      }
    }, {
      key: 'convert',
      value: function convert(to) {
        return this.consumeBody().then(convertBody(to));
      }
    }]);

    return Body;
  }();

  function checkStatus() {
    return function (res) {
      if (!res.error && !res.ok) {
        // Unknown status code
        if (res.status < 100 || res.status >= 1000) {
          res.error = 'Invalid status code';
        } else {
          // Use statusText as error
          if (res.statusText) {
            res.error = res.statusText;
          } else {
            // Unknown error
            res.error = 'Request failed';
          }
        }
      }
      if (res.error) {
        return Promise.reject(res);
      } else {
        return Promise.resolve(res);
      }
    };
  }

  function normalizeName(name) {
    return String(name).toLowerCase().trim();
  }

  function normalizeValue(name) {
    return String(name);
  }

  // Parses that string into a user-friendly key/value pair object.
  // http://www.w3.org/TR/XMLHttpRequest/#the-getallresponseheaders-method
  function parseResponseHeaders(headerStr) {
    var headers = {};
    if (!headerStr) {
      return headers;
    }
    var headerPairs = headerStr.split('\r\n');
    for (var i = 0; i < headerPairs.length; i++) {
      var headerPair = headerPairs[i];
      // Can't use split() here because it does the wrong thing
      // if the header value has the string ": " in it.
      var index = headerPair.indexOf(': ');
      if (index > 0) {
        var name = normalizeName(headerPair.substring(0, index));
        var value = normalizeValue(headerPair.substring(index + 2));
        headers[name] = value.trim();
      }
    }
    return headers;
  }

  var Headers = function () {
    function Headers() {
      var _this = this;

      _classCallCheck(this, Headers);

      this.headers = {};

      for (var _len = arguments.length, headersArr = Array(_len), _key = 0; _key < _len; _key++) {
        headersArr[_key] = arguments[_key];
      }

      headersArr.forEach(function (headers) {

        if (headers && typeof headers === 'string') {
          headers = parseResponseHeaders(headers);
        }

        if (headers instanceof Headers) {
          headers.keys().forEach(function (name) {
            _this.append(name, headers.get(name));
          });
        } else if (headers && typeof headers === 'object') {
          Object.keys(headers).forEach(function (key) {
            _this.append(key, headers[key]);
          });
        }
      });
    }

    _createClass(Headers, [{
      key: 'append',
      value: function append(name, value) {
        name = normalizeName(name);
        value = normalizeValue(value);
        this.headers[name] = this.headers[name] || [];
        this.headers[name].push(value);
      }
    }, {
      key: 'delete',
      value: function _delete(name) {
        delete this.headers[normalizeName(name)];
      }
    }, {
      key: 'get',
      value: function get(name) {
        name = normalizeName(name);
        var values = this.headers[name] || [];
        return values.length > 0 ? values[0] : null;
      }
    }, {
      key: 'getAll',
      value: function getAll(name) {
        name = normalizeName(name);
        return this.headers[name] || [];
      }
    }, {
      key: 'has',
      value: function has(name) {
        name = normalizeName(name);
        return !!this.headers[name];
      }
    }, {
      key: 'set',
      value: function set(name, value) {
        name = normalizeName(name);
        value = normalizeValue(value);
        this.headers[name] = [value];
      }
    }, {
      key: 'keys',
      value: function keys() {
        return Object.keys(this.headers);
      }
    }, {
      key: 'values',
      value: function values() {
        var _this2 = this;

        return Object.keys(this.headers).map(function (name) {
          return _this2.get(name);
        });
      }
    }, {
      key: 'entries',
      value: function entries() {
        var _this3 = this;

        return Object.keys(this.headers).map(function (name) {
          return [name, _this3.get(name)];
        });
      }
    }]);

    return Headers;
  }();

  var def = {
    fetch: {
      url: [],
      xhr: []
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
      headers: function headers(_headers, reqHeaders) {
        return new Headers(reqHeaders, _headers);
      },
      pipelets: function pipelets(_pipelets, reqPipelets) {
        _pipelets = _pipelets || {};
        reqPipelets = reqPipelets || {};
        return {
          before: (reqPipelets.before || []).concat(_pipelets.before || []),
          after: (reqPipelets.after || []).concat(_pipelets.after || []),
          afterSuccess: (reqPipelets.afterSuccess || []).concat(_pipelets.afterSuccess || []),
          afterFailure: (reqPipelets.afterFailure || []).concat(_pipelets.afterFailure || [])
        };
      }
    }
  };

  function match(ct) {
    if (!ct) {
      return null;
    }
    var key = Object.keys(def.dataTypeMap).find(function (key) {
      return ct.startsWith(key);
    });
    return key ? def.dataTypeMap[key] : null;
  }

  var Response = function (_Body) {
    _inherits(Response, _Body);

    function Response(body) {
      var _ref = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      var status = _ref.status;
      var statusText = _ref.statusText;
      var headers = _ref.headers;
      var url = _ref.url;
      var error = _ref.error;
      var dataType = _ref.dataType;

      _classCallCheck(this, Response);

      var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Response).call(this));

      _this.body = body;
      _this.status = status;
      _this.statusText = statusText;
      _this.headers = headers;
      _this.url = url;
      _this.error = error || null;
      _this.dataType = dataType;
      return _this;
    }

    _createClass(Response, [{
      key: 'clone',
      value: function clone() {
        return new this.constructor(this.body, {
          status: this.status,
          statusText: this.statusText,
          headers: this.headers,
          url: this.url,
          error: this.error,
          dataType: this.dataType
        });
      }

      // autoconverts body based on the dataType or the response's contentType
      // dataType is determined in the following order
      // - the dataType field on a request
      // - if the response is a blob, by the blobs content type
      // - content type in the response header

    }, {
      key: 'auto',
      value: function auto() {
        var _this2 = this;

        var dataType = undefined;
        if (this.dataType) {
          dataType = this.dataType;
        } else if (Blob.prototype.isPrototypeOf(this.body)) {
          dataType = match(this.body.type);
        } else if (this.headers.get('content-type')) {
          var contentType = this.headers.get('content-type').split(/ *; */).shift();
          dataType = match(contentType);
        }

        if (dataType) {
          return this.convert(dataType).catch(function (err) {
            // Set error and reject the response when convertion fails
            _this2.error = err;
            return Promise.reject(_this2);
          });
        } else {
          return Promise.resolve(this.body);
        }
      }
    }, {
      key: 'ok',
      get: function get() {
        // Success: status between 200 and 299 or 304
        // Failure: status below 200 or beyond 299 excluding 304
        return this.status >= 200 && this.status < 300 || this.status === 304;
      }
    }]);

    return Response;
  }(Body);

  function pipe(pipelets, o) {
    var pipe = Promise.resolve(o);
    (pipelets || []).forEach(function (pipelet) {
      // chain together
      pipe = pipe.then(pipelet);
    });
    return pipe;
  }

  function fetch(url, init) {
    var _this = this;

    var _ref = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

    var returnType = _ref.returnType;

    var req = undefined;
    if (url instanceof Request) {
      req = url;
    } else {
      req = new Request(url, init);
    }

    // The XMLHttpRequest object is recreated at every request to defeat caching problems in IE
    var xhr = undefined;
    try {
      xhr = new XMLHttpRequest();
    } catch (e) {
      throw 'Could not create XMLHttpRequest object';
    }

    var _ref2 = req.pipelets || {};

    var before = _ref2.before;
    var after = _ref2.after;
    var afterSuccess = _ref2.afterSuccess;
    var afterFailure = _ref2.afterFailure;

    // Resolve before pipelets

    var promise = pipe(before, req).then(function (req) {
      return new Promise(function (resolve, reject) {
        var url = req.url;

        if (typeof url !== 'string') {
          throw 'URL required for request';
        }

        def.fetch.url.forEach(function (urlHandler) {
          url = urlHandler(url, req);
        });

        var method = req.method || 'GET';

        xhr.open(method, url, true);

        def.fetch.xhr.forEach(function (xhrHandler) {
          xhrHandler(xhr, req);
        });

        // Add custom headers
        if (req.headers) {
          req.headers.keys().forEach(function (key) {
            xhr.setRequestHeader(key, req.headers.get(key));
          });
        }

        // Register upload progress listener
        if (req.progress && xhr.upload) {
          xhr.upload.addEventListener('progress', function () {
            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
              args[_key] = arguments[_key];
            }

            req.progress.apply(req, [_this].concat(args));
          }, false);
        }

        // Set the timeout
        if (typeof req.timeout === 'number') {
          xhr.timeout = req.timeout;
        }

        // Set withCredentials
        if (req.credentials === 'include') {
          xhr.withCredentials = true;
        }

        // Caching
        if (req.cache) {
          xhr.setRequestHeader('cache-control', req.cache);
        }

        // Use blob whenever possible
        if ('responseType' in xhr) {
          xhr.responseType = 'blob';
        }

        var xhrCallback = function xhrCallback(error) {
          var headers = new Headers(xhr.getAllResponseHeaders());
          var resBody = !('response' in xhr) ? xhr.responseText : xhr.response;

          var resInit = {
            headers: headers,
            status: xhr.status,
            statusText: xhr.statusText,
            dataType: req.dataType,
            error: error,
            url: url
          };

          var ResponseCtor = req.Response || Response;
          resolve(new ResponseCtor(resBody, resInit, { error: error, url: url }));
        };

        // Callback for errors
        xhr.onerror = function () {
          xhrCallback('Network error');
        };

        // Callback for timeouts
        xhr.ontimeout = function () {
          xhrCallback('Timeout');
        };

        // Callback for document loaded.
        xhr.onload = function () {
          xhrCallback();
        };

        var contentType = req.contentType;
        var reqBodyP = undefined;

        // Fallback to json if body is object and no content type is set
        if (!contentType && req.body && typeof req.body === 'object') {
          contentType = 'application/json';
          reqBodyP = req.text();
        } else {
          reqBodyP = Promise.resolve(req.body);
        }

        reqBodyP.then(function (reqBody) {
          // Add content type header only when body is attached
          if (reqBody !== undefined && contentType) {
            xhr.setRequestHeader('Content-Type', contentType);
          }

          xhr.send(reqBody);
        }, function (err) {
          xhrCallback('Invalid request body');
        });
      });
    }).then(function (res) {
      // Resolve after pipelets
      return pipe(after, res);
    }, function (res) {
      // Resolve after pipelets and reject afterwars
      return pipe(after, res).then(function (res) {
        return Promise.reject(res);
      });
    }).then(function (res) {
      // Resolve or reject based on error
      if (res.error) {
        return Promise.reject(res);
      } else {
        return Promise.resolve(res);
      }
    }).then(function (res) {
      // Still not rejected? Resolve afterSuccess
      return pipe(afterSuccess, res);
    }, function (res) {
      if (res instanceof Response) {
        // When any pipelet rejects with a response object
        // resolve the afterFailure pipelets but still reject
        return pipe(afterFailure, res).then(function (res) {
          return Promise.reject(res);
        });
      } else {
        // Otherwise just pass through the error
        return Promise.reject(res);
      }
    });

    if (returnType === 'meta') {
      return {
        xhr: xhr,
        promise: promise
      };
    } else {
      return promise;
    }
  }

  var _defineProperty = (function (obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  })

  var operators = {
    before: function before(func) {
      return this.clone({ 'pipelets': { before: [func] } });
    },
    after: function after(func) {
      return this.clone({ 'pipelets': { after: [func] } });
    },
    afterSuccess: function afterSuccess(func) {
      return this.clone({ 'pipelets': { afterSuccess: [func] } });
    },
    afterFailure: function afterFailure(func) {
      return this.clone({ 'pipelets': { afterFailure: [func] } });
    },
    setTimeout: function setTimeout(timeout) {
      return this.clone({ 'timeout': timeout });
    },
    type: function type(contentType) {
      return this.clone({ 'contentType': contentType });
    },
    is: function is(method) {
      return this.clone({ 'method': method });
    },
    onProgress: function onProgress(progressCb) {
      return this.clone({ 'progress': progressCb });
    },
    withCredentials: function withCredentials() {
      return this.clone({
        'credentials': 'include'
      });
    },
    noCache: function noCache(_noCache) {
      return this.clone({
        'cache': _noCache === false ? 'default' : 'no-cache'
      });
    },
    header: function header(_header, value) {
      if (typeof _header === 'string' && value !== undefined) {
        return this.clone({ headers: _defineProperty({}, _header, value) });
      } else if (typeof _header === 'string' && value === undefined) {
        return this.clone({ headers: _defineProperty({}, _header, undefined) });
      } else if (typeof _header === 'object') {
        return this.clone({ headers: _header });
      }
      return this;
    },
    accept: function accept(ct) {
      return this.header('Accept', ct);
    },
    attach: function attach(body) {
      return this.clone({ 'body': body });
    },
    asJSON: function asJSON() {
      return this.clone({ 'dataType': 'json' });
    },
    asBlob: function asBlob() {
      return this.clone({ 'dataType': 'blob' });
    },
    asText: function asText() {
      return this.clone({ 'dataType': 'text' });
    },
    asArrayBuffer: function asArrayBuffer() {
      return this.clone({ 'dataType': 'arrayBuffer' });
    }
  };

  var Request = function (_Body) {
    _inherits(Request, _Body);

    function Request(url, init) {
      _classCallCheck(this, Request);

      var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Request).call(this));

      if (url instanceof Request) {
        _this.url = url.url;
        _this.assign(url);
      } else if (typeof url === 'string') {
        _this.url = url;
      }
      if (typeof init === 'object') {
        _this.assign(init);
      }
      return _this;
    }

    _createClass(Request, [{
      key: 'assign',
      value: function assign() {
        var _this2 = this;

        var init = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        // Assign request options
        var options = def.request;
        Object.keys(options).forEach(function (key) {
          if (typeof options[key] === 'function') {
            _this2[key] = options[key](init[key], _this2[key]);
          } else if (init[key]) {
            _this2[key] = init[key];
          }
        });
        return this;
      }
    }, {
      key: 'clone',
      value: function clone(init) {
        return new this.constructor(this, init);
      }
    }, {
      key: 'spawn',
      value: function spawn(url, init) {
        var req = new this.constructor(this);
        if (url instanceof Request) {
          req.assign(url);
        } else if (typeof url === 'string') {
          req.url = url;
          return req.assign(init);
        }
        return req.assign(init);
      }
    }, {
      key: 'checkStatus',
      value: function checkStatus$$() {
        return this.after(checkStatus());
      }
    }, {
      key: 'fetch',
      value: function fetch$$() {
        return fetch(this);
      }
    }, {
      key: 'get',
      value: function get() {
        return this.is('GET').checkStatus().fetch();
      }
    }, {
      key: 'getAuto',
      value: function getAuto() {
        return this.is('GET').checkStatus().fetch().then(function (res) {
          return res.auto();
        });
      }
    }, {
      key: 'getJSON',
      value: function getJSON() {
        return this.is('GET').checkStatus().fetch().then(function (res) {
          return res.json();
        });
      }
    }, {
      key: 'getText',
      value: function getText() {
        return this.is('GET').checkStatus().fetch().then(function (res) {
          return res.text();
        });
      }
    }, {
      key: 'getBlob',
      value: function getBlob() {
        return this.is('GET').checkStatus().fetch().then(function (res) {
          return res.blob();
        });
      }
    }, {
      key: 'getArrayBuffer',
      value: function getArrayBuffer() {
        return this.is('GET').checkStatus().fetch().then(function (res) {
          return res.arrayBuffer();
        });
      }
    }, {
      key: 'getFormData',
      value: function getFormData() {
        return this.is('GET').checkStatus().fetch().then(function (res) {
          return res.formData();
        });
      }
    }, {
      key: 'delete',
      value: function _delete() {
        return this.is('DELETE').checkStatus().fetch();
      }
    }, {
      key: 'post',
      value: function post() {
        return this.is('POST').checkStatus().fetch();
      }
    }, {
      key: 'put',
      value: function put() {
        return this.is('PUT').checkStatus().fetch();
      }
    }, {
      key: 'patch',
      value: function patch() {
        return this.is('PATCH').checkStatus().fetch();
      }
    }]);

    return Request;
  }(Body);

  Object.assign(Request.prototype, operators);

  var Pajax = function () {
    function Pajax(init) {
      _classCallCheck(this, Pajax);

      var RequestCtor = this.constructor.Request || Request;
      var ResponseCtor = this.constructor.Response || Response;
      this.req = new RequestCtor(null, init).assign({ Response: ResponseCtor });
    }

    _createClass(Pajax, [{
      key: 'get',
      value: function get(url) {
        var init = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        return this.request(url, init).get();
      }
    }, {
      key: 'getAuto',
      value: function getAuto(url) {
        var init = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        return this.request(url, init).getAuto();
      }
    }, {
      key: 'getJSON',
      value: function getJSON(url) {
        var init = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        return this.request(url, init).getJSON();
      }
    }, {
      key: 'getText',
      value: function getText(url) {
        var init = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        return this.request(url, init).getText();
      }
    }, {
      key: 'getBlob',
      value: function getBlob(url) {
        var init = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        return this.request(url, init).getBlob();
      }
    }, {
      key: 'getArrayBuffer',
      value: function getArrayBuffer(url) {
        var init = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        return this.request(url, init).getArrayBuffer();
      }
    }, {
      key: 'getFormData',
      value: function getFormData(url) {
        var init = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        return this.request(url, init).getFormData();
      }
    }, {
      key: 'delete',
      value: function _delete(url) {
        var init = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        return this.request(url, init).delete();
      }
    }, {
      key: 'post',
      value: function post(url, body) {
        var init = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

        return this.request(url, init).attach(body).post();
      }
    }, {
      key: 'put',
      value: function put(url, body) {
        var init = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

        return this.request(url, init).attach(body).put();
      }
    }, {
      key: 'patch',
      value: function patch(url, body) {
        var init = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

        return this.request(url, init).attach(body).patch();
      }
    }, {
      key: 'request',
      value: function request(url, init) {
        // Merge defaults
        return this.req.spawn(url, init);
      }
    }, {
      key: 'fetch',
      value: function fetch$$(url, init) {
        // Merge defaults
        return fetch(this.req.spawn(url, init));
      }
    }, {
      key: 'clone',
      value: function clone(init) {
        return new this.constructor(this.req.clone(init));
      }
    }, {
      key: 'JSON',
      value: function JSON() {
        var ct = 'application/json';
        return this.header('Accept', ct).asJSON();
      }
    }], [{
      key: 'fetch',
      value: function fetch$$() {
        return fetch.apply(undefined, arguments);
      }
    }, {
      key: 'request',
      value: function request() {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        return new (Function.prototype.bind.apply(Request, [null].concat(args)))();
      }
    }, {
      key: 'get',
      value: function get() {
        var _ref;

        return (_ref = new this()).get.apply(_ref, arguments);
      }
    }, {
      key: 'getAuto',
      value: function getAuto() {
        var _ref2;

        return (_ref2 = new this()).getAuto.apply(_ref2, arguments);
      }
    }, {
      key: 'getJSON',
      value: function getJSON() {
        var _ref3;

        return (_ref3 = new this()).getJSON.apply(_ref3, arguments);
      }
    }, {
      key: 'getText',
      value: function getText() {
        var _ref4;

        return (_ref4 = new this()).getText.apply(_ref4, arguments);
      }
    }, {
      key: 'getBlob',
      value: function getBlob() {
        var _ref5;

        return (_ref5 = new this()).getBlob.apply(_ref5, arguments);
      }
    }, {
      key: 'getArrayBuffer',
      value: function getArrayBuffer() {
        var _ref6;

        return (_ref6 = new this()).getArrayBuffer.apply(_ref6, arguments);
      }
    }, {
      key: 'getFormData',
      value: function getFormData() {
        var _ref7;

        return (_ref7 = new this()).getFormData.apply(_ref7, arguments);
      }
    }, {
      key: 'post',
      value: function post() {
        var _ref8;

        return (_ref8 = new this()).post.apply(_ref8, arguments);
      }
    }, {
      key: 'put',
      value: function put() {
        var _ref9;

        return (_ref9 = new this()).put.apply(_ref9, arguments);
      }
    }, {
      key: 'delete',
      value: function _delete() {
        var _ref10;

        return (_ref10 = new this()).delete.apply(_ref10, arguments);
      }
    }, {
      key: 'patch',
      value: function patch() {
        var _ref11;

        return (_ref11 = new this()).patch.apply(_ref11, arguments);
      }
    }, {
      key: 'checkStatus',
      value: function checkStatus$$() {
        return checkStatus.apply(undefined, arguments);
      }
    }]);

    return Pajax;
  }();

  Object.assign(Pajax.prototype, operators);

  Pajax.def = def;
  Pajax.Headers = Headers;
  Pajax.Request = Request;
  Pajax.Response = Response;

  return Pajax;

}));