// In memory cache, so we won't parse the same url twice
let urlCache = {};

/**
 * For parsing a url into component parts
 * there are other parts which are suppressed (?:) but we only want to represent what would be available
 * from `(new URL(urlstring))` in this api.
 */
const urlParser = /^(?:(?:(([^:\/#\?]+:)?(?:(?:\/\/)(?:(?:(?:([^:@\/#\?]+)(?:\:([^:@\/#\?]*))?)@)?(([^:\/#\?\]\[]+|\[[^\/\]@#?]+\])(?:\:([0-9]+))?))?)?)?((?:\/?(?:[^\/\?#]+\/+)*)(?:[^\?#]*)))?(\?[^#]+)?)(#.*)?/;
const urlValidator = /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i;
const keys = [
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
function isURL(url) {
  return urlValidator.test(url);
}

function parseURL(url) {
  url = url || '';

  // We first check if we have parsed this URL before, to avoid running the  monster regex over and over
  if(urlCache[url]) {
    return urlCache[url];
  }

  let currentProtocol = window.location.protocol;
  let currentHostName = window.location.hostname;

  // Add current protocol when a relative protocol is used
  if(url.slice(0, 2)==='//') {
    url = currentProtocol + url;
  }

  // Result object
  let result = {};

  result.isValid = isURL(url);
  result.isRelative = !result.isValid;

  let fallback = false;

  // Check file protocol for special case
  // `URL` function does not work in android device, use `uriParser` instead
  // all requests in android come with `file` protocol
  fallback = currentProtocol==='file:';

  // URL() is not available in all browsers
  fallback = typeof URL !== 'function';

  if (!fallback) {
    let tempURL;
    if (result.isRelative) { // make URL valid if it's relative
      tempURL = `${currentProtocol}//${currentHostName}${url.replace(/\A\//g, '')}`;
    } else {
      tempURL = url;
    }

    try {
      let ourl = new URL(tempURL);
      keys.forEach(key=>{
        result[key] = ourl[key] || '';
      });
      if (result.isRelative) { // removing hosts for relative URLs to be compliant with expectations
        result['host'] = '';
        result['hostname'] = '';
        result['href'] = url;
        result['origin'] = '';
      }
    } catch (err) {
      fallback = true;
    }
  }

  if(fallback) {
    // Parsed url
    let matches = urlParser.exec(url);
    // Number of indexes pulled from the url via the urlParser (see 'keys')
    let i = keys.length;
    while (i--) {
      result[keys[i]] = matches[i] || '';
    }
  }

  // Stored parsed values
  urlCache[url] = result;

  return result;
}

export default parseURL;
export {
  isURL,
  parseURL
}
