export var isURL = function(url) {
  return /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(url);
}

export var createResult = function(xhr, error) {
  return {
    response: xhr.response,
    status: xhr.status,
    statusText: xhr.statusText,
    xhr: xhr,
    error: error || null,
  };
};

export var startsWith = function(s, val){
  return s.slice(0, s.length)===val;
};

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

export var merge = function(original, updates, override=true) {
  // We manipulate the opts object, so we clone it
  var result = clone(original);
  for (var prop in updates) {
    if(updates.hasOwnProperty(prop) && (!result.hasOwnProperty(prop) || override)) {
      result[prop] = updates[prop];
    }
  }
  return result;
};

export var defaults = function(original, updates) {
  return merge(original, updates, false);
};

export var resolvePipelets = function(pipelets, req) {
  var pipeChain = Promise.resolve(req);
  for (let pipelet of (pipelets || [])) {
    pipeChain = pipeChain.then(pipelet).then(req=>{
      return req;
    });
  }
  return pipeChain;
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
