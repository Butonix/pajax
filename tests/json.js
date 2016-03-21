import {Pajax,assert,noCall,baseURL} from './utils.js';

describe('JSON', function() {
  var pajax = new Pajax();

  it('should get parsed json via json()', function(done) {
    pajax.request(baseURL + '/json')
         .fetch()
         .then(res=>res.json())
         .then(body => {
           assert.deepEqual(body, {foo: 'bar'});
         }, noCall).then(done, done);
  });

  it('should get parsed json via auto()', function(done) {
    pajax.request(baseURL + '/json')
         .fetch()
         .then(res=>res.auto())
         .then(body => {
           assert.deepEqual(body, {foo: 'bar'});
         }, noCall).then(done, done);
  });

  it('should get json as text', function(done) {
    pajax.request(baseURL + '/json')
         .fetch()
         .then(res => res.text())
         .then(text => {
           assert.strictEqual(text, '{"foo":"bar"}');
         }, noCall).then(done, done);
  });

  it('should get jsontext as json', function(done) {
    pajax.request(baseURL + '/jsontext')
         .fetch()
         .then(res => res.json())
         .then(data => {
           assert.deepEqual(data, {foo: 'bar'});
         }, noCall).then(done, done);
  });

  it('should convert req data to json object as fallback', function(done) {
    pajax.request(baseURL + '/json')
         .attach({post: 'json'})
         .post()
         .then(res => res.json())
         .then(body => {
           assert.deepEqual(body, {post: 'json'});
         }, noCall).then(done, done);
  });
});

describe('Pajax.JSON', function() {
  var pajax = new Pajax().JSON();
  it('should get parsed json', function(done) {
    // JSON as contentType text
    pajax.get(baseURL + '/jsontext')
         .then(res=>res.json())
         .then(body => {
           assert.deepEqual(body, {'foo': 'bar'});
         }, noCall).then(done, done);
  });

  it('should post json object', function(done) {
    pajax.post(baseURL + '/json', {post: 'json'})
         .then(res=>res.auto())
         .then(body => {
           assert.deepEqual(body, {'post': 'json'});
         }, noCall).then(done, done);
  });

  it('should get json as text', function(done) {
    // Force
    pajax.request(baseURL + '/json')
         .fetch()
         .then(res=>res.text())
         .then(text => {
           assert.strictEqual(text, '{"foo":"bar"}');
         }, noCall).then(done, done);
  });

  it('should reject invalid json', function(done) {
    pajax.get(baseURL + '/ok')
         .then(res=>res.json())
         .then(noCall, err => {
           assert.strictEqual(err, 'Invalid JSON');
         }).then(done, done);
  });

});
