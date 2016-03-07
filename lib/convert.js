function reader2Promise(reader) {
  return new Promise(function(resolve, reject) {
    reader.onload = function() {
      resolve(reader.result);
    }
    reader.onerror = function() {
      reject(reader.error);
    }
  });
}

function blob2ArrayBuffer(blob) {
    var reader = new FileReader();
    reader.readAsArrayBuffer(blob);
    return reader2Promise(reader);
  }

function blob2text(blob) {
  let reader = new FileReader();
  reader.readAsText(blob);
  return reader2Promise(reader);
}

function detectType(body) {
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
  if(!ct) {
    return null;
  }
  let key = Object.keys(obj).find(key=>ct.startsWith(key));
  return key ? obj[key] : null;
}

function parseJSON(body) {
  try {
    return JSON.parse(body);
  } catch(ex) {
    throw 'Invalid JSON';
  }
}

export default {
  map: {
    text: {
      json: (body) => Promise.resolve(JSON.stringify(body)),
      blob: (body) => blob2text(body),
    },
    json: {
      text: (body) => Promise.resolve(parseJSON(body)),
      blob: (body) => blob2text(body).then(parseJSON)
    },
    blob: {
      text: (body) => Promise.resolve(new Blob([body])),
      json: (body) => Promise.resolve(new Blob([JSON.stringify(body)]))
    },
    arrayBuffer: {
      blob: (body) => blob2ArrayBuffer(body),
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
  body(body, to) {
    let from = detectType(body);
    if(body===null || body===undefined || !from || from===to) {
      return Promise.resolve(body);
    } else if(this.map[to] && this.map[to][from]) {
      return this.map[to][from](body);
    } else {
      return Promise.reject(`Convertion from ${from} to ${to} not supported`);
    }
  },
  request(body, ct) {
    let to = match(this.requestMap, ct);
    if(to) {
      return this.body(body, to);
    } else {
      return Promise.resolve(body);
    }
  },
  response(body, ct) {
    let to = match(this.responseMap, ct);
    if(to) {
      return this.body(body, to);
    } else {
      return Promise.resolve(body);
    }
  }
}
