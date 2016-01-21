import {Pajax,assert,noCall,baseURL} from './utils';

describe('req hooks', function() {
  var pajax = new Pajax({baseURL});

  it('should call the hooks', function(done) {
    pajax.get('/header')
         .before(req=> {
           req.headers['Accept-Language'] = 'foo';
         })
         .after(res=> {
           res.decoration = 'flowers';
         })
         .afterSuccess(res=> {
           res.body = res.body.replace('foo', 'bar');
         })
         .fetch()
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
    .fetch()
    .catch(res => {
      assert.strictEqual(res.error, 'Server Error');
    }, noCall).then(done, done);
  });
});

describe('pajax hooks', function() {
  var pajax = new Pajax({baseURL})
              .before(req=> {
                req.headers['Accept-Language'] = 'foo';
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
         .fetch()
         .then(res => {
           assert.strictEqual(res.body, 'accept-language: bar');
           assert.strictEqual(res.decoration, 'flowers');
         }, noCall).then(done, done);
  });

  it('should call the hooks 2', function(done) {
    pajax.get('/error')
         .fetch()
         .catch(res => {
           assert.strictEqual(res.error, 'Server Error');
    }, noCall).then(done, done);
  });
});
