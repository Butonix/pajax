import {Pajax,assert,noCall,baseURL} from './utils.js';

describe('get', function() {
  var pajax = new Pajax();

  it('should resolve get', function(done) {
    pajax.get(baseURL + '/ok')
         .then(res => {
           assert.strictEqual(res.status, 200);
         }, noCall).then(done, done);
  });

  it('should reject get', function(done) {
    pajax.get(baseURL + '/error')
         .then(noCall, res => {
           assert.strictEqual(res.status, 500);
         }).then(done, done);
  });

  it('should get text body', function(done) {
    pajax.getText(baseURL + '/ok')
         .then(body => {
           assert.strictEqual(body, 'ok');
         }, noCall).then(done, done);
  });

  it('should get text body', function(done) {
    pajax.request(baseURL + '/ok')
         .getText()
         .then(body => {
           assert.strictEqual(body, 'ok');
         }, noCall).then(done, done);
  });

  it('should get json response', function(done) {
    pajax.getJSON(baseURL + '/json')
         .then(body => {
           assert.deepEqual(body, { foo: 'bar' });
         }, noCall).then(done, done);
  });


  it('should reject response', function(done) {
    pajax.getText(baseURL + '/error')
         .then(noCall, res => {
           assert.strictEqual(res.status, 500);
         }).then(done, done);
  });
});

describe('post/put/patch', function() {
  var pajax = new Pajax();
  it('should patch data', function(done) {
    pajax.patch(baseURL + '/data', 'foo')
         .then(res=>res.auto())
         .then(body => {
           assert.strictEqual(body, 'PATCH: foo');
         }, noCall).then(done, done);
  });
  it('should put data', function(done) {
    pajax.put(baseURL + '/data', 'foo')
         .then(res=>res.auto())
         .then(body => {
           assert.strictEqual(body, 'PUT: foo');
         }, noCall).then(done, done);
  });
  it('should put data', function(done) {
    pajax.patch(baseURL + '/data', 'foo')
         .then(res=>res.auto())
         .then(body => {
           assert.strictEqual(body, 'PATCH: foo');
         }, noCall).then(done, done);
  });
});
