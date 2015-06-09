import Pajax from '../lib/main';

var baseURL = 'http://127.0.0.1:3500';

function noCall(res) {
  console.log(res.body, res.status, res.error);
  assert.fail('Should not be called');
}

describe("basic", function() {

  it("should make request", function(done) {
    var pajax = new Pajax();
    pajax.get('http://127.0.0.1:3500/ok')
         .done()
         .then(res => {
           assert.strictEqual(res.status, 200);
           assert.strictEqual(res.body, 'ok');
          }).catch(noCall).then(done, done);
  });

  it("should make request with base url", function(done) {
    var pajax = new Pajax({baseURL: baseURL });
    pajax.get('/ok')
         .done()
         .then(res => {
           assert.strictEqual(res.body, 'ok');
         }).catch(noCall).then(done, done);
  });

  it("should reject request", function(done) {
    var pajax = new Pajax({baseURL: baseURL });
    pajax.get('/error')
         .done()
         .then(noCall)
         .catch(res => {
           assert.strictEqual(res.status, 500);
           assert.strictEqual(res.body, 'error');
           assert.strictEqual(res.statusText, 'Internal Server Error');
          })
         .then(done, done);
  });
});

describe("helpers", function() {
  it("should have static helpers", function() {
    assert.strictEqual(typeof Pajax.qsParse, 'function');
    assert.strictEqual(typeof Pajax.qsStringify, 'function');
    assert.strictEqual(typeof Pajax.isIRI, 'function');
    assert.strictEqual(typeof Pajax.parseIRI, 'function');
    assert.strictEqual(typeof Pajax.clone, 'function');
    assert.strictEqual(typeof Pajax.defaults, 'function');
    assert.strictEqual(typeof Pajax.merge, 'function');
  });
});

describe("advanced", function() {

  var pajax = new Pajax({baseURL: baseURL });

  it("should post data", function(done) {
    pajax.post('/data')
         .send('foo')
         .done()
         .then(res => {
           assert.strictEqual(res.body, 'POST: foo');
          }).catch(noCall).then(done, done);
  });

  it("should receice the response headers", function(done) {
    pajax.get('/header')
         .done()
         .then(res => {
           assert.strictEqual(res.headers['content-type'], 'text/html; charset=utf-8');
           assert.strictEqual(res.contentType, 'text/html');
         }).catch(noCall).then(done, done);
  });

  it("should send the headers", function(done) {
    pajax.get('/header')
         .header('Accept-Language', 'foo')
         .done()
         .then(res => {
           assert.strictEqual(res.body, 'accept-language: foo');
         }).catch(noCall).then(done, done);
  });

  it("should add query params to url", function() {
    var url = pajax.get('/foo')
         .query({foo:1})
         .query({bar:2})
         .query('woo', 3)
         .processedURL;

    assert.strictEqual(url, 'http://127.0.0.1:3500/foo?foo=1&bar=2&woo=3');
  });
});

describe("json", function() {

  describe("basic", function() {
    var pajax = new Pajax({baseURL: baseURL });

    it("should get parsed json via serializer", function(done) {
      pajax.get('/json')
           .done()
           .then(res => {
             assert.deepEqual(res.body, {foo:"bar"});
            }).catch(noCall).then(done, done);
    });

    it("should get parsed json via response type", function(done) {
      pajax.get('/json')
           .responseType('json')
           .done()
           .then(res => {
             assert.deepEqual(res.body, {foo:"bar"});
            }).catch(noCall).then(done, done);
    });

    it("should get json as text", function(done) {
      pajax.get('/json')
           .responseType('text')
           .done()
           .then(res => {
             assert.strictEqual(res.body, '{"foo":"bar"}');
            }).catch(noCall).then(done, done);
    });

    it("should convert data to json object as fallback", function(done) {
      pajax.post('/json')
           .send({post: 'json'})
           .done()
           .then(res => {
             assert.deepEqual(res.body, {post:"json"});
            }).catch(noCall).then(done, done);
    });
  });

  describe("Pajax.JSON", function() {
    var pajax = new Pajax.JSON({asJSON: true, baseURL: baseURL });
    it("should get parsed json", function(done) {
      pajax.get('/json')
           .done()
           .then(res => {
             assert.deepEqual(res.body, {"foo":"bar"});
      }).catch(noCall).then(done, done);
    });

    it("should get invalid json and throw error", function(done) {
      pajax.get('/ok')
           .done()
           .then(noCall)
           .catch(res => {
             assert.strictEqual(res.error, 'Invalid JSON');
      }).then(done, done);
    });

    it("should post json object", function(done) {
      pajax.post('/json')
           .send({post: 'json'})
           .done()
           .then(res => {
             assert.deepEqual(res.body, {"post":"json"});
      }).catch(noCall).then(done, done);
    });
  });
});
