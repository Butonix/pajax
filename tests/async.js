import {Pajax,assert,noCall,baseURL} from './utils';

it('async', function(done) {
  var pajax = new Pajax({baseURL});

  Pajax.async(function*() {
    try {
      let res = yield pajax.get('/ok').fetch();
      assert.strictEqual(res.body, 'ok');
      return res;
    } catch(ex) {
      noCall(ex);
    }
  }).then(x=>{
    console.log('resolve', x);
    done()
  }, y=>{
    console.log('reject', y);
    noCall();
  });
});

it('async 2', function(done) {
  var pajax = new Pajax({baseURL});

  Pajax.async(function*(){
    try {
      let res = yield pajax.get('/error').fetch();
      throw res;
    } catch(err) {
      assert.strictEqual(err.error, 'error');
      assert.strictEqual(err.body, 'error');
    }
  }).then(done, noCall);

});
