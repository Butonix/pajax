import Pajax from 'pajax';

function noCall(res) {
  console.log('Should not be called', res.body, res.status, res.error);
  expect(false).toEqual(true);
}

describe("pajax - basic", function() {
  it("request", function(done) {
    var pajax = new Pajax();
    pajax.get('http://127.0.0.1:3500/ok')
         .done()
         .then(res => {
           expect(res.body).toEqual('ok');
         }).catch(noCall).then(done, done);
  });

  it("request - req object", function(done) {
    var pajax = new Pajax();
    pajax.get('http://127.0.0.1:3500/ok')
         .done()
         .then(res => {
            expect(res.status).toEqual(200);
            expect(res.body).toEqual('ok');
          }).catch(noCall).then(done, done);
  });

  it("request - baseURL", function(done) {
    var pajax = new Pajax({baseURL: 'http://127.0.0.1:3500' });
    pajax.get('/ok')
         .done()
         .then(res => {
           expect(res.body).toEqual('ok');
         }).catch(noCall).then(done, done);
  });

  it("request - error", function(done) {
    var pajax = new Pajax({baseURL: 'http://127.0.0.1:3500' });
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

describe("pajax - advanced", function() {

  var pajax = new Pajax({baseURL: 'http://127.0.0.1:3500' });

  it("post", function(done) {
    pajax.post('/data')
         .send('foo')
         .done()
         .then(res => {
            expect(res.body).toEqual('POST: foo');
          }).catch(noCall).then(done, done);
  });

  it("post json", function(done) {
    pajax.post('/json')
         .send({post: 'json'})
         .done()
         .then(res => {
            expect(res.body).toEqual('{"post":"json"}');
          }).catch(noCall).then(done, done);
  });

  it("get json", function(done) {
    pajax.get('/json')
         .done()
         .then(res => {
            expect(res.body).toEqual('{"foo":"bar"}');
          }).catch(noCall).then(done, done);
  });

  it("response headers", function(done) {
    pajax.get('/header')
         .done()
         .then(res => {
           expect(res.headers['content-type']).toEqual('text/html; charset=utf-8');
         }).catch(noCall).then(done, done);
  });

  it("send headers", function(done) {
    pajax.get('/header')
         .header('Accept-Language', 'foo')
         .done()
         .then(res => {
           expect(res.body).toEqual('accept-language: foo');
         }).catch(noCall).then(done, done);
  });

  it("query params", function() {
    var url = pajax.get('/foo')
         .query({foo:1})
         .query({bar:2})
         .query('woo', 3)
         .processedURL;

     expect(url).toEqual('http://127.0.0.1:3500/foo?foo=1&bar=2&woo=3');
  });
});

describe("pajax - json", function() {

  var pajax = new Pajax.JSON({baseURL: 'http://127.0.0.1:3500' });

  it("get json", function(done) {
    pajax.get('/json')
         .done()
         .then(res => {
            expect(res.body).toEqual({"foo":"bar"});
    }).catch(noCall).then(done);
  });

  it("get json", function(done) {
    pajax.get('/ok')
         .done()
         .then(noCall)
         .catch(res => {
            expect(res.error).toEqual('Invalid JSON');
    }).then(done);
  });

  it("post json", function(done) {
    pajax.post('/json')
         .send({post: 'json'})
         .done()
         .then(res => {
            expect(res.body).toEqual({"post":"json"});
          }).catch(noCall).then(done);
  });
});
