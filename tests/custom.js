import {Pajax,assert,noCall,baseURL} from './utils';

let auth = {
  token: 'salt'
};

class MyRequest extends Pajax.Request {
  constructor(auth, ...args) {
    super(...args);
    this.auth = auth;
  }
  authenticate(token2) {
    return this.before(req=> {
      req.header('authorization', `Bearer ${req.auth.token} ${token2}`);
    });
  }
}

class MyResponse extends Pajax.Response {
  get isAuthenticated() {
    return !!this.body.authorization;
  }
}

class MyPajax extends Pajax {

  constructor(auth, ...args) {
    super(...args);
    this.auth = auth;
  }

  validateToken() {
    return this.get('/headerecho')
               .authenticate('rosemary')
               .fetch()
               .then(res=>{
                 return res.body.authorization==='Bearer salt rosemary';
               });
  }

  post(...args) {
    return super.post(...args).authenticate('pepper');
  }

  createRequest(...args) {
    return new MyRequest(this.auth, ...args);
  }

  createResponse(...args) {
    return new MyResponse(...args);
  }
}

var pajax = new MyPajax(auth, {baseURL});

it('should send and receive the authToken', function(done) {
  pajax.get('/headerecho')
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
  pajax.post('/headerecho')
       .fetch()
       .then(res => {
         assert.strictEqual(res.isAuthenticated, true);
         assert.strictEqual(res.body.authorization, 'Bearer salt pepper');
       }, noCall).then(done, done);
});
