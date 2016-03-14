import {Pajax,assert,noCall,baseURL} from './utils.js';

let auth = {
  token: 'salt'
};

class MyPajax extends Pajax {
  validateToken() {
    return this.request(baseURL + '/headerecho')
               .authenticate('rosemary')
               .checkStatus()
               .fetch()
               .then(res=>res.json())
               .then(body=>{
                 return body.authorization==='Bearer salt rosemary';
               });
  }

  getAuthenticated(url, init) {
    return this.request(url, init)
               .authenticate('cinnamon')
               .checkStatus()
               .fetch();
  }

  post(url, body, init) {
      return this.request(url, init)
                 .is('POST')
                 .attach(body)
                 .authenticate('pepper')
                 .checkStatus()
                 .fetch();
  }
}

MyPajax.def.request.auth = true;

MyPajax.Request = class extends Pajax.Request {
  authenticate(token2) {
    return this.before(req=> {
      return req.header('authorization', `Bearer ${this.auth.token} ${token2}`);
    });
  }
};

MyPajax.Response = class extends Pajax.Response {
  get isAuthenticated() {
    return true;
  }
};

describe('custom', function() {

  let pajax = new MyPajax({auth});

  it('should send and receive the authToken', function(done) {
    pajax.getAuthenticated(baseURL + '/headerecho')
         .then(res => {
           assert.strictEqual(res.isAuthenticated, true);
           return res.json();
         })
         .then(body => {
           assert.strictEqual(body.authorization, 'Bearer salt cinnamon');
         }, noCall)
         .then(done, done);
  });

  it('should validate the token', function(done) {
    pajax.validateToken()
         .then(valid => {
           assert.strictEqual(valid, true);
         }, noCall).then(done, done);
  });

  it('should use send and receive the authToken 2', function(done) {
    pajax.post(baseURL + '/headerecho')
         .then(res => {
           assert.strictEqual(res.isAuthenticated, true);
           return res.json();
         })
         .then(body => {
           assert.strictEqual(body.authorization, 'Bearer salt pepper');
         }, noCall)
         .then(done, done);
  });
});
