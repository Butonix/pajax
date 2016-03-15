import {Pajax,assert,noCall,baseURL} from './utils.js';

describe('get', function() {
  var pajax = new Pajax();
  it('should get text response', function(done) {
    pajax.get('http://127.0.0.1:3500/ok')
         .then(body => {
           assert.strictEqual(body, 'ok');
         }, noCall).then(done, done);
  });

  it('should get json response', function(done) {
    pajax.get('http://127.0.0.1:3500/json')
         .then(body => {
           assert.deepEqual(body, { foo: 'bar' });
         }, noCall).then(done, done);
  });

  it('should reject response', function(done) {
    pajax.get(baseURL + '/error')
         .then(noCall, res => {
           assert.strictEqual(res.status, 500);
         }).then(done, done);
  });
});

describe('post/put/patch', function() {
  var pajax = new Pajax();
  it('should patch data', function(done) {
    pajax.patch(baseURL + '/data', 'foo')
         .then(body => {
           assert.strictEqual(body, 'PATCH: foo');
         }, noCall).then(done, done);
  });
  it('should put data', function(done) {
    pajax.put(baseURL + '/data', 'foo')
         .then(body => {
           assert.strictEqual(body, 'PUT: foo');
         }, noCall).then(done, done);
  });
  it('should put data', function(done) {
    pajax.patch(baseURL + '/data', 'foo')
         .then(body => {
           assert.strictEqual(body, 'PATCH: foo');
         }, noCall).then(done, done);
  });
});
