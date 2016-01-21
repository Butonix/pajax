import {Pajax,assert,noCall,baseURL} from './utils';

it('should fetch ok', function(done) {
  Pajax.fetch('http://127.0.0.1:3500/ok')
       .then(res => {
         assert.strictEqual(res.status, 200);
         assert.strictEqual(res.body, 'ok');
       }, noCall).then(done, done);
});

it('should fetch error', function(done) {
  Pajax.fetch('http://127.0.0.1:3500/error')
       .then(res => {
         assert.strictEqual(res.status, 500);
         assert.strictEqual(res.body, 'error');
         assert.strictEqual(res.statusText, 'Internal Server Error');
       }, noCall).then(done, done);
});

it('should fetch error and checkStatus', function(done) {
  Pajax.fetch('http://127.0.0.1:3500/error')
       .then(Pajax.checkStatus())
       .then(noCall, res => {
         assert.strictEqual(res.status, 500);
         assert.strictEqual(res.body, 'error');
         assert.strictEqual(res.statusText, 'Internal Server Error');
       }).then(done, done);
});
