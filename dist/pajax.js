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

  function merge() {
    var result = {};

    for (var _len = arguments.length, objects = Array(_len), _key = 0; _key < _len; _key++) {
      objects[_key] = arguments[_key];
    }

    objects.forEach(function (o) {
      o = o || {};
      Object.keys(o).forEach(function (key) {
        result[key] = o[key];
      });
    });
    return result;
  }

  var configurator = {
    mixin: {
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
      attach: function attach(body) {
        return this.clone({ 'body': body });
      },
      setTimeout: function setTimeout(timeout) {
        return this.clone({ 'timeout': timeout });
      },
      setContentType: function setContentType(contentType) {
        return this.clone({ 'contentType': contentType });
      },
      setConvertResponse: function setConvertResponse(convertResponse) {
        return this.clone({ 'convertResponse': convertResponse });
      },
      setConvertRequest: function setConvertRequest(convertRequest) {
        return this.clone({ 'convertRequest': convertRequest });
      },
      setResponseContentType: function setResponseContentType(responseContentType) {
        return this.clone({ 'responseContentType': responseContentType });
      },
      onProgress: function onProgress(progressCb) {
        return this.clone({ 'progress': progressCb });
      },
      withCredentials: function withCredentials(cred) {
        return this.clone({
          'credentials': typeof cred === 'string' ? cred : 'include'
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
      }
    },
    map: {
      body: true,
      method: true,
      timeout: true,
      contentType: true,
      convertRequest: true,
      convertResponse: true,
      responseContentType: true,
      mode: true,
      redirect: true,
      referrer: true,
      integrity: true,
      progress: true,
      credentials: true,
      cache: true,
      headers: function headers(h1, h2) {
        return new Headers(h1, h2);
      },
      pipelets: function pipelets(p1, p2) {
        p1 = p1 || {};
        p2 = p2 || {};
        return {
          before: (p2.before || []).concat(p1.before || []),
          after: (p2.after || []).concat(p1.after || []),
          afterSuccess: (p2.afterSuccess || []).concat(p1.afterSuccess || []),
          afterFailure: (p2.afterFailure || []).concat(p1.afterFailure || [])
        };
      }
    },
    assign: function assign(target) {
      var map = this.map;

      for (var _len2 = arguments.length, inits = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        inits[_key2 - 1] = arguments[_key2];
      }

      inits.forEach(function (init) {
        init = init || {};
        // Merge and uniquify keys
        Object.keys(map).forEach(function (key) {
          if (typeof map[key] === 'function') {
            target[key] = map[key](target[key], init[key]);
          } else if (map[key] === 'merge') {
            if (typeof init[key] === 'object') {
              target[key] = merge(target[key], init[key]);
            }
          } else if (init[key]) {
            target[key] = init[key];
          }
        });
      });
      return target;
    }
  };

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

  function match(obj, ct) {
    if (!ct) {
      return null;
    }
    var key = Object.keys(obj).find(function (key) {
      return ct.startsWith(key);
    });
    return key ? obj[key] : null;
  }

  function parseJSON(body) {
    try {
      return JSON.parse(body);
    } catch (ex) {
      throw 'Invalid JSON';
    }
  }

  var convertion = {
    typeMap: {
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
    },
    requestMap: {
      'application/json': 'text',
      'application/ld+json': 'text'
    },
    responseMap: {
      'application/json': 'json',
      'application/ld+json': 'json',
      'text/': 'text'
    },
    body: function body(_body, to) {
      var from = bodyType(_body);
      if (_body === null || _body === undefined || !from || from === to) {
        return Promise.resolve(_body);
      } else if (this.typeMap[to] && this.typeMap[to][from]) {
        return this.typeMap[to][from](_body);
      } else {
        return Promise.reject('Convertion from ' + from + ' to ' + to + ' not supported');
      }
    },
    request: function request(body, ct) {
      var to = match(this.requestMap, ct);
      if (to) {
        return this.body(body, to);
      } else {
        return Promise.resolve(body);
      }
    },
    response: function response(body, ct) {
      var to = match(this.responseMap, ct);
      if (to) {
        return this.body(body, to);
      } else {
        return Promise.resolve(body);
      }
    }
  };

  function convertBody(to) {
    return function (body) {
      return convertion.body(body, to);
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

  var Request = function (_Body) {
    _inherits(Request, _Body);

    function Request(url, init) {
      var _ref = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

      var factory = _ref.factory;

      _classCallCheck(this, Request);

      var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Request).call(this));

      Object.assign(_this, configurator.mixin);

      if (url instanceof Request) {
        _this.url = url.url;
        configurator.assign(_this, url);
      } else if (typeof url === 'string') {
        _this.url = url;
      }

      if (typeof _this.url !== 'string') {
        throw 'URL required for request';
      }

      configurator.assign(_this, init);
      _this.factory = factory;
      return _this;
    }

    _createClass(Request, [{
      key: 'clone',
      value: function clone(init) {
        return new this.constructor(this, init, { factory: this.factory });
      }
    }, {
      key: 'checkStatus',
      value: function checkStatus$$() {
        return this.after(checkStatus());
      }
    }, {
      key: 'get',
      value: function get() {
        return this.clone({ method: 'GET' });
      }
    }, {
      key: 'head',
      value: function head() {
        return this.clone({ method: 'HEAD' });
      }
    }, {
      key: 'delete',
      value: function _delete() {
        return this.clone({ method: 'DELETE' });
      }
    }, {
      key: 'post',
      value: function post() {
        return this.clone({ method: 'POST' });
      }
    }, {
      key: 'put',
      value: function put() {
        return this.clone({ method: 'PUT' });
      }
    }, {
      key: 'patch',
      value: function patch() {
        return this.clone({ method: 'PATCH' });
      }
    }, {
      key: 'fetch',
      value: function fetch() {
        if (!this.factory) {
          throw 'fetch() is only available on requests created with a pajax instance';
        }
        return this.factory.fetch(this);
      }
    }]);

    return Request;
  }(Body);

  var Response = function (_Body) {
    _inherits(Response, _Body);

    function Response(body) {
      var _ref = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      var status = _ref.status;
      var statusText = _ref.statusText;
      var headers = _ref.headers;

      var _ref2 = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

      var factory = _ref2.factory;
      var xhr = _ref2.xhr;
      var req = _ref2.req;
      var error = _ref2.error;

      _classCallCheck(this, Response);

      var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Response).call(this));

      _this.body = body;

      _this.status = status;
      _this.statusText = statusText;
      _this.headers = headers;

      _this.factory = factory;
      _this.request = req;
      _this.xhr = xhr;
      _this.error = error || null;
      return _this;
    }

    _createClass(Response, [{
      key: 'url',
      get: function get() {
        return this.request.url;
      }
    }, {
      key: 'ok',
      get: function get() {
        // SUCCESS: status between 200 and 299 or 304
        // Failure: status below 200 or beyond 299 excluding 304
        return this.status >= 200 && this.status < 300 || this.status === 304;
      }
    }]);

    return Response;
  }(Body);

  var handlers = {
    url: [],
    xhr: []
  };

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

    var factory = _ref.factory;

    var RequestCtor = factory && factory.constructor.Request || Request;
    var ResponseCtor = factory && factory.constructor.Response || Response;

    var req = undefined;
    if (url instanceof Request) {
      req = url;
    } else {
      req = new RequestCtor(url, init, { factory: factory });
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

    return pipe(before, req).then(function (req) {
      return new Promise(function (resolve, reject) {
        var url = req.url;

        handlers.url.forEach(function (urlHandler) {
          url = urlHandler(url, req);
        });

        var method = req.method || 'GET';

        xhr.open(method, url, true);

        handlers.xhr.forEach(function (xhrHandler) {
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
            statusText: xhr.statusText
          };

          var convertResponse = typeof req.convertResponse === 'boolean' ? convertResponse : true;

          var resBodyP = undefined;
          if (convertResponse) {
            // Auto convert response using the content type
            var _contentType = undefined;
            if (req.responseContentType) {
              _contentType = req.responseContentType;
            } else if (Blob.prototype.isPrototypeOf(resBody)) {
              _contentType = resBody.type;
            } else if (headers['content-type']) {
              _contentType = headers['content-type'].split(/ *; */).shift();
            }
            resBodyP = convertion.response(resBody, _contentType);
          } else {
            resBodyP = Promise.resolve(resBody);
          }

          return resBodyP.then(function (body) {
            resolve(new ResponseCtor(body, resInit, { xhr: xhr, req: req, factory: factory }));
          }, function (error) {
            reject(new ResponseCtor(resBody, resInit, { xhr: xhr, req: req, factory: factory, error: error }));
          });
        };

        var convertRequest = typeof req.convertRequest === 'boolean' ? convertRequest : true;
        var contentType = req.contentType;

        var reqBodyP = undefined;
        if (convertRequest) {
          // Auto convert requests using body's content type
          // Fallback to json if body is object and no content type is set
          if (!contentType && req.body && typeof req.body === 'object') {
            contentType = 'application/json';
          }
          reqBodyP = convertion.request(req.body, contentType);
        } else {
          reqBodyP = Promise.resolve(req.body);
        }

        reqBodyP.then(function (reqBody) {

          // Add content type header only when body is attached
          if (reqBody !== undefined && contentType) {
            xhr.setRequestHeader('Content-Type', contentType);
          }

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
  }

  var Pajax = function () {
    function Pajax(defaults) {
      _classCallCheck(this, Pajax);

      this.defaults = {};
      Object.assign(this, configurator.mixin);
      configurator.assign(this.defaults, defaults);
    }

    _createClass(Pajax, [{
      key: 'get',
      value: function get(url) {
        var init = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        return this.request(url, init).get().after(checkStatus()).fetch();
      }
    }, {
      key: 'head',
      value: function head(url) {
        var init = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        return this.request(url, init).head().after(checkStatus()).fetch();
      }
    }, {
      key: 'delete',
      value: function _delete(url) {
        var init = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        return this.request(url, init).delete().after(checkStatus()).fetch();
      }
    }, {
      key: 'post',
      value: function post(url, body) {
        var init = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

        return this.request(url, init).post().attach(body).after(checkStatus()).fetch();
      }
    }, {
      key: 'put',
      value: function put(url, body) {
        var init = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

        return this.request(url, init).put().attach(body).after(checkStatus()).fetch();
      }
    }, {
      key: 'patch',
      value: function patch(url, body) {
        var init = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

        return this.request(url, init).patch().attach(body).after(checkStatus()).fetch();
      }
    }, {
      key: 'request',
      value: function request(url, init) {
        // Merge defaults
        init = configurator.assign({}, this.defaults, init);
        var RequestCtor = this.constructor.Request || Request;
        return new RequestCtor(url, init, { factory: this });
      }
    }, {
      key: 'fetch',
      value: function fetch$$(url, init) {
        // Merge defaults
        init = configurator.assign({}, this.defaults, init);
        return fetch(url, init, { factory: this });
      }
    }, {
      key: 'JSON',
      value: function JSON(force) {
        var ct = 'application/json';
        var pajax = this.setContentType(ct).header('Accept', ct);
        return force ? pajax.setResponseContentType(ct) : pajax;
      }
    }, {
      key: 'clone',
      value: function clone(defaults) {
        return new this.constructor(configurator.assign({}, this.defaults, defaults));
      }
    }], [{
      key: 'request',
      value: function request() {
        var _ref;

        return (_ref = new this()).request.apply(_ref, arguments);
      }
    }, {
      key: 'fetch',
      value: function fetch$$() {
        return fetch.apply(undefined, arguments);
      }
    }, {
      key: 'get',
      value: function get() {
        var _ref2;

        return (_ref2 = new this()).get.apply(_ref2, arguments);
      }
    }, {
      key: 'head',
      value: function head() {
        var _ref3;

        return (_ref3 = new this()).head.apply(_ref3, arguments);
      }
    }, {
      key: 'post',
      value: function post() {
        var _ref4;

        return (_ref4 = new this()).post.apply(_ref4, arguments);
      }
    }, {
      key: 'put',
      value: function put() {
        var _ref5;

        return (_ref5 = new this()).put.apply(_ref5, arguments);
      }
    }, {
      key: 'delete',
      value: function _delete() {
        var _ref6;

        return (_ref6 = new this()).delete.apply(_ref6, arguments);
      }
    }, {
      key: 'patch',
      value: function patch() {
        var _ref7;

        return (_ref7 = new this()).patch.apply(_ref7, arguments);
      }
    }, {
      key: 'del',
      value: function del() {
        return this.delete.apply(this, arguments);
      }
    }, {
      key: 'checkStatus',
      value: function checkStatus$$() {
        return checkStatus.apply(undefined, arguments);
      }
    }]);

    return Pajax;
  }();

  Pajax.handlers = handlers;
  Pajax.convertion = convertion;
  Pajax.configurator = configurator;
  Pajax.Headers = Headers;
  Pajax.Request = Request;
  Pajax.Response = Response;

  return Pajax;

}));