import Pajax from 'pajax';
export {Pajax};

export var assert = chai.assert;

export function noCall(err) {
  console.log(err);
  let msg;
  if(err instanceof Pajax.Response) {
    msg = `Status ${err.status} ${err.url} - ${err.error}`;
  } else {
    msg = Object.toString(err);
  }
  assert.fail(false, msg);
}

export var baseURL = 'http://127.0.0.1:3500';
