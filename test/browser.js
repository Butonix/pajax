/*globals it, describe */

import Pajax from '../lib/main';
import chai from 'chai';

var assert = chai.assert;
var baseURL = 'http://127.0.0.1:3500';

function noCall(res) {
  console.log('noCall', res.status);
  console.log('noCall', res.error);
  console.log('noCall', res.body);
  assert.fail('Should not be called');
}

describe('static', function() {
  it('should make request', function(done) {

    assert.strictEqual(Pajax.get('/url').opts.method, 'GET');
    assert.strictEqual(Pajax.head('/url').opts.method, 'HEAD');
    assert.strictEqual(Pajax.post('/url').opts.method, 'POST');
    assert.strictEqual(Pajax.put('/url').opts.method, 'PUT');
    assert.strictEqual(Pajax.del('/url').opts.method, 'DELETE');

    Pajax.get('http://127.0.0.1:3500/ok')
         .send()
         .then(res => {
           assert.strictEqual(res.status, 200);
           assert.strictEqual(res.body, 'ok');
         }, noCall).then(done, done);
  });
});

describe('basic', function() {

  it('should make request', function(done) {
    var pajax = new Pajax();
    pajax.get('http://127.0.0.1:3500/ok')
         .send()
         .then(res => {
           assert.strictEqual(res.status, 200);
           assert.strictEqual(res.body, 'ok');
         }, noCall).then(done, done);
  });

  it('should make request with base url', function(done) {
    var pajax = new Pajax({baseURL});
    pajax.get('/ok')
         .send()
         .then(res => {
           assert.strictEqual(res.body, 'ok');
         }, noCall).then(done, done);
  });

  it('should reject request', function(done) {
    var pajax = new Pajax({baseURL});
    pajax.get('/error')
         .send()
         .then(noCall)
         .catch(res => {
           assert.strictEqual(res.status, 500);
           assert.strictEqual(res.body, 'error');
           assert.strictEqual(res.statusText, 'Internal Server Error');
         }).then(done, done);
  });
});

describe('helpers', function() {
  it('should have static helpers', function() {
    assert.strictEqual(typeof Pajax.qsParse, 'function');
    assert.strictEqual(typeof Pajax.qsStringify, 'function');
    assert.strictEqual(typeof Pajax.isURL, 'function');
    assert.strictEqual(typeof Pajax.parseURL, 'function');
    assert.strictEqual(typeof Pajax.clone, 'function');
    assert.strictEqual(typeof Pajax.merge, 'function');

    var parsedURL = Pajax.parseURL('http://www.foo.net/bar');

    assert.strictEqual(parsedURL.isRelative, false);
    assert.strictEqual(parsedURL.host, 'www.foo.net');
  });
});



describe('advanced', function() {
  var pajax = new Pajax({baseURL});

  it('should post data', function(done) {
    pajax.post('/data')
         .attach('foo')
         .send()
         .then(res => {
           assert.strictEqual(res.body, 'POST: foo');
         }, noCall).then(done, done);
  });

  it('should receive the response headers', function(done) {
    pajax.get('/header')
         .send()
         .then(res => {
           assert.strictEqual(res.headers['content-type'], 'text/html; charset=utf-8');
           assert.strictEqual(res.contentType, 'text/html');
         }, noCall).then(done, done);
  });

  it('should send the headers', function(done) {
    pajax.get('/header')
         .header('Accept-Language', 'foo')
         .send()
         .then(res => {
           assert.strictEqual(res.body, 'accept-language: foo');
         }, noCall).then(done, done);
  });

  it('should add query params to url', function() {
    var url = pajax.get('/url?foo=0&me=4')
         .query({foo: 1}) // overrides foo=0
         .query({bar: 2}) // merges bar=2
         .query('woo', 3)
         .processedURL;

    assert.isTrue(url.indexOf('foo=1')>-1);
    assert.isTrue(url.indexOf('bar=2')>-1);
    assert.isTrue(url.indexOf('woo=3')>-1);
    assert.isTrue(url.indexOf('me=4')>-1);
    assert.strictEqual(url.indexOf('http://127.0.0.1:3500/url?'),0);
  });

  it('should retry the request', function(done) {

    function retry(req, cb) {
      return req.send().catch(res=> {
        return cb(res).then(doRetry=> {
          if (doRetry) {
            return retry(res.request, cb);
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


describe('req hooks', function() {
  var pajax = new Pajax({baseURL});

  it('should call the hooks', function(done) {
    pajax.get('/header')
         .before(req=> {
           req.header('Accept-Language', 'foo');
         })
         .after(res=> {
           res.decoration = 'flowers';
         })
         .afterSuccess(res=> {
           res.body = res.body.replace('foo', 'bar');
         })
         .send()
         .then(res => {
           assert.strictEqual(res.body, 'accept-language: bar');
           assert.strictEqual(res.decoration, 'flowers');
         }, noCall).then(done, done);
  });

  it('should call the hooks 2', function(done) {
    pajax.get('/error')
    .afterFailure(res=> {
      res.error = res.error.replace('Internal ', '');
    })
    .send()
    .catch(res => {
      assert.strictEqual(res.error, 'Server Error');
    }, noCall).then(done, done);
  });
});

describe('pajax hooks', function() {
  var pajax = new Pajax({baseURL})
              .before(req=> {
                req.header('Accept-Language', 'foo');
              })
              .after(res=> {
                res.decoration = 'flowers';
              })
              .afterFailure(res=> {
                res.error = res.error.replace('Internal ', '');
              })
              .afterSuccess(res=> {
                res.body = res.body.replace('foo', 'bar');
              });

  it('should call the hooks', function(done) {
    pajax.get('/header')
         .send()
         .then(res => {
           assert.strictEqual(res.body, 'accept-language: bar');
           assert.strictEqual(res.decoration, 'flowers');
         }, noCall).then(done, done);
  });

  it('should call the hooks 2', function(done) {
    pajax.get('/error')
         .send()
         .catch(res => {
           assert.strictEqual(res.error, 'Server Error');
    }, noCall).then(done, done);
  });
});




describe('json', function() {
  describe('basic', function() {
    var pajax = new Pajax({baseURL});

    it('should get parsed json via serializer', function(done) {
      pajax.get('/json')
           .send()
           .then(res => {
             assert.deepEqual(res.body, {foo: 'bar'});
           }, noCall).then(done, done);
    });

    it('should get parsed json via response type. Not working in some (older) Browsers.', function(done) {
      pajax.get('/json')
           .setResponseType('json')
           .send()
           .then(res => {
             assert.deepEqual(res.body, {foo: 'bar'});
           }, noCall).then(done, done);
    });

    it('should get json as text', function(done) {
      pajax.get('/json')
           .asText()
           .send()
           .then(res => {
             assert.strictEqual(res.body, '{"foo":"bar"}');
           }, noCall).then(done, done);
    });

    it('should convert data to json object as fallback', function(done) {
      pajax.post('/json')
           .attach({post: 'json'})
           .send()
           .then(res => {
             assert.deepEqual(res.body, {post: 'json'});
           }, noCall).then(done, done);
    });
  });

  describe('Pajax.JSON', function() {
    var pajax = new Pajax.JSON({baseURL, forceJSON: true});
    it('should get parsed json', function(done) {
      // JSON as contentType text
      pajax.get('/jsontext')
           .send()
           .then(res => {
             assert.deepEqual(res.body, {'foo': 'bar'});
           }, noCall).then(done, done);
    });

    it('should post json object', function(done) {
      pajax.post('/json')
           .attach({post: 'json'})
           .send()
           .then(res => {
             assert.deepEqual(res.body, {'post': 'json'});
           }, noCall).then(done, done);
    });

    it('should get json as text', function(done) {
      // Force
      pajax.get('/json')
           .asText()
           .send()
           .then(res => {
             assert.strictEqual(res.body, '{"foo":"bar"}');
           }, noCall).then(done, done);
    });

    it('should reject invalid json', function(done) {
      pajax.get('/ok')
           .send()
           .then(noCall, res => {
             assert.strictEqual(res.error, 'Invalid response');
             assert.strictEqual(res.body, 'ok');
           }).then(done, done);
    });

    var pajax2 = new Pajax.JSON({baseURL, forceJSON: false});
    it('should get invalid json as text', function(done) {
      pajax2.get('/ok')
           .send()
           .then(res => {
             assert.strictEqual(res.body, 'ok');
           }, noCall).then(done, done);
    });

  });
});

describe('Extending requests/responses', function() {
  let auth = {
    token: 'foo'
  };

  var pajax = new Pajax({baseURL}, {
    requestData: {
      auth,
      authenticate(salt) {
        return this.before(req=> {
          req.header('authorization', `Bearer ${req.auth.token} ${salt}`);
        });
      }
    }
  });

  it('should send and receive the authToken', function(done) {
    pajax.get('/headerecho')
         .authenticate('salt')
         .send()
         .then(res => {
           assert.strictEqual(res.body.authorization, 'Bearer foo salt');
         }, noCall).then(done, done);
  });
});


describe('Overriding request/response classes', function() {

  let authToken = 'foo';

  class MyRequest extends Pajax.Request {
    authenticate(salt) {
      return this.before(req=> {
        req.header('authorization', `Bearer ${authToken} ${salt}`);
      });
    }
  }

  class MyResponse extends Pajax.Response {
    get isAuthenticated() {
      return !!this.body.authorization;
    }
  }

  class MyPajax extends Pajax {
    validateToken() {
      return this.get('/headerecho').authenticate('pepper')
                 .send()
                 .then(res=>{
                   return res.body.authorization==='Bearer foo pepper';
                 });
    }

    post(...args) {
      return super.post(...args).authenticate('pepper');
    }
  }

  var pajax = new MyPajax({baseURL}, {
    Response: MyResponse,
    Request: MyRequest
  });

  it('should send and receive the authToken', function(done) {
    pajax.get('/headerecho')
         .authenticate('salt')
         .send()
         .then(res => {
           assert.strictEqual(res.isAuthenticated, true);
           assert.strictEqual(res.body.authorization, 'Bearer foo salt');
         }, noCall).then(done, done);
  });

  it('should validate the token', function(done) {
    pajax.validateToken()
         .then(valid => {
           assert.strictEqual(valid, true);
         }, noCall).then(done, done);
  });

  it('should use send and receive the authToken 2', function(done) {
    pajax.post('/headerecho')
         .send()
         .then(res => {
           assert.strictEqual(res.isAuthenticated, true);
           assert.strictEqual(res.body.authorization, 'Bearer foo pepper');
         }, noCall).then(done, done);
  });
});
