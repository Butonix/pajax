import {Pajax,assert,noCall,baseURL} from './utils';

describe('basic', function() {
  it('should make request', function(done) {
    var pajax = new Pajax();
    pajax.get('http://127.0.0.1:3500/ok')
         .fetch()
         .then(res => {
           assert.strictEqual(res.status, 200);
           assert.strictEqual(res.body, 'ok');
         }, noCall).then(done, done);
  });

  it('should make request with base url', function(done) {
    var pajax = new Pajax({baseURL});
    pajax.get('/ok')
         .fetch()
         .then(res => {
           assert.strictEqual(res.body, 'ok');
         }, noCall).then(done, done);
  });

  it('should reject request', function(done) {
    var pajax = new Pajax({baseURL});
    pajax.get('/error')
         .fetch()
         .then(noCall, res => {
           assert.strictEqual(res.status, 500);
           assert.strictEqual(res.body, 'error');
           assert.strictEqual(res.statusText, 'Internal Server Error');
         }).then(done, done);
  });
});


describe('advanced', function() {
  var pajax = new Pajax({baseURL});

  it('should post data', function(done) {
    pajax.post('/data')
         .attach('foo')
         .fetch()
         .then(res => {
           assert.strictEqual(res.body, 'POST: foo');
         }, noCall).then(done, done);
  });

  it('should receive the response headers', function(done) {
    pajax.get('/header')
         .fetch()
         .then(res => {
           assert.strictEqual(res.headers['content-type'], 'text/html; charset=utf-8');
           assert.strictEqual(res.contentType, 'text/html');
         }, noCall).then(done, done);
  });

  it('should send the headers', function(done) {
    pajax.get('/header')
         .header('Accept-Language', 'foo')
         .fetch()
         .then(res => {
           assert.strictEqual(res.body, 'accept-language: foo');
         }, noCall).then(done, done);
  });

  it('should add query params to url', function() {
    var url = pajax.get('/url?foo=0&me=4')
                   .query({foo: 1}) // overrides foo=0
                   .query({bar: 2}) // merges bar=2
                   .query('woo', 3) // merges woo=3
                   .url;

    assert.isTrue(url.indexOf('foo=1')>-1);
    assert.isTrue(url.indexOf('bar=2')>-1);
    assert.isTrue(url.indexOf('woo=3')>-1);
    assert.isTrue(url.indexOf('me=4')>-1);
  });

  it('should retry the request', function(done) {
    function retry(req, cb) {
      return pajax.fetch(req).catch(res=> {
        return cb(res).then(doRetry=> {
          if (doRetry) {
            return retry(req, cb);
          } else {
            return Promise.reject(res);
          }
        }).catch(()=> {
          return Promise.reject(res);
        });
      });
    }

    var i = 0;
    function callback(res) {
      i++;
      return Promise.resolve(i < 3);
    }

    var req = pajax.get('/error');
    retry(req, callback).then(noCall, res=> {
      assert.strictEqual(i, 3);
      done();
    });
  });
});
