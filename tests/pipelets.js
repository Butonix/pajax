import {Pajax,assert,noCall,baseURL} from './utils.js';

describe('req hooks', function() {
  var pajax = new Pajax();

  it('should call the pipelets', function(done) {
    pajax.get(baseURL + '/header')
         .before(req=> {
           return req.header('Accept-Language', 'foo');
         })
         .after(res=> {
           res.decoration = 'flowers';
           return res;
         })
         .afterSuccess(res=> {
           res.body = res.body.replace('foo', 'bar');
           return res;
         })
         .fetch()
         .then(res => {
           assert.strictEqual(res.body, 'accept-language: bar');
           assert.strictEqual(res.decoration, 'flowers');
         }, noCall).then(done, done);
  });

  it('should call the error pipelet', function(done) {
    pajax.get(baseURL + '/error')
    .afterFailure(res=> {
      res.error = res.error.replace('Internal ', '');
      return res;
    })
    .fetch()
    .catch(res => {
      assert.strictEqual(res.error, 'Server Error');
    }, noCall).then(done, done);
  });
});

describe('pajax hooks', function() {
  var pajax = new Pajax()
              .before(req=> {
                return req.header('Accept-Language', 'foo');
              })
              .after(res=> {
                res.decoration = 'flowers';
                return res;
              })
              .afterFailure(res=> {
                res.error = res.error.replace('Internal ', '');
                return res;
              })
              .afterSuccess(res=> {
                res.body = res.body.replace('foo', 'bar');
                return res;
              });

  it('should call the hooks', function(done) {
    pajax.get(baseURL + '/header')
         .fetch()
         .then(res => {
           assert.strictEqual(res.body, 'accept-language: bar');
           assert.strictEqual(res.decoration, 'flowers');
         }, noCall).then(done, done);
  });

  it('should call the hooks 2', function(done) {
    pajax.get(baseURL + '/error')
         .fetch()
         .catch(res => {
           assert.strictEqual(res.error, 'Server Error');
    }, noCall).then(done, done);
  });
});
