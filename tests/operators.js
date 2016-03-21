import {Pajax,assert,noCall,baseURL} from './utils.js';

describe('operators', function() {
  it('should set configuration properly with operators', function() {

    let prcb = (req, event)=>{};

    var req = Pajax.request('/url')
                   .is('PATCH')
                   .header({'foo': 'bar'})
                   .header('bar', 'foo')
                   .noCache()
                   .withCredentials()
                   .type('application/json')
                   .onProgress(prcb)
                   .setTimeout(5000)
                   .attach({foo:'bar'});

    assert.strictEqual(req.method, 'PATCH');
    assert.deepEqual(req.headers.get('foo'), 'bar');
    assert.deepEqual(req.headers.get('bar'), 'foo');
    assert.deepEqual(req.headers.headers, { 'foo': ['bar'], 'bar': ['foo'] });
    assert.strictEqual(req.cache, 'no-cache');
    assert.strictEqual(req.credentials, 'include');
    assert.strictEqual(req.contentType, 'application/json');
    assert.strictEqual(req.progress, prcb);
    assert.strictEqual(req.timeout, 5000);
    // private
    assert.deepEqual(req._body, {foo:'bar'});
  });
});
