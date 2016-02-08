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

it('should parse absolute url', function() {

  let url = Pajax.parseURL('http://www.foo.bar/path/foo?foo=bar#foo')

  assert.strictEqual(url.protocol, 'http:');
  assert.strictEqual(url.hostname, 'www.foo.bar');
  assert.strictEqual(url.pathname, '/path/foo');
  assert.strictEqual(url.search, '?foo=bar');
  assert.strictEqual(url.hash, '#foo');
});

it('should parse relative url', function() {

  let url = Pajax.parseURL('/path/foo?foo=bar#foo')

  assert.strictEqual(url.protocol, '');
  assert.strictEqual(url.hostname, '');
  assert.strictEqual(url.pathname, '/path/foo');
  assert.strictEqual(url.search, '?foo=bar');
  assert.strictEqual(url.hash, '#foo');
});

it('should parse relative protocol url', function() {

  let url = Pajax.parseURL('//www.foo.bar/path/foo?foo=bar#foo')

  assert.strictEqual(url.protocol, 'http:');
  assert.strictEqual(url.hostname, 'www.foo.bar');
  assert.strictEqual(url.pathname, '/path/foo');
  assert.strictEqual(url.search, '?foo=bar');
  assert.strictEqual(url.hash, '#foo');
});
