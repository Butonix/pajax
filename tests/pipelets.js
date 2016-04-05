import {Pajax,assert,noCall,baseURL} from './utils.js';

describe('pajax pipelets', function() {
  var pajax = new Pajax()
              .before(req=> {
                return req.header('Accept-Language', 'foo');
              })
              .after(res=> {
                res.decoration = 'foo';
                return res;
              });

  it('should have called the before/after pipelets', function(done) {
    pajax.get(baseURL + '/header')
         .then(res => {
           assert.strictEqual(res.decoration, 'foo');
           return res.text();
         })
         .then(body => {
           assert.strictEqual(body, 'accept-language: foo');
         }, noCall)
         .then(done, done);
  });
});
