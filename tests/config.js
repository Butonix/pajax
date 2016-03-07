import {Pajax,assert,noCall,baseURL} from './utils.js';

describe('config', function() {
  it('should set configuration', function() {

    assert.strictEqual(Pajax.get('/url').method, 'GET');
    assert.strictEqual(Pajax.head('/url').method, 'HEAD');
    assert.strictEqual(Pajax.post('/url').method, 'POST');
    assert.strictEqual(Pajax.put('/url').method, 'PUT');
    assert.strictEqual(Pajax.patch('/url').method, 'PATCH');
    assert.strictEqual(Pajax.delete('/url').method, 'DELETE');

    let prcb = (req, event)=>{};

    var req = Pajax.patch('/url')
                   .header({'foo': 'bar'})
                   .header('bar', 'foo')
                   .noCache()
                   .withCredentials()
                   .setContentType('application/json')
                   .onProgress(prcb)
                   .setTimeout(5000)
                   .attach({foo:'bar'});

    assert.strictEqual(req.method, 'PATCH');
    assert.deepEqual(req.headers.get('foo'), 'bar');
    assert.deepEqual(req.headers.get('foo'), 'bar');
    assert.deepEqual(req.headers.headers, { 'foo': ['bar'], 'bar': ['foo'] });
    assert.strictEqual(req.cache, 'no-cache');
    assert.strictEqual(req.credentials, 'include');
    assert.strictEqual(req.contentType, 'application/json');
    assert.strictEqual(req.progress, prcb);
    assert.strictEqual(req.timeout, 5000);
    assert.deepEqual(req.body, {foo:'bar'});
  });
});
