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

  function resolvePipelets(pipelets, o) {
    var pipeChain = Promise.resolve(o);
    var resolve = function resolve() {
      return o;
    };
    (pipelets || []).forEach(function (pipelet) {
      pipeChain = pipeChain.then(pipelet).then(resolve);
    });
    return pipeChain;
  }

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

  function unique(value, index, self) {
    return self.indexOf(value) === index;
  }

  function conv(value) {
    switch (typeof value) {
      case 'string':
        return value;
      case 'boolean':
        return value ? 'true' : 'false';
      case 'number':
        return isFinite(value) ? value.toString() : '';
      default:
        return '';
    }
  }

  // stringify and parse query parameters
  var qs = {
    stringify: function stringify(obj) {
      if (obj && typeof obj === 'object') {
        var res = [];
        for (var p in obj) {
          if (obj.hasOwnProperty(p)) {
            var s = encodeURIComponent(p) + '=';
            s += encodeURIComponent(conv(obj[p]));
            res.push(s);
          }
        }
        return res.join('&');
      } else {
        return '';
      }
    },
    parse: function parse(qs) {
      var res = {};

      if (typeof qs !== 'string' || !qs) {
        return res;
      }

      qs = qs.split('&');

      for (var i = 0; i < qs.length; i++) {
        var s = qs[i].replace(/\+/g, '%20');
        var eqidx = s.indexOf('=');

        var prop = undefined,
            value = undefined;

        if (eqidx >= 0) {
          prop = s.substr(0, eqidx);
          value = s.substr(eqidx + 1);
        } else {
          prop = s;
          value = '';
        }

        prop = decodeURIComponent(prop);
        value = decodeURIComponent(value);

        res[prop] = value;
      }

      return res;
    }
  };

  var serializers = {
    'application/json': JSON.stringify,
    'application/ld+json': JSON.stringify,
    'application/x-www-form-urlencoded': qs.stringify
  };

  var deserializers = {
    'application/json': JSON.parse,
    'application/ld+json': JSON.parse,
    'application/x-www-form-urlencoded': qs.parse
  };

  // In memory cache, so we won't parse the same url twice
  var urlCache = {};

  /**
   * For parsing a url into component parts
   * there are other parts which are suppressed (?:) but we only want to represent what would be available
   * from `(new URL(urlstring))` in this api.
   */
  var urlParser = /^(?:(?:(([^:\/#\?]+:)?(?:(?:\/\/)(?:(?:(?:([^:@\/#\?]+)(?:\:([^:@\/#\?]*))?)@)?(([^:\/#\?\]\[]+|\[[^\/\]@#?]+\])(?:\:([0-9]+))?))?)?)?((?:\/?(?:[^\/\?#]+\/+)*)(?:[^\?#]*)))?(\?[^#]+)?)(#.*)?/;
  var urlValidator = /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i;
  var keys = ["href", // http://user:pass@host.com:81/directory/file.ext?query=1#anchor
  "origin", // http://user:pass@host.com:81
  "protocol", // http:
  "username", // user
  "password", // pass
  "host", // host.com:81
  "hostname", // host.com
  "port", // 81
  "pathname", // /directory/file.ext
  "search", // ?query=1
  "hash" // #anchor
  ];

  // Check if string is valid url
  function isURL(url) {
    return urlValidator.test(url);
  }

  function parseURL(url) {
    url = url || '';

    // We first check if we have parsed this URL before, to avoid running the  monster regex over and over
    if (urlCache[url]) {
      return urlCache[url];
    }

    var currentProtocol = window.location.protocol;
    var currentHostName = window.location.hostname;

    // Add current protocol when a relative protocol is used
    if (url.slice(0, 2) === '//') {
      url = currentProtocol + url;
    }

    // Result object
    var result = {};

    result.isValid = isURL(url);
    result.isRelative = !result.isValid;

    var fallback = false;

    // Check file protocol for special case
    // `URL` function does not work in android device, use `uriParser` instead
    // all requests in android come with `file` protocol
    fallback = currentProtocol === 'file:';

    // URL() is not available in all browsers
    fallback = typeof URL !== 'function';

    if (!fallback) {
      var tempURL = undefined;
      if (result.isRelative) {
        // make URL valid if it's relative
        tempURL = currentProtocol + "//" + currentHostName + url.replace(/\A\//g, '');
      } else {
        tempURL = url;
      }

      try {
        (function () {
          var ourl = new URL(tempURL);
          keys.forEach(function (key) {
            result[key] = ourl[key] || '';
          });
          if (result.isRelative) {
            // removing hosts for relative URLs to be compliant with expectations
            result['host'] = '';
            result['hostname'] = '';
            result['href'] = url;
            result['origin'] = '';
            result['protocol'] = '';
          }
        })();
      } catch (err) {
        fallback = true;
      }
    }

    if (fallback) {
      // Parsed url
      var matches = urlParser.exec(url);
      // Number of indexes pulled from the url via the urlParser (see 'keys')
      var i = keys.length;
      while (i--) {
        result[keys[i]] = matches[i] || '';
      }
    }

    // Stored parsed values
    urlCache[url] = result;

    return result;
  }

  var _toConsumableArray = (function (arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
        arr2[i] = arr[i];
      }return arr2;
    } else {
      return Array.from(arr);
    }
  })

  function set(target, option, value) {
    if (value !== undefined) {
      target.opts[option] = value;
    } else {
      delete target.opts[option];
    }
    return target;
  }

  var Configurator = function () {
    function Configurator(opts) {
      _classCallCheck(this, Configurator);

      // Opts will be modified, so we create a clone by assigning
      this.opts = {};
      this.assignOpts(opts);
    }

    _createClass(Configurator, [{
      key: 'assignOpts',
      value: function assignOpts() {
        var _this = this;

        var map = Configurator.assignMap;

        for (var _len = arguments.length, objects = Array(_len), _key = 0; _key < _len; _key++) {
          objects[_key] = arguments[_key];
        }

        objects.forEach(function (o) {
          o = o || {};
          // Merge and uniquify keys
          var keys = [].concat(_toConsumableArray(Object.keys(o)), _toConsumableArray(Object.keys(map))).filter(unique);
          keys.forEach(function (key) {
            if (map[key]) {
              _this.opts[key] = map[key](_this.opts[key], o[key]);
            } else {
              _this.opts[key] = o[key];
            }
          });
        });
        return this;
      }
    }, {
      key: 'before',
      value: function before(func) {
        this.opts.pipelets.before.push(func);
        return this;
      }
    }, {
      key: 'after',
      value: function after(func) {
        this.opts.pipelets.after.push(func);
        return this;
      }
    }, {
      key: 'afterSuccess',
      value: function afterSuccess(func) {
        this.opts.pipelets.afterSuccess.push(func);
        return this;
      }
    }, {
      key: 'afterFailure',
      value: function afterFailure(func) {
        this.opts.pipelets.afterFailure.push(func);
        return this;
      }
    }, {
      key: 'attach',
      value: function attach(body) {
        return set(this, 'body', body);
      }
    }, {
      key: 'setTimeout',
      value: function setTimeout(timeout) {
        return set(this, 'timeout', timeout);
      }
    }, {
      key: 'setBaseURL',
      value: function setBaseURL(baseURL) {
        return set(this, 'baseURL', baseURL);
      }
    }, {
      key: 'setContentType',
      value: function setContentType(contentType) {
        return set(this, 'contentType', contentType);
      }
    }, {
      key: 'setResponseContentType',
      value: function setResponseContentType(responseContentType) {
        return set(this, 'responseContentType', responseContentType);
      }
    }, {
      key: 'setResponseType',
      value: function setResponseType(responseType) {
        return set(this, 'responseType', responseType);
      }
    }, {
      key: 'onProgress',
      value: function onProgress(progressCb) {
        return set(this, 'progress', progressCb);
      }
    }, {
      key: 'withCredentials',
      value: function withCredentials(cred) {
        return set(this, 'credentials', typeof cred === 'string' ? cred : 'include');
      }
    }, {
      key: 'noCache',
      value: function noCache(_noCache) {
        return set(this, 'cache', _noCache === false ? 'default' : 'no-cache');
      }
    }, {
      key: 'asText',
      value: function asText() {
        return set(this, 'responseContentType', 'text/plain');
      }
    }, {
      key: 'asJSON',
      value: function asJSON() {
        return set(this, 'responseContentType', 'application/json');
      }
    }, {
      key: 'header',
      value: function header(_header, value) {
        this.opts.headers = this.opts.headers || {};
        if (typeof _header === 'string' && value !== undefined) {
          this.opts.headers[_header] = value;
        } else if (typeof _header === 'string' && value === undefined) {
          delete this.opts.headers[_header];
        } else if (typeof _header === 'object') {
          this.opts.headers = merge(this.opts.headers, _header);
        } else {
          delete this.opts.headers;
        }
        return this;
      }
    }, {
      key: 'query',
      value: function query(key, value) {
        this.opts.queryParams = this.opts.queryParams || {};
        if (typeof key === 'string' && value !== undefined) {
          this.opts.queryParams[key] = value;
        } else if (typeof key === 'string' && value === undefined) {
          delete this.opts.queryParams[key];
        } else if (typeof key === 'object') {
          this.opts.queryParams = merge(this.opts.queryParams, key);
        } else {
          delete this.opts.queryParams;
        }
        return this;
      }
    }]);

    return Configurator;
  }();

  Configurator.assignMap = {
    queryParams: function queryParams(qp1, qp2) {
      return merge(qp1 || {}, qp2 || {});
    },
    headers: function headers(h1, h2) {
      return merge(h1 || {}, h2 || {});
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
  };

  function checkStatus() {
    return function (res) {
      // SUCCESS: status between 200 and 299 or 304
      // Failure: status below 200 or beyond 299 excluding 304
      if (!res.error && (res.status < 200 || res.status >= 300 && res.status !== 304)) {
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

  var Request = function (_Configurator) {
    _inherits(Request, _Configurator);

    function Request(url, opts, factory) {
      _classCallCheck(this, Request);

      var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Request).call(this, opts));

      if (typeof url !== 'string') {
        throw 'URL required for request';
      }
      _this._url = url;
      _this.factory = factory;
      return _this;
    }

    _createClass(Request, [{
      key: 'checkStatus',
      value: function checkStatus$$() {
        return this.after(checkStatus());
      }

      // Alias for fetch()

    }, {
      key: 'send',
      value: function send() {
        return this.fetch();
      }
    }, {
      key: 'fetch',
      value: function fetch() {
        return this.factory.fetch(this);
      }
    }, {
      key: 'url',
      get: function get() {
        var parsedURL = parseURL(this._url);
        var url = '';

        // Add base url when url is just a path
        var baseURL = this.baseURL;
        if (parsedURL.isRelative && baseURL) {
          url = baseURL;
        } else if (!parsedURL.isRelative) {
          url = parsedURL.protocol + '//' + parsedURL.host;
        }

        url += parsedURL.pathname + parsedURL.hash;

        var qp = {};

        // Merge options params into qp hash
        if (this.queryParams) {
          qp = merge(qp, this.queryParams);
        }

        // When url contains query params, merge them into qp hash
        if (parsedURL.search) {
          var search = parsedURL.search.replace(/^\?/, '');
          if (search) {
            qp = merge(qs.parse(search), qp);
          }
        }

        // Merge caching param into qp hash
        if (this.method === 'GET' && this.cache === 'no-cache') {
          var ts = Date.now();
          qp._ = ++ts;
        }

        if (Object.keys(qp).length > 0) {
          // Serialize query parameters into query string
          url += '?' + qs.stringify(qp);
        }

        return url;
      },
      set: function set(url) {
        this._url = url;
      }
    }, {
      key: 'baseURL',
      get: function get() {
        return this.opts.baseURL;
      },
      set: function set(baseURL) {
        this.opts.baseURL = baseURL;
      }
    }, {
      key: 'queryParams',
      get: function get() {
        return this.opts.queryParams;
      },
      set: function set(queryParams) {
        this.opts.queryParams = queryParams;
      }
    }, {
      key: 'method',
      get: function get() {
        return this.opts.method;
      },
      set: function set(method) {
        this.opts.method = method;
      }
    }, {
      key: 'body',
      get: function get() {
        return this.opts.body;
      },
      set: function set(body) {
        this.opts.body = body;
      }
    }, {
      key: 'headers',
      get: function get() {
        return this.opts.headers;
      },
      set: function set(headers) {
        this.opts.headers = headers;
      }
    }, {
      key: 'credentials',
      get: function get() {
        return this.opts.credentials;
      },
      set: function set(credentials) {
        this.opts.credentials = credentials;
      }
    }, {
      key: 'cache',
      get: function get() {
        return this.opts.cache;
      },
      set: function set(cache) {
        this.opts.cache = cache;
      }
    }, {
      key: 'contentType',
      get: function get() {
        return this.opts.contentType;
      },
      set: function set(contentType) {
        this.opts.contentType = contentType;
      }
    }, {
      key: 'progress',
      get: function get() {
        return this.opts.progress;
      },
      set: function set(progress) {
        this.opts.progress = progress;
      }
    }, {
      key: 'timeout',
      get: function get() {
        return this.opts.timeout;
      },
      set: function set(timeout) {
        this.opts.timeout = timeout;
      }
    }, {
      key: 'responseType',
      get: function get() {
        return this.opts.responseType;
      },
      set: function set(responseType) {
        this.opts.responseType = responseType;
      }
    }, {
      key: 'pipelets',
      get: function get() {
        return this.opts.pipelets;
      },
      set: function set(pipelets) {
        this.opts.pipelets = pipelets;
      }
    }, {
      key: 'responseContentType',
      get: function get() {
        return this.opts.responseContentType;
      },
      set: function set(responseContentType) {
        this.opts.responseContentType = responseContentType;
      }
    }]);

    return Request;
  }(Configurator);

  // Parses that string into a user-friendly key/value pair object.
  // http://www.w3.org/TR/XMLHttpRequest/#the-getallresponseheaders-method
  var parseResponseHeaders = function parseResponseHeaders(headerStr) {
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
        var key = headerPair.substring(0, index).toLowerCase();
        var value = headerPair.substring(index + 2);
        headers[key.trim()] = value.trim();
      }
    }
    return headers;
  };

  var Response = function () {
    function Response(req, xhr) {
      _classCallCheck(this, Response);

      this.request = req;
      this.xhr = xhr;
      this.error = null;
      this.headers = parseResponseHeaders(xhr.getAllResponseHeaders());

      var body = this.response;

      try {
        var responseType = req.responseType;
        var contentType = req.responseContentType || this.contentType;

        // When the response type is not set or text and a string is delivered try to find a matching parser via the content type
        if ((!responseType || responseType === 'text') && typeof body === 'string' && body.length && contentType && deserializers[contentType]) {
          try {
            body = deserializers[contentType](body);
          } catch (ex) {
            throw 'Invalid response';
          }
          // When the responseType is set and the response body is null, reject the request
        } else if (responseType && this.status !== 204 && this.status !== 205 && body === null) {
            throw 'Invalid response';
          }
      } catch (ex) {
        this.error = ex;
      }

      this.body = body;
    }

    _createClass(Response, [{
      key: 'url',
      get: function get() {
        return this.request.url;
      }
    }, {
      key: 'opts',
      get: function get() {
        return this.request.opts;
      }
    }, {
      key: 'factory',
      get: function get() {
        return this.request.factory;
      }
    }, {
      key: 'method',
      get: function get() {
        return this.request.method;
      }
    }, {
      key: 'ok',
      get: function get() {
        return !this.error;
      }
    }, {
      key: 'response',
      get: function get() {
        return !('response' in this.xhr) ? this.xhr.responseText : this.xhr.response;
      }
    }, {
      key: 'status',
      get: function get() {
        return this.xhr.status;
      }
    }, {
      key: 'statusText',
      get: function get() {
        return this.xhr.statusText;
      }
    }, {
      key: 'contentType',
      get: function get() {
        if (this.headers['content-type']) {
          return this.headers['content-type'].split(/ *; */).shift(); // char set
        } else {
            return null;
          }
      }
    }]);

    return Response;
  }();

  var Pajax = function (_Configurator) {
    _inherits(Pajax, _Configurator);

    function Pajax() {
      _classCallCheck(this, Pajax);

      return _possibleConstructorReturn(this, Object.getPrototypeOf(Pajax).apply(this, arguments));
    }

    _createClass(Pajax, [{
      key: 'get',
      value: function get(url) {
        var opts = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        opts.method = 'GET';
        return this.request(url, opts);
      }
    }, {
      key: 'head',
      value: function head(url) {
        var opts = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        opts.method = 'HEAD';
        return this.request(url, opts);
      }
    }, {
      key: 'post',
      value: function post(url) {
        var opts = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        opts.method = 'POST';
        return this.request(url, opts);
      }
    }, {
      key: 'put',
      value: function put(url) {
        var opts = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        opts.method = 'PUT';
        return this.request(url, opts);
      }
    }, {
      key: 'patch',
      value: function patch(url) {
        var opts = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        opts.method = 'PATCH';
        return this.request(url, opts);
      }
    }, {
      key: 'delete',
      value: function _delete(url) {
        var opts = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        opts.method = 'DELETE';
        return this.request(url, opts);
      }
    }, {
      key: 'del',
      value: function del() {
        return this.delete.apply(this, arguments);
      }
    }, {
      key: 'request',
      value: function request(url, opts) {
        return this.createRequest(url, this.opts, this).assignOpts(opts).checkStatus();
      }
    }, {
      key: 'createRequest',
      value: function createRequest(url, opts, factory) {
        var RequestClass = this.constructor.Request || Request;
        return new RequestClass(url, opts, factory || this);
      }
    }, {
      key: 'createResponse',
      value: function createResponse(req, xhr) {
        var ResponseClass = this.constructor.Response || Response;
        return new ResponseClass(req, xhr);
      }
    }, {
      key: 'fetch',
      value: function fetch(url, opts) {
        var _this2 = this;

        var req = undefined;
        if (url instanceof Request) {
          req = url;
        } else {
          req = this.createRequest(url, this.opts, this).assignOpts(opts);
        }

        // The XMLHttpRequest object is recreated at every request to defeat caching problems in IE
        var xhr = undefined;
        try {
          xhr = new XMLHttpRequest();
        } catch (e) {
          throw 'Could not create XMLHttpRequest object';
        }

        // Resolve before pipelets
        return Promise.resolve().then(function () {
          return resolvePipelets(req.pipelets.before || [], req);
        }).then(function () {
          return new Promise(function (resolve, reject) {
            var url = req.url;

            var method = req.method || 'GET';

            xhr.open(method, url, true);

            var body = req.body;

            // Try to serialize body
            if (body && typeof body === 'object') {
              try {
                var serialize = serializers[req.contentType];
                if (req.contentType && serializers[req.contentType]) {
                  body = serializers[req.contentType](body);
                } else if (req.contentType === undefined) {
                  body = JSON.stringify(body);
                  xhr.setRequestHeader('Content-Type', 'application/json');
                }
              } catch (ex) {
                var res = _this2.createResponse(req, xhr);
                res.error = 'Invalid body';
                reject(res);
              }
            }

            // Add content type header only when body is attached
            if (body !== undefined && req.contentType) {
              xhr.setRequestHeader('Content-Type', req.contentType);
            }

            try {
              // Default response type is 'text'
              xhr.responseType = req.responseType ? req.responseType.toLowerCase() : 'text';
            } catch (err) {
              // Fallback to type processor
              req.responseType = null;
            }

            // Add custom headers
            if (req.headers) {
              Object.keys(req.headers).forEach(function (key) {
                xhr.setRequestHeader(key, req.headers[key]);
              });
            }

            // Register upload progress listener
            if (req.progress && xhr.upload) {
              xhr.upload.addEventListener('progress', function () {
                var _req;

                for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                  args[_key] = arguments[_key];
                }

                (_req = req).progress.apply(_req, [_this2].concat(args));
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

            // Callback for errors
            xhr.onerror = function () {
              var res = _this2.createResponse(req, xhr);
              res.error = 'Network error';
              resolve(res);
            };

            // Callback for timeouts
            xhr.ontimeout = function () {
              var res = _this2.createResponse(req, xhr);
              res.error = 'Timeout';
              resolve(res);
            };

            // Callback for document loaded.
            xhr.onload = function () {
              var res = _this2.createResponse(req, xhr);
              resolve(res);
            };

            xhr.send(body);
          });
        })
        // Pipelet for marking unsucessfull requests
        .then(function (res) {
          // Success
          return resolvePipelets(req.pipelets.after, res);
        }).then(function (res) {
          if (res.error) {
            // Resolve afterFailure pipelets
            return resolvePipelets(req.pipelets.afterFailure, res);
          } else {
            // Resolve afterSuccess pipelets
            return resolvePipelets(req.pipelets.afterSuccess, res);
          }
        }, function (res) {
          // When an 'after' pipelet rejects with a response object
          // resolve the afterFailure pipelets
          if (res instanceof Response) {
            return resolvePipelets(req.pipelets.afterFailure, res);
          } else {
            return Promise.reject(res);
          }
        }).then(function (res) {
          // Resolve or reject based on error
          if (res.error) {
            return Promise.reject(res);
          } else {
            return Promise.resolve(res);
          }
        });
      }
    }], [{
      key: 'request',
      value: function request() {
        var _ref;

        return (_ref = new this()).request.apply(_ref, arguments);
      }
    }, {
      key: 'fetch',
      value: function fetch() {
        var _ref2;

        return (_ref2 = new this()).fetch.apply(_ref2, arguments);
      }
    }, {
      key: 'get',
      value: function get() {
        var _ref3;

        return (_ref3 = new this()).get.apply(_ref3, arguments);
      }
    }, {
      key: 'head',
      value: function head() {
        var _ref4;

        return (_ref4 = new this()).head.apply(_ref4, arguments);
      }
    }, {
      key: 'post',
      value: function post() {
        var _ref5;

        return (_ref5 = new this()).post.apply(_ref5, arguments);
      }
    }, {
      key: 'put',
      value: function put() {
        var _ref6;

        return (_ref6 = new this()).put.apply(_ref6, arguments);
      }
    }, {
      key: 'delete',
      value: function _delete() {
        var _ref7;

        return (_ref7 = new this()).delete.apply(_ref7, arguments);
      }
    }, {
      key: 'patch',
      value: function patch() {
        var _ref8;

        return (_ref8 = new this()).patch.apply(_ref8, arguments);
      }
    }, {
      key: 'del',
      value: function del() {
        return this.delete.apply(this, arguments);
      }
    }]);

    return Pajax;
  }(Configurator);

  Pajax.Request = Request;
  Pajax.Response = Response;

  var _get = (function get(object, property, receiver) {
    if (object === null) object = Function.prototype;
    var desc = Object.getOwnPropertyDescriptor(object, property);

    if (desc === undefined) {
      var parent = Object.getPrototypeOf(object);

      if (parent === null) {
        return undefined;
      } else {
        return get(parent, property, receiver);
      }
    } else if ("value" in desc) {
      return desc.value;
    } else {
      var getter = desc.get;

      if (getter === undefined) {
        return undefined;
      }

      return getter.call(receiver);
    }
  })

  var ct = 'application/json';

  var PajaxJSON = function (_Pajax) {
    _inherits(PajaxJSON, _Pajax);

    function PajaxJSON() {
      var _Object$getPrototypeO;

      _classCallCheck(this, PajaxJSON);

      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var _this = _possibleConstructorReturn(this, (_Object$getPrototypeO = Object.getPrototypeOf(PajaxJSON)).call.apply(_Object$getPrototypeO, [this].concat(args)));

      _this.setContentType(ct);
      _this.header('Accept', ct);
      return _this;
    }

    _createClass(PajaxJSON, [{
      key: 'request',
      value: function request() {
        var _get2;

        for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }

        var req = (_get2 = _get(Object.getPrototypeOf(PajaxJSON.prototype), 'request', this)).call.apply(_get2, [this].concat(args));
        if (req.opts.forceJSON) {
          req.setResponseContentType(ct);
        }
        return req;
      }
    }]);

    return PajaxJSON;
  }(Pajax);

  var PajaxURLEncoded = function (_Pajax) {
    _inherits(PajaxURLEncoded, _Pajax);

    function PajaxURLEncoded() {
      var _Object$getPrototypeO;

      _classCallCheck(this, PajaxURLEncoded);

      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var _this = _possibleConstructorReturn(this, (_Object$getPrototypeO = Object.getPrototypeOf(PajaxURLEncoded)).call.apply(_Object$getPrototypeO, [this].concat(args)));

      _this.setContentType('application/x-www-form-urlencoded');
      return _this;
    }

    return PajaxURLEncoded;
  }(Pajax);

  // configurator
  Pajax.Configurator = Configurator;

  // custom classes
  Pajax.URLEncoded = PajaxURLEncoded;
  Pajax.JSON = PajaxJSON;

  // helpers
  Pajax.qsParse = qs.parse;
  Pajax.qsStringify = qs.stringify;
  Pajax.parseURL = parseURL;
  Pajax.isURL = isURL;
  Pajax.merge = merge;

  // pipelets
  Pajax.checkStatus = checkStatus;

  return Pajax;

}));