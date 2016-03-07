import {Pajax,assert,noCall,baseURL} from './utils.js';

let auth = {
  token: 'salt'
};

class MyPajax extends Pajax {
  constructor(auth, ...args) {
    super(...args);
    this.auth = auth;
  }

  validateToken() {
    return this.get(baseURL + '/headerecho')
               .authenticate('rosemary')
               .fetch()
               .then(res=>{
                 return res.body.authorization==='Bearer salt rosemary';
               });
  }

  post(...args) {
    return super.post(...args).authenticate('pepper');
  }
}

MyPajax.Request = class extends Pajax.Request {
  authenticate(token2) {
    return this.before(req=> {
      return req.header('authorization', `Bearer ${req.factory.auth.token} ${token2}`);
    });
  }
};

MyPajax.Response = class extends Pajax.Response {
  get isAuthenticated() {
    return !!this.body.authorization;
  }
};
describe('custom', function() {

  let pajax = new MyPajax(auth, {baseURL});

  it('should send and receive the authToken', function(done) {
    pajax.get(baseURL + '/headerecho')
         .authenticate('cinnamon')
         .fetch()
         .then(res => {
           assert.strictEqual(res.isAuthenticated, true);
           assert.strictEqual(res.body.authorization, 'Bearer salt cinnamon');
         }, noCall).then(done, done);
  });

  it('should validate the token', function(done) {
    pajax.validateToken()
         .then(valid => {
           assert.strictEqual(valid, true);
         }, noCall).then(done, done);
  });

  it('should use send and receive the authToken 2', function(done) {
    pajax.post(baseURL + '/headerecho')
         .fetch()
         .then(res => {
           assert.strictEqual(res.isAuthenticated, true);
           assert.strictEqual(res.body.authorization, 'Bearer salt pepper');
         }, noCall).then(done, done);
  });
});
