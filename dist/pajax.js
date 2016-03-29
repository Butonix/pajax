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

  function convertBody(body, to) {
    var from = bodyType(body);
    if (body === null || body === undefined || !from || from === to) {
      return Promise.resolve(body);
    } else if (map[to] && map[to][from]) {
      return map[to][from](body);
    } else {
      return Promise.reject('Convertion from ' + from + ' to ' + to + ' not supported');
    }
  }

  var Body = function () {
    function Body() {
      _classCallCheck(this, Body);

      this.bodyUsed = false;
    }

    _createClass(Body, [{
      key: 'text',
      value: function text() {
        return this.consumeBody().then(function (body) {
          return convertBody(body, 'text');
        });
      }
    }, {
      key: 'blob',
      value: function blob() {
        return this.consumeBody().then(function (body) {
          return convertBody(body, 'blob');
        });
      }
    }, {
      key: 'formData',
      value: function formData() {
        return this.consumeBody().then(function (body) {
          return convertBody(body, 'formData');
        });
      }
    }, {
      key: 'json',
      value: function json() {
        return this.consumeBody().then(function (body) {
          return convertBody(body, 'json');
        });
      }
    }, {
      key: 'arrayBuffer',
      value: function arrayBuffer() {
        return this.consumeBody().then(function (body) {
          return convertBody(body, 'ArrayBuffer');
        });
      }
    }, {
      key: 'consumeBody',
      value: function consumeBody() {
        if (this.bodyUsed) {
          // TODO: Reject when body was used?
          //   return Promise.reject(...);
          return Promise.resolve(this._body);
        } else {
          this.bodyUsed = true;
          return Promise.resolve(this._body);
        }
      }
    }]);

    return Body;
  }();

  function checkStatus(res) {
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
  }

  function sliceIterator(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _slicedToArray (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }
  };

  var _toConsumableArray = (function (arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
        arr2[i] = arr[i];
      }return arr2;
    } else {
      return Array.from(arr);
    }
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

  var def = {
    operators: {
      before: function before(func) {
        return this.spawn({ before: [func] });
      },
      after: function after(func) {
        return this.spawn({ after: [func] });
      },
      afterSuccess: function afterSuccess(func) {
        return this.spawn({ afterSuccess: [func] });
      },
      afterFailure: function afterFailure(func) {
        return this.spawn({ afterFailure: [func] });
      },
      setTimeout: function setTimeout(timeout) {
        return this.spawn({ 'timeout': timeout });
      },
      type: function type(contentType) {
        return this.spawn({ 'contentType': contentType });
      },
      is: function is(method) {
        return this.spawn({ 'method': method });
      },
      onProgress: function onProgress(progressCb) {
        return this.spawn({ 'progress': progressCb });
      },
      withCredentials: function withCredentials() {
        return this.spawn({
          'credentials': 'include'
        });
      },
      noCache: function noCache(_noCache) {
        return this.spawn({
          'cache': _noCache === false ? 'default' : 'no-cache'
        });
      },
      header: function header(_header, value) {
        if (typeof _header === 'string' && value !== undefined) {
          return this.spawn({ headers: _defineProperty({}, _header, value) });
        } else if (typeof _header === 'string' && value === undefined) {
          return this.spawn({ headers: _defineProperty({}, _header, undefined) });
        } else if (typeof _header === 'object') {
          return this.spawn({ headers: _header });
        }
        return this;
      },
      accept: function accept(ct) {
        return this.header('Accept', ct);
      },
      attach: function attach(body) {
        return this.spawn({ 'body': body });
      }
    },
    pipelets: {
      before: [],
      after: [],
      afterSuccess: [],
      afterFailure: []
    },
    serializers: {
      'application/json': JSON.stringify,
      'application/ld+json': JSON.stringify,
      'application/x-www-form-urlencoded': function applicationXWwwFormUrlencoded(body) {
        return Object.keys(body).map(function (k) {
          return encodeURIComponent(k) + '=' + encodeURIComponent(body[k]);
        }).join('&');
      }
    },
    autoMap: {
      'application/json': 'json',
      'application/ld+json': 'json',
      'text/': 'text',
      'application/xml': 'text'
    },
    request: {
      merge: {
        headers: function headers(h1, h2) {
          return new Headers(h1, h2);
        },
        before: function before(p1, p2) {
          return [].concat(p1 || [], p2 || []);
        },
        after: function after(p1, p2) {
          return [].concat(p1 || [], p2 || []);
        },
        afterSuccess: function afterSuccess(p1, p2) {
          return [].concat(p1 || [], p2 || []);
        },
        afterFailure: function afterFailure(p1, p2) {
          return [].concat(p1 || [], p2 || []);
        }
      },
      assign: {
        body: '_body',
        url: true,
        method: true,
        pajax: true,
        timeout: true,
        contentType: true,
        mode: true,
        redirect: true,
        referrer: true,
        integrity: true,
        progress: true,
        credentials: true,
        cache: true,
        Response: true,
        headers: true,
        before: 'beforePipelets',
        after: 'afterPipelets',
        afterSuccess: 'afterSuccessPipelets',
        afterFailure: 'afterFailurePipelets'
      }
    }
  };

  function match(ct) {
    if (!ct) {
      return null;
    }
    var key = Object.keys(def.autoMap).find(function (key) {
      return ct.startsWith(key);
    });
    return key ? def.autoMap[key] : null;
  }

  var Response = function (_Body) {
    _inherits(Response, _Body);

    function Response(body) {
      var _ref = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      var status = _ref.status;
      var statusText = _ref.statusText;
      var headers = _ref.headers;
      var url = _ref.url;
      var pajax = _ref.pajax;
      var error = _ref.error;
      var request = _ref.request;

      _classCallCheck(this, Response);

      var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Response).call(this));

      _this._body = body;
      _this.status = status;
      _this.statusText = statusText;
      _this.headers = headers;
      _this.url = url;
      _this.pajax = pajax;
      _this.request = request;
      _this.error = error || undefined;
      return _this;
    }

    _createClass(Response, [{
      key: 'clone',
      value: function clone() {
        return new this.constructor(this._body, {
          status: this.status,
          statusText: this.statusText,
          headers: this.headers,
          url: this.url,
          pajax: this.pajax,
          request: this.request,
          error: this.error
        });
      }

      // autoconverts body based on the the response's contentType
      // dataType is determined in the following order
      // - the dataType field on a request
      // - if the response is a blob, by the blobs content type
      // - content type in the response header

    }, {
      key: 'auto',
      value: function auto() {
        var _this2 = this;

        return this.consumeBody().then(function (body) {
          var dataType = undefined;
          if (Blob.prototype.isPrototypeOf(body)) {
            dataType = match(body.type);
          } else if (_this2.headers.get('content-type')) {
            var contentType = _this2.headers.get('content-type').split(/ *; */).shift();
            dataType = match(contentType);
          }

          if (dataType) {
            return convertBody(body, dataType).catch(function (err) {
              // Set error and reject the response when convertion fails
              _this2.error = err;
              return Promise.reject(_this2);
            });
          } else {
            return Promise.resolve(body);
          }
        });
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

  function fetch(url, init) {
    var _this = this;

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

    var onLoad = undefined;
    var onError = undefined;
    var onTimeout = undefined;
    var aborted = false;

    function abort() {
      if (onLoad) xhr.removeEventListener('load', onLoad);
      if (onError) xhr.removeEventListener('error', onError);
      if (onTimeout) xhr.removeEventListener('timeout', onTimeout);
      aborted = true;
      xhr.abort();
    }

    function pipe(handler, o) {
      var _ref;

      var chain = Promise.resolve(o);
      // Merge Pajax and request pipelets
      var pipelets = (_ref = []).concat.apply(_ref, _toConsumableArray(def.pipelets[handler]).concat([req[handler + 'Pipelets'] || []]));
      pipelets.forEach(function (pipelet) {
        // chain together
        if (typeof pipelet === 'function') {
          chain = chain.then(function (o) {
            // Resolve the return value of the pipelet
            return Promise.all([pipelet(o), o]);
          }).then(function (_ref2) {
            var _ref3 = _slicedToArray(_ref2, 2);

            var init = _ref3[0];
            var o = _ref3[1];

            // Requests can be manipulated in the before handler
            if (handler === 'before') {
              // Create a new requests with the return value of the pipelet
              if (init instanceof Request) {
                return init;
              } else if (typeof init === 'object' && init && o instanceof Request) {
                return o.spawn(init);
              }
            }
            return o;
          });
        }
      });
      return chain;
    }

    // Resolve before pipelets
    var promise = pipe('before', req).then(function (req) {
      return new Promise(function (resolve, reject) {
        var url = req.url;

        if (typeof url !== 'string') {
          throw 'URL required for request';
        }

        var method = req.method || 'GET';

        xhr.open(method, url, true);

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

        var xhrReady = function xhrReady(error) {
          return function () {
            var headers = new Headers(xhr.getAllResponseHeaders());
            var resBody = !('response' in xhr) ? xhr.responseText : xhr.response;

            var resInit = {
              headers: headers,
              status: xhr.status,
              statusText: xhr.statusText,
              dataType: req.dataType,
              pajax: req.pajax,
              request: req,
              url: url
            };

            var ResponseCtor = req.Response || Response;
            resolve(new ResponseCtor(resBody, resInit));
          };
        };

        // Callback for document loaded.
        onLoad = xhrReady();
        xhr.addEventListener('load', onLoad);

        // Callback for network errors.
        onError = xhrReady('Network error');
        xhr.addEventListener('error', onError);

        // Callback for timeouts
        onTimeout = xhrReady('Timeout');
        xhr.addEventListener('timeout', onTimeout);

        var contentType = req.contentType;

        req.consumeBody().then(function (rawBody) {
          // Fallback to json if body is object and no content type is set
          if (typeof rawBody === 'object' && rawBody && !contentType) {
            contentType = 'application/json';
          }
          return def.serializers[contentType] ? def.serializers[contentType](rawBody) : rawBody;
        }).then(function (reqBody) {
          // Add content type header only when body is attached
          if (reqBody !== undefined && contentType) {
            xhr.setRequestHeader('Content-Type', contentType);
          }

          // Don't even call send() if already aborted
          if (aborted) {
            return;
          }
          xhr.send(reqBody);
        }, function (err) {
          reject('Invalid request body');
        });
      });
    }).then(function (res) {
      // Resolve after pipelets
      return pipe('after', res);
    }, function (res) {
      // Resolve after pipelets and reject afterwards
      return pipe('after', res).then(function (res) {
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
      return pipe('afterSuccess', res);
    }, function (res) {
      if (res instanceof Response) {
        // When any pipelet rejects with a response object
        // resolve the afterFailure pipelets but still reject
        return pipe('afterFailure', res).then(function (res) {
          return Promise.reject(res);
        });
      } else {
        // Otherwise just pass through the error
        return Promise.reject(res);
      }
    });

    // Decorate promise with abort() method
    promise.abort = abort;
    return promise;
  }

  // Merges multiple request options
  // The result object is independent of the source options
  function options() {
    var result = {};
    var assign = def.request.assign;
    var merge = def.request.merge;

    for (var _len = arguments.length, inits = Array(_len), _key = 0; _key < _len; _key++) {
      inits[_key] = arguments[_key];
    }

    inits.forEach(function (init) {
      Object.keys(init || {}).forEach(function (key) {
        if (init[key] !== undefined) {
          // Merge options
          if (typeof merge[key] === 'function') {
            result[key] = merge[key](result[key], init[key]);
          } else {
            result[key] = init[key];
          }
        }
      });
    });
    return result;
  }

  function extractOptions(req) {
    // Extract the request options from the request
    var init = {};
    var assign = def.request.assign;
    Object.keys(assign).forEach(function (key) {
      var prop = typeof assign[key] === 'string' ? assign[key] : key;
      if (req[prop] !== undefined) {
        init[key] = req[prop];
      }
    });
    return init;
  }

  var Request = function (_Body) {
    _inherits(Request, _Body);

    function Request(url, init) {
      _classCallCheck(this, Request);

      var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Request).call(this));

      Object.assign(_this, def.operators);

      if (url instanceof Request) {
        // Second parameter is overridden when a req object is provided
        init = extractOptions(url);
        url = url.url;
      }

      for (var _len = arguments.length, preInits = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        preInits[_key - 2] = arguments[_key];
      }

      init = options.apply(undefined, preInits.concat([init]));

      // prioritize init.url over url
      _this.url = url;

      // Assign request options
      var assign = def.request.assign;
      Object.keys(init).forEach(function (key) {
        if (init[key] !== undefined) {
          var prop = typeof assign[key] === 'string' ? assign[key] : key;
          _this[prop] = init[key];
        }
      });

      return _this;
    }

    _createClass(Request, [{
      key: 'clone',
      value: function clone() {
        return new this.constructor(this);
      }
    }, {
      key: 'spawn',
      value: function spawn(init) {
        return new this.constructor(this.url, init, extractOptions(this));
      }
    }, {
      key: 'checkStatus',
      value: function checkStatus$$() {
        return this.after(checkStatus);
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

  var Pajax = function () {
    function Pajax() {
      _classCallCheck(this, Pajax);

      this.defaults = options.apply(undefined, arguments);
      Object.assign(this, def.operators);
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
      key: 'fetch',
      value: function fetch(url, init) {
        return this.request(url, init).fetch();
      }
    }, {
      key: 'request',
      value: function request(url, init) {
        var RequestCtor = this.constructor.Request || Request;
        var ResponseCtor = this.constructor.Response || Response;
        // Use class defaults, instance defaults and factory/response
        return new RequestCtor(url, init, this.defaults, {
          pajax: this,
          Response: ResponseCtor
        });
      }
    }, {
      key: 'spawn',
      value: function spawn(url, init) {
        if (typeof url === 'object') {
          init = url;
        }
        this.defaults = options(this.defaults, init);
        return this;
      }
    }, {
      key: 'JSON',
      value: function JSON() {
        var ct = 'application/json';
        return this.type(ct).header('Accept', ct);
      }
    }, {
      key: 'URLEncoded',
      value: function URLEncoded() {
        var ct = 'application/x-www-form-urlencoded';
        return this.type(ct);
      }
    }], [{
      key: 'get',
      value: function get() {
        return this.request.apply(this, arguments).get();
      }
    }, {
      key: 'getAuto',
      value: function getAuto() {
        return this.request.apply(this, arguments).getAuto();
      }
    }, {
      key: 'getJSON',
      value: function getJSON() {
        return this.request.apply(this, arguments).getJSON();
      }
    }, {
      key: 'getText',
      value: function getText() {
        return this.request.apply(this, arguments).getText();
      }
    }, {
      key: 'getBlob',
      value: function getBlob() {
        return this.request.apply(this, arguments).getBlob();
      }
    }, {
      key: 'getArrayBuffer',
      value: function getArrayBuffer() {
        return this.request.apply(this, arguments).getArrayBuffer();
      }
    }, {
      key: 'getFormData',
      value: function getFormData() {
        return this.request.apply(this, arguments).getFormData();
      }
    }, {
      key: 'post',
      value: function post() {
        return this.request.apply(this, arguments).post();
      }
    }, {
      key: 'put',
      value: function put() {
        return this.request.apply(this, arguments).put();
      }
    }, {
      key: 'delete',
      value: function _delete() {
        return this.request.apply(this, arguments).delete();
      }
    }, {
      key: 'patch',
      value: function patch() {
        return this.request.apply(this, arguments).patch();
      }
    }, {
      key: 'fetch',
      value: function fetch() {
        return this.request.apply(this, arguments).fetch();
      }
    }, {
      key: 'request',
      value: function request() {
        var _ref;

        return (_ref = new this(this.defaults)).request.apply(_ref, arguments);
      }
    }]);

    return Pajax;
  }();

  Pajax.options = options;
  Pajax.checkStatus = checkStatus;
  Pajax.def = def;
  Pajax.Headers = Headers;
  Pajax.Request = Request;
  Pajax.Response = Response;

  return Pajax;

}));