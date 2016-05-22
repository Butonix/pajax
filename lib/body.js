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
  let reader = new FileReader();
  reader.readAsArrayBuffer(blob);
  return reader2Promise(reader);
}

function blob2text(blob) {
  let reader = new FileReader();
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
  } catch(ex) {
    throw 'Invalid JSON';
  }
}

const map = {
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
};

export function convertBody(body, to) {
  let from = bodyType(body);
  if(body===null || body===undefined || !from || from===to) {
    return Promise.resolve(body);
  } else if(map[to] && map[to][from]) {
    return map[to][from](body);
  } else {
    return Promise.reject(`Convertion from ${from} to ${to} not supported`);
  }
}

export default class Body {
  constructor() {
    this.bodyUsed = false;
  }
  text() {
    return this.consumeBody().then(body=>convertBody(body, 'text'));
  }
  blob() {
    return this.consumeBody().then(body=>convertBody(body, 'blob'));
  }
  formData() {
    return this.consumeBody().then(body=>convertBody(body, 'formData'));
  }
  json() {
    return this.consumeBody().then(body=>convertBody(body, 'json'));
  }
  arrayBuffer() {
    return this.consumeBody().then(body=>convertBody(body, 'ArrayBuffer'));
  }
  consumeBody() {
    if(this.bodyUsed) {
      // TODO: Reject when body was used?
      //   return Promise.reject(...);
      return Promise.resolve(this._body);
    } else {
      this.bodyUsed = true;
      return Promise.resolve(this._body);
    }
  }
}
