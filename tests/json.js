import {Pajax,assert,noCall,baseURL} from './utils.js';

describe('basic', function() {
  var pajax = new Pajax();

  it('should get parsed json via serializer', function(done) {
    pajax.get(baseURL + '/json')
         .fetch()
         .then(res => {
           assert.deepEqual(res.body, {foo: 'bar'});
         }, noCall).then(done, done);
  });

  it('should get json as text', function(done) {
    pajax.get(baseURL + '/json')
         .fetch()
         .then(res => res.text())
         .then(text => {
           assert.strictEqual(text, '{"foo":"bar"}');
         }, noCall).then(done, done);
  });

  it('should get jsontext as json', function(done) {
    pajax.get(baseURL + '/jsontext')
         .fetch()
         .then(res => res.json())
         .then(data => {
           assert.deepEqual(data, {foo: 'bar'});
         }, noCall).then(done, done);
  });

  it('should convert data to json object as fallback', function(done) {
    pajax.post(baseURL + '/json')
         .attach({post: 'json'})
         .fetch()
         .then(res => {
           assert.deepEqual(res.body, {post: 'json'});
         }, noCall).then(done, done);
  });
});

describe('Pajax.JSON', function() {
  var pajax = new Pajax().JSON(true);
  it('should get parsed json', function(done) {
    // JSON as contentType text
    pajax.get(baseURL + '/jsontext')
         .fetch()
         .then(res => {
           assert.deepEqual(res.body, {'foo': 'bar'});
         }, noCall).then(done, done);
  });

  it('should post json object', function(done) {
    pajax.post(baseURL + '/json')
         .attach({post: 'json'})
         .fetch()
         .then(res => {
           assert.deepEqual(res.body, {'post': 'json'});
         }, noCall).then(done, done);
  });

  it('should get json as text', function(done) {
    // Force
    pajax.get(baseURL + '/json')
         .fetch()
         .then(res=>res.text())
         .then(text => {
           assert.strictEqual(text, '{"foo":"bar"}');
         }, noCall).then(done, done);
  });

  it('should reject invalid json', function(done) {
    pajax.get(baseURL + '/ok')
         .fetch()
         .then(noCall, res => {
           assert.strictEqual(res.error, 'Invalid JSON');
         }).then(done, done);
  });

  var pajax2 = new Pajax().JSON();
  it('should get invalid json as text', function(done) {
    pajax2.get(baseURL + '/ok')
          .fetch()
          .then(res => {
            assert.strictEqual(res.body, 'ok');
          }, noCall).then(done, done);
  });

});
