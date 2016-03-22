function normalizeName(name) {
  return String(name).toLowerCase().trim();
}

function normalizeValue(name) {
  return String(name);
}

// Parses that string into a user-friendly key/value pair object.
// http://www.w3.org/TR/XMLHttpRequest/#the-getallresponseheaders-method
function parseResponseHeaders(headerStr) {
  let headers = {};
  if (!headerStr) {
    return headers;
  }
  let headerPairs = headerStr.split('\u000d\u000a');
  for (let i = 0; i < headerPairs.length; i++) {
    let headerPair = headerPairs[i];
    // Can't use split() here because it does the wrong thing
    // if the header value has the string ": " in it.
    let index = headerPair.indexOf('\u003a\u0020');
    if (index > 0) {
      let name = normalizeName(headerPair.substring(0, index));
      let value = normalizeValue(headerPair.substring(index + 2));
      headers[name] = value.trim();
    }
  }
  return headers;
}

export default class Headers {
  constructor(...headersArr) {
    this.headers = {};
    headersArr.forEach(headers=>{
      if(headers && typeof headers==='string') {
        headers = parseResponseHeaders(headers);
      }
      if (headers instanceof Headers) {
        headers.keys().forEach(name=>{
          this.append(name, headers.get(name));
        });
      } else if (headers && typeof headers==='object') {
        Object.keys(headers).forEach(key=>{
          this.append(key, headers[key]);
        });
      }
    });
  }
  append(name, value) {
    name = normalizeName(name);
    value = normalizeValue(value);
    this.headers[name] = this.headers[name] || [];
    this.headers[name].push(value);
  }
  delete(name) {
    delete this.headers[normalizeName(name)];
  }
  get(name) {
    name = normalizeName(name);
    let values = this.headers[name] || [];
    return values.length>0 ? values[0] : null;
  }
  getAll(name) {
    name = normalizeName(name);
    return this.headers[name] || [];
  }
  has(name) {
    name = normalizeName(name);
    return !!this.headers[name];
  }
  set(name, value) {
    name = normalizeName(name);
    value = normalizeValue(value);
    this.headers[name] = [value];
  }
  keys() {
    return Object.keys(this.headers);
  }
  values() {
    return Object.keys(this.headers).map(name=>{
      return this.get(name);
    });
  }
  entries() {
    return Object.keys(this.headers).map(name=>{
      return [name, this.get(name)];
    });
  }
}
