import convertion from './convertion.js';

function convertBody(to) {
  return body=>{
    return convertion.body(body, to);
  }
}

export default class Body {
  constructor() {
    this.bodyUsed = false;
  }
  text() {
    return this.consumeBody().then(convertBody('text'));
  }
  blob() {
    return this.consumeBody().then(convertBody('blob'));
  }
  formData() {
    return this.consumeBody().then(convertBody('formData'));
  }
  json() {
    return this.consumeBody().then(convertBody('json'));
  }
  arrayBuffer() {
    return this.consumeBody().then(convertBody('ArrayBuffer'));
  }
  consumeBody() {
    if(this.bodyUsed) {
      // TODO: Reject when body was used?
      //   return Promise.reject(...);
      return Promise.resolve(this.body);
    } else {
      this.bodyUsed = true;
      return Promise.resolve(this.body);
    }
  }
  convert(to) {
    return this.consumeBody().then(convertBody(to));
  }
}
