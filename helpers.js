export var createResult = function(xhr, error) {
  return {
    response: xhr.response || xhr.responseText,
    status: xhr.status,
    statusText: xhr.statusText,
    xhr: xhr,
    error: error || null,
  };
};

export var startsWith = function(s, val){
  return s.slice(0, s.length)===val;
};

export var defaults = function(original, updates) {
  for (var prop in updates) {
    if(updates.hasOwnProperty(prop) && !original.hasOwnProperty(prop)) {
      original[prop] = updates[prop];
    }
  }
  return original;
};

export var callHandlers = function(handlers, handlerType, ...args) {
  var promises = [];
  handlers.forEach(function(obj) {
    if(obj && typeof obj[handlerType]==='function') {
      let p = obj[handlerType](...args);
      promises.push(p);
    }
  });
  return Promise.all(promises);
};

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

export var clone = function(obj) {
  var clone = {};
  if (obj) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        clone[key] = obj[key];
      }
    }
  }
  return clone;
}
