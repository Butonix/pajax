import {Pajax,assert,noCall,baseURL} from './utils.js';

describe('static fetch', function() {

  it('should fetch ok', function(done) {
    Pajax.fetch('http://127.0.0.1:3500/ok')
         .then(res => {
           assert.strictEqual(res.status, 200);
           return res.text();
         }).then(body => {
           assert.strictEqual(body, 'ok');
         }, noCall).then(done, done);
  });

  it('should fetch error', function(done) {
    Pajax.fetch('http://127.0.0.1:3500/error')
         .then(res => {
           assert.strictEqual(res.status, 500);
           assert.strictEqual(res.statusText, 'Internal Server Error');
           return res.text();
         }).then(body => {
           assert.strictEqual(body, 'error');
         }, noCall).then(done, done);
  });

  it('should fetch error and checkStatus', function(done) {
    Pajax.fetch('http://127.0.0.1:3500/error')
         .then(Pajax.checkStatus)
         .then(noCall, res => {
           assert.strictEqual(res.status, 500);
           assert.strictEqual(res.statusText, 'Internal Server Error');
           return res.text();
         }).then(body => {
           assert.strictEqual(body, 'error');
         }, noCall).then(done, done);
  });
});
