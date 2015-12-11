# pajax

[![Build Status](http://img.shields.io/travis/n-fuse/pajax.svg?style=flat)](https://travis-ci.org/n-fuse/pajax)

pajax is a library for promise based XHR request.
It has similarities with the upcoming [Fetch](https://fetch.spec.whatwg.org/) standard.

## Installation

```sh
jspm install github:n-fuse/pajax
```

## Usage

### Create an instance

```javascript
import Pajax from 'pajax';
var pajax = new Pajax();
```

There are built-in methods for `get`, `post`, `put`, `patch`, `delete` and `head`

### Fetching data

```javascript
pajax.get(url, opts)
     .send()
     .then(res=>{
        // res.body: the response from the server
      }, res=>{
        // called on network or status errors
      });
```

### Sending data

```javascript
pajax.post(url, opts)
     .attach(body)
     .send()
     .then(res=>{
       // res.body: the response from the server
     });
```

#### Parameters

- url (string) - the absolute or relative URL for this request
- opts (object) - set of key/value pairs to configure this ajax request
- body (mixed) - the data to be sent

#### Options (opts):

- noCache (boolean) - Forces GET requests not to be cached by the browser, by adding a _={timestamp} parameter when set to true
- queryParams (object) - set of key/value pairs that are added as parameters to the url
- responseType (string) - the expected result type from the server. Request is always rejected, when the result does not match the expected type.
- contentType (string) - the content type of the data sent to the server
- headers (object)- set of key/value pairs that are added to the request header
- progress (function) - callback for the the upload progress
- timeout (integer) - number of milliseconds to wait for a response
- withCredentials (boolean) - en/disables withCredentials


It is also possible to set the options by chaining methods in a request

```javascript
var pajax = new Pajax();
pajax.put('/url')
     .header({'Accept-Language': 'en'}) // headers via object
     .header('Accept-Language', 'en')   // header via key-value
     .query({'foo': 'bar'})             // query parameters via object
     .query('foo', 'bar')               // query parameter via key-value
     .noCache()
     .withCredentials()
     .responseType('application/json')
     .contentType('application/json')
     .progress(req, event=>{
       ...
     })
     .timeout(5000)
     .attach({ foo: 'bar' })
     .send()
     .then(res=>{
       res.body; // the response from the server
     }, res=>{
       res.error; // the error
     });
```

Call the methods on the pajax instance to set the options for every request.

```javascript
var pajax = new Pajax().header('Accept-Language', 'en').noCache();
pajax.get().send().then(...);

```

### Request/Response transformations

There are hooks to register transformation tasks for requests and responses

```javascript
pajax.get(url)
     .before(req=>{
       req; // request object
       // do some stuff before a request is sent
     })
     .before(req=>{
       req; // request object
       // do more stuff before a request is sent
     })
     .after(res=>{
       res; // response object
       // do some stuff after a request
     })
     .afterSuccess(res=>{
       res; // response object
       // do some stuff after a successful request
     })
     .afterFailure(res=>{
       res; // response object
       // do some stuff after a failed request
     })
     .send() // send request
     .then(res=>{
       // res.body: the response from the server
     });
```

Call the methods on the pajax instance to register transformation tasks for every request.

```javascript
var pajax = new Pajax().before(req=>{
       // do some stuff before a request is sent
     });

pajax.get().send().then(...);

```

## The Pajax/Request/Response Class

The Pajax class serves as a factory for request class instances.
You can implement custom methods or override the existing ones.

```javascript

// Class for the request objects
class MyRequest extends Pajax.Request {
  authenticate(authToken) {
    return this.before(req=>{
      req.header('authorization', `Bearer ${authToken}`);
    });
  }
}

// Class for the result objects
class MyResponse extends Pajax.Response {
  get isJSON() {
    return typeof this.body==='object';
  }
}

// Custom pajax class
class MyPajax extends Pajax {

  constructor(token, ...args) {
    super(...args);
    this.token = token;
  }
  // Add token to put/post/del
  post(...args) {
    return super.post(...args).authenticate(this.token);
  }
  put(...args) {
    return super.put(...args).authenticate(this.token);
  }
  del(...args) {
    return super.del(...args).authenticate(this.token);
  }
}

let token = 'foo';

var pajax = new MyPajax(token, {
  Request: MyRequest,
  Response: MyResponse
});

pajax.get(url)
     .authenticate(token) // Adds bearer token to request
     .send()
     .then(res => {
       // res.isAuthenticated = true
       // res.isJSON = true/false
     });

// bearer token is added by Pajax class
pajax.post(url)
     .send()
     .then(res => {
       // res.isAuthenticated = true
       // res.isJSON = true/false
     });     
```
There are also some predefined classes:

```javascript
// For jsons
var pajax = new Pajax.JSON(opts);
pajax.get('/url/to/json').send().then(res=>{
  res.body; /// js object
}, res=>{
  ...
});
```

```javascript
// For url encoded requests
var pajax = new Pajax.URLEncoded(opts);
pajax.post('/url', {foo:'bar'}).send().then(response=>{
  ...
}, res=>{
  ...
});
```
