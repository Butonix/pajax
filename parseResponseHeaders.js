// Parses that string into a user-friendly key/value pair object.
// http://www.w3.org/TR/XMLHttpRequest/#the-getallresponseheaders-method
export default function(headerStr) {
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
      var key = headerPair.substring(0, index);
      headers[key] = headerPair.substring(index + 2);
    }
  }
  return headers;
}
