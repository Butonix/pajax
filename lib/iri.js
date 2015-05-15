// In memory cache, so we won't parse the same iri twice
var iriCache = {};

/**
 * For parsing a url into component parts
 * there are other parts which are suppressed (?:) but we only want to represent what would be available
 * from `(new URL(urlstring))` in this api.
 */
var uriParser = /^(?:(?:(([^:\/#\?]+:)?(?:(?:\/\/)(?:(?:(?:([^:@\/#\?]+)(?:\:([^:@\/#\?]*))?)@)?(([^:\/#\?\]\[]+|\[[^\/\]@#?]+\])(?:\:([0-9]+))?))?)?)?((?:\/?(?:[^\/\?#]+\/+)*)(?:[^\?#]*)))?(\?[^#]+)?)(#.*)?/;
var keys = [
  "href", // http://user:pass@host.com:81/directory/file.ext?query=1#anchor
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
function isIRI(iri) {
  return /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(iri);
}

function parseIRI(iri) {

  iri = iri || '';

  // We first check if we have parsed this URL before, to avoid running the  monster regex over and over
  if(iriCache[iri]) {
    return iriCache[iri];
  }

  // Result object
  var result = {};

  var _isIRI = isIRI(iri);
  result.isRelative = !_isIRI;
  result.isValid = _isIRI;

  var fallback = false;
  var currentProtocol = window.location.protocol;
  var currentHostName = window.location.hostname;

  if (currentProtocol === 'file:') {
    // Check file protocol for special case
    // `URL` function does not work in android device, use `uriParser` instead
    // all requests in android come with `file` protocol
    fallback = true;
  } else {
    if (typeof URL === 'function') {
      var tempIRI = iri;
      if (result.isRelative) { // make URL valid if it's relative
        if (iri.charAt(0) === '/') {
          tempIRI = currentProtocol + '//' + currentHostName + iri;
        } else {
          tempIRI = currentProtocol + '//' + currentHostName + '/'+ iri;
        }
      } else {
        tempIRI = iri;
      }

      try {
        var url = new URL(tempIRI);
        let i = keys.length;
        while (i--) {
          if (typeof url[keys[i]]  === 'undefined') {
            result[keys[i]] = '';
          } else {
            result[keys[i]] = url[keys[i]];
          }
        }
        if (result.isRelative) { // removing hosts for relative URLs to be compliant with expectations
          result['host'] = '';
          result['hostname'] = '';
          result['href'] = iri;
          result['origin'] = '';
        }
      } catch (err) {
        fallback = true;
      }
    } else {
      fallback = true;
    }
  }

  if (fallback === true) {
    // Parsed iri
    var matches = uriParser.exec(iri);

    // Number of indexes pulled from the url via the urlParser (see 'keys')
    let i = keys.length;

    while (i--) {
      result[keys[i]] = matches[i] || '';
    }
  }

  result.params = {};

  // Stored parsed values
  iriCache[iri] = result;

  return result;
}

export default parseIRI;
export {
  isIRI,
  parseIRI
}
