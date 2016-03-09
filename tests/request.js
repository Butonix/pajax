import {Pajax,assert,noCall,baseURL} from './utils.js';

describe('get', function() {
  var pajax = new Pajax();
  it('should make request', function(done) {
    pajax.get('http://127.0.0.1:3500/ok')
         .then(res => {
           assert.strictEqual(res.status, 200);
           assert.strictEqual(res.body, 'ok');
         }, noCall).then(done, done);
  });

  it('should make request with base url', function(done) {
    pajax.get(baseURL + '/ok')
         .then(res => {
           assert.strictEqual(res.body, 'ok');
         }, noCall).then(done, done);
  });

  it('should reject request', function(done) {
    pajax.get(baseURL + '/error')
         .then(noCall, res => {
           assert.strictEqual(res.status, 500);
           assert.strictEqual(res.body, 'error');
           assert.strictEqual(res.statusText, 'Internal Server Error');
         }).then(done, done);
  });
});

describe('post/put/patch', function() {
  var pajax = new Pajax();
  it('should post data', function(done) {
    pajax.post(baseURL + '/data', 'foo')
         .then(res => {
           assert.strictEqual(res.body, 'POST: foo');
         }, noCall).then(done, done);

    pajax.put(baseURL + '/data', 'foo')
         .then(res => {
           assert.strictEqual(res.body, 'PUT: foo');
         }, noCall).then(done, done);

    pajax.patch(baseURL + '/data', 'foo')
         .then(res => {
           assert.strictEqual(res.body, 'PATCH: foo');
         }, noCall).then(done, done);
  });
});


describe('headers', function() {
  var pajax = new Pajax();
  it('should receive the response headers', function(done) {
    pajax.get(baseURL + '/header')
         .then(res => {
           assert.strictEqual(res.headers.get('content-type'), 'text/html; charset=utf-8');
         }, noCall).then(done, done);
  });
});

describe('requests', function() {
  var pajax = new Pajax({baseURL});

  it('should send the headers', function(done) {
    pajax.request(baseURL + '/headerecho')
         .get()
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

    var req = pajax.request('/error').get().checkStatus();
    retry(req, callback).then(noCall, res=> {
      assert.strictEqual(i, 3);
      done();
    });
  });
});
