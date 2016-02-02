import {Pajax,assert,noCall,baseURL} from './utils';

it('should have static helpers', function() {
  assert.strictEqual(typeof Pajax.qsParse, 'function');
  assert.strictEqual(typeof Pajax.qsStringify, 'function');
  assert.strictEqual(typeof Pajax.isURL, 'function');
  assert.strictEqual(typeof Pajax.parseURL, 'function');
  assert.strictEqual(typeof Pajax.merge, 'function');

  var parsedURL = Pajax.parseURL('http://www.foo.net/bar');

  assert.strictEqual(parsedURL.isRelative, false);
  assert.strictEqual(parsedURL.host, 'www.foo.net');
});
