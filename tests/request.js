import {Pajax,assert,noCall,baseURL} from './utils.js';

describe('blob', function() {
  var pajax = new Pajax();
  it('should receive the file as a blob', function(done) {
    pajax.request(baseURL + '/file.bin')
         .fetch()
         .then(res => {
           assert.strictEqual(res.body instanceof Blob, true);
           assert.strictEqual(res.body.type, 'application/octet-stream');
         }, noCall).then(done, done);
  });
});

describe('headers', function() {
  var pajax = new Pajax();
  it('should receive the response headers', function(done) {
    pajax.request(baseURL + '/header')
         .is('GET')
         .fetch()
         .then(res => {
           assert.strictEqual(res.headers.get('content-type'), 'text/html; charset=utf-8');
         }, noCall).then(done, done);
  });

  it('should send the headers', function(done) {
    pajax.request(baseURL + '/headerecho')
         .is('GET')
         .header('Accept-Language', 'foo')
         .header('authorization', `foo`)
         .fetch()
         .then(res => res.json())
         .then(body => {
           assert.strictEqual(body['accept-language'], 'foo');
           assert.strictEqual(body['authorization'], 'foo');
         }, noCall).then(done, done);
  });
});

describe('retry', function() {
  var pajax = new Pajax({baseURL});

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

    var req = pajax.request('/error').checkStatus();
    retry(req, callback).then(noCall, res=> {
      assert.strictEqual(i, 3);
      done();
    });
  });
});
