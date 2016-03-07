import {Pajax,assert,noCall,baseURL} from './utils.js';

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
    pajax.get(baseURL + '/ok')
         .fetch()
         .then(res => {
           assert.strictEqual(res.body, 'ok');
         }, noCall).then(done, done);
  });

  it('should reject request', function(done) {
    var pajax = new Pajax({baseURL});
    pajax.get(baseURL + '/error')
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
    pajax.post(baseURL + '/data')
         .attach('foo')
         .fetch()
         .then(res => {
           assert.strictEqual(res.body, 'POST: foo');
         }, noCall).then(done, done);
  });

  it('should receive the response headers', function(done) {
    pajax.get(baseURL + '/header')
         .fetch()
         .then(res => {
           assert.strictEqual(res.headers.get('content-type'), 'text/html; charset=utf-8');
         }, noCall).then(done, done);
  });

  it('should send the headers', function(done) {
    pajax.get(baseURL + '/headerecho')
         .header('Accept-Language', 'foo')
         .header('authorization', `foo`)
         .fetch()
         .then(res => {
           assert.strictEqual(res.body['accept-language'], 'foo');
           assert.strictEqual(res.body['authorization'], 'foo');
         }, noCall).then(done, done);
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
