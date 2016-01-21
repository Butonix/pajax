export {default as Pajax} from '../lib/main';

export var assert = chai.assert;

export function noCall(res) {
  console.log(res);
  assert.fail('Should not be called');
}

export var baseURL = 'http://127.0.0.1:3500';

export function noCall(res) {
  console.log('noCall', res.status);
  console.log('noCall', res.error);
  console.log('noCall', res.body);
  assert.fail('Should not be called');
}
