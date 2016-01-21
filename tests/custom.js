import {Pajax,assert,noCall,baseURL} from './utils';

let auth = {
  token: 'foo'
};

class MyRequest extends Pajax.Request {
  authenticate(salt) {
    return this.before(req=> {
      req.header('authorization', `Bearer ${req.data.auth.token} ${salt}`);
    });
  }
}

class MyResponse extends Pajax.Response {
  get isAuthenticated() {
    return !!this.body.authorization;
  }
}

class MyPajax extends Pajax {
  validateToken() {
    return this.get('/headerecho')
               .authenticate('pepper')
               .fetch()
               .then(res=>{
                 return res.body.authorization==='Bearer foo pepper';
               });
  }

  post(...args) {
    return super.post(...args).authenticate('pepper');
  }
}

var pajax = new MyPajax({baseURL}, {
  Response: MyResponse,
  Request: MyRequest,
  requestData: {
    auth
  }
});

it('should send and receive the authToken', function(done) {
  pajax.get('/headerecho')
       .authenticate('salt')
       .fetch()
       .then(res => {
         assert.strictEqual(res.isAuthenticated, true);
         assert.strictEqual(res.body.authorization, 'Bearer foo salt');
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
         assert.strictEqual(res.body.authorization, 'Bearer foo pepper');
       }, noCall).then(done, done);
});
