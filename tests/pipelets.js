import {Pajax,assert,noCall,baseURL} from './utils.js';

describe('req hooks', function() {
  var pajax = new Pajax();

  it('should call the pipelets', function(done) {
    pajax.request(baseURL + '/header')
         .checkStatus()
         .before(req=> {
           return req.header('Accept-Language', 'foo');
         })
         .after(res=> {
           res.afterDecoration = 'flowers';
           return res;
         })
         .afterSuccess(res=> {
           res.afterSuccessDecoration = 'candles';
           return res;
         })
         .fetch()
         .then(res => {
           assert.strictEqual(res.afterDecoration, 'flowers');
           assert.strictEqual(res.afterSuccessDecoration, 'candles');
           return res.text();
         })
         .then(body => {
           assert.strictEqual(body, 'accept-language: foo');
         }, noCall)
         .then(done, done);
  });

  it('should call the error pipelet', function(done) {
    pajax.request(baseURL + '/error')
         .checkStatus()
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
                res.afterDecoration = 'flowers';
                return res;
              })
              .afterFailure(res=> {
                res.error = res.error.replace('Internal ', '');
                return res;
              })
              .afterSuccess(res=> {
                res.afterSuccessDecoration = 'candles';
                return res;
              });

  it('should call the pipelets', function(done) {
    pajax.request(baseURL + '/header')
         .fetch()
         .then(res => {
           assert.strictEqual(res.afterDecoration, 'flowers');
           assert.strictEqual(res.afterSuccessDecoration, 'candles');
           return res.text();
         })
         .then(body => {
           assert.strictEqual(body, 'accept-language: foo');
         }, noCall)
         .then(done, done);
  });

  it('should call the pipelets 2', function(done) {
    pajax.get(baseURL + '/error')
         .catch(res => {
           assert.strictEqual(res.error, 'Server Error');
    }, noCall).then(done, done);
  });
});
