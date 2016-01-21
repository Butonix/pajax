import {Pajax,assert,noCall,baseURL} from './utils';

describe('basic', function() {
  var pajax = new Pajax({baseURL});

  it('should get parsed json via serializer', function(done) {
    pajax.get('/json')
         .fetch()
         .then(res => {
           assert.deepEqual(res.body, {foo: 'bar'});
         }, noCall).then(done, done);
  });

  it('should get parsed json via response type. Not working in some (older) Browsers.', function(done) {
    pajax.get('/json')
         .setResponseType('json')
         .fetch()
         .then(res => {
           assert.deepEqual(res.body, {foo: 'bar'});
         }, noCall).then(done, done);
  });

  it('should get json as text', function(done) {
    pajax.get('/json')
         .asText()
         .fetch()
         .then(res => {
           assert.strictEqual(res.body, '{"foo":"bar"}');
         }, noCall).then(done, done);
  });

  it('should convert data to json object as fallback', function(done) {
    pajax.post('/json')
         .attach({post: 'json'})
         .fetch()
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
         .fetch()
         .then(res => {
           assert.deepEqual(res.body, {'foo': 'bar'});
         }, noCall).then(done, done);
  });

  it('should post json object', function(done) {
    pajax.post('/json')
         .attach({post: 'json'})
         .fetch()
         .then(res => {
           assert.deepEqual(res.body, {'post': 'json'});
         }, noCall).then(done, done);
  });

  it('should get json as text', function(done) {
    // Force
    pajax.get('/json')
         .asText()
         .fetch()
         .then(res => {
           assert.strictEqual(res.body, '{"foo":"bar"}');
         }, noCall).then(done, done);
  });

  it('should reject invalid json', function(done) {
    pajax.get('/ok')
         .fetch()
         .then(noCall, res => {
           assert.strictEqual(res.error, 'Invalid response');
           assert.strictEqual(res.body, 'ok');
         }).then(done, done);
  });

  var pajax2 = new Pajax.JSON({baseURL, forceJSON: false});
  it('should get invalid json as text', function(done) {
    pajax2.get('/ok')
          .fetch()
          .then(res => {
            assert.strictEqual(res.body, 'ok');
          }, noCall).then(done, done);
  });

});
