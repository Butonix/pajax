import Pajax from 'pajax';

var baseURL = 'http://127.0.0.1:3500';

function noCall(res) {
  console.log('Should not be called', res.body, res.status, res.error);
  expect(true).toEqual(false);
}

describe("basic", function() {

  it("should make request", function(done) {
    var pajax = new Pajax();
    pajax.get('http://127.0.0.1:3500/ok')
         .done()
         .then(res => {
            expect(res.status).toEqual(200);
            expect(res.body).toEqual('ok');
          }).catch(noCall).then(done, done);
  });

  it("should make request with base url", function(done) {
    var pajax = new Pajax({baseURL: baseURL });
    pajax.get('/ok')
         .done()
         .then(res => {
           expect(res.body).toEqual('ok');
         }).catch(noCall).then(done, done);
  });

  it("should reject request", function(done) {
    var pajax = new Pajax({baseURL: baseURL });
    pajax.get('/error')
         .done()
         .then(noCall)
         .catch(req => {
             expect(req.status).toEqual(500);
             expect(req.body).toEqual('error');
             expect(req.statusText).toEqual('Internal Server Error');
          })
         .then(done, done);
  });
});

describe("advanced", function() {

  var pajax = new Pajax({baseURL: baseURL });

  it("should post data", function(done) {
    pajax.post('/data')
         .send('foo')
         .done()
         .then(res => {
            expect(res.body).toEqual('POST: foo');
          }).catch(noCall).then(done, done);
  });

  it("should receice the response headers", function(done) {
    pajax.get('/header')
         .done()
         .then(res => {
           expect(res.headers['content-type']).toEqual('text/html; charset=utf-8');
           expect(res.contentType).toEqual('text/html');
         }).catch(noCall).then(done, done);
  });

  it("should send the headers", function(done) {
    pajax.get('/header')
         .header('Accept-Language', 'foo')
         .done()
         .then(res => {
           expect(res.body).toEqual('accept-language: foo');
         }).catch(noCall).then(done, done);
  });

  it("should add query params to url", function() {
    var url = pajax.get('/foo')
         .query({foo:1})
         .query({bar:2})
         .query('woo', 3)
         .processedURL;

     expect(url).toEqual('http://127.0.0.1:3500/foo?foo=1&bar=2&woo=3');
  });
});

describe("json", function() {

  describe("basic", function() {
    var pajax = new Pajax({baseURL: baseURL });

    it("should get parsed json via serializer", function(done) {
      pajax.get('/json')
           .done()
           .then(res => {
              expect(res.body).toEqual({foo:"bar"});
            }).catch(noCall).then(done, done);
    });

    it("should get parsed json via response type", function(done) {
      pajax.get('/json')
           .responseType('json')
           .done()
           .then(res => {
              expect(res.body).toEqual({foo:"bar"});
            }).catch(noCall).then(done, done);
    });

    it("should get json as text", function(done) {
      pajax.get('/json')
           .responseType('text')
           .done()
           .then(res => {
              expect(res.body).toEqual('{"foo":"bar"}');
            }).catch(noCall).then(done, done);
    });

    it("should convert data to json object as fallback", function(done) {
      pajax.post('/json')
           .send({post: 'json'})
           .done()
           .then(res => {
              expect(res.body).toEqual({post:"json"});
            }).catch(noCall).then(done, done);
    });
  });

  describe("class", function() {
    var pajax = new Pajax.JSON({baseURL: baseURL });
    it("should get parsed json", function(done) {
      pajax.get('/json')
           .done()
           .then(res => {
              expect(res.body).toEqual({"foo":"bar"});
      }).catch(noCall).then(done);
    });

    it("should get invalid json and throw error", function(done) {
      pajax.get('/ok')
           .done()
           .then(noCall)
           .catch(res => {
              expect(res.error).toEqual('Invalid JSON');
      }).then(done);
    });

    it("should post json object", function(done) {
      pajax.post('/json')
           .send({post: 'json'})
           .done()
           .then(res => {
              expect(res.body).toEqual({"post":"json"});
            }).catch(noCall).then(done);
    });
  });
});
