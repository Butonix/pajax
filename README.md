# pajax

[![Build Status](http://img.shields.io/travis/n-fuse/pajax.svg?style=flat)](https://travis-ci.org/n-fuse/pajax)

pajax is a library for promise based XHR request.
It has similarities to the upcoming [Fetch](https://fetch.spec.whatwg.org/) standard.

## Installation

```sh
jspm install github:n-fuse/pajax
```


## Quick start

### Fetching data via fetch()

```javascript
import Pajax from 'pajax';

Pajax.fetch(url, opts)
     .then(res=>{
       res.body: // the response from the server
       res.ok:   // true
     }, res=>{
       // called only on network errors
       res.ok;    // false
       res.error; // the error
     });
```

### Fetching data via get()

```javascript
import Pajax from 'pajax';

Pajax.get(url, opts)
     .noCache() // See 'Configuring pajax/request instances'
     .fetch()
     .then(res=>{
       res.body: // the response from the server
       res.ok:   // true
     }, res=>{
       // called on network and status errors
       res.ok;    // false
       res.error; // the error
     });
```

### Sending data

```javascript
import Pajax from 'pajax';

Pajax.post(url, opts)
     .attach(body)
     .fetch()
     .then(res=>{
       res.body: // the response from the server
       res.ok:   // true
     }, res=>{
       // called on network and status errors
       res.ok;    // false
       res.error; // the error
     });
```

#### Parameters

- url (string) - the absolute or relative URL for this request
- opts (object) - set of key/value pairs to configure the ajax requests
- body (mixed) - the data to be sent

## Usage

### Fetching data

The basic fetch() is similar to the standard [Fetch](https://fetch.spec.whatwg.org/) specification

```javascript
import Pajax from 'pajax';

Pajax.fetch(url, opts)
     .then(res=>{
       res.body: // the response from the server
       res.ok:   // true
     }, res=>{
       // called only on network errors
       res.ok;    // false
       res.error; // the error
     });
```

The returned promise will not reject any error status codes.
Call Pajax.checkStatus() after fetch() to do so.

```javascript
Pajax.fetch(url, opts)
     .then(Pajax.checkStatus())
     .then(res=>{
       res.body: // the response from the server
       res.ok:   // true
     }, res=>{
       // called on network and status errors
       res.ok;    // false
       res.error; // the error
     });
```

### Create a pajax instance

Creating an instance allows to modify the default options off fetch() requests.

```javascript
import Pajax from 'pajax';
var pajax = new Pajax(opts);
pajax.fetch(...);
```

### Options

Most options are very similar to the [Fetch](https://fetch.spec.whatwg.org/) options.

- method (string) - `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`
- cache (string) - `default`, `no-cache` - `no-cache` will add a _={timestamp} query parameter to avoid caching
- queryParams (object) - set of key/value pairs that are added as query parameters to the url
- responseType (string) - the expected result type from the server. Request is always rejected, when the response body does not match the expected type.
- contentType (string) - the content type of the data sent to the server
- headers (object) - set of key/value pairs that are added to the request header
- progress (function) - callback for the the upload progress
- timeout (integer) - number of milliseconds to wait for a response
- credentials (string) - `same-origin`, `include` - Use `include` to send cookies in a CORS request.
- baseURL (string) - base for requests with relative urls

### Requests

A Request instance represents a request to a specific resource and can be provided as a fetch() argument.
The constructor has the same signature as the fetch method.

```javascript
var req = new Pajax.Request(url, opts);
pajax.fetch(req).then(...);
```

Request objects can also be created with the request() method on a pajax instance.
They inherit the default options of the pajax instance.

```javascript
var pajax = new Pajax(opts1);
// Merges opts1 with opts2 in request
var req = pajax.request(url, opts2);
pajax.fetch(req).then(...);
```

There are helper methods to create requests for common HTTP methods:
`get`, `post`, `put`, `patch`, `delete` and `head`.
checkStatus() is automatically called when using them.

```javascript
var req = pajax.post(url, opts);
pajax.fetch(req)
     .then(res=>{
       res.body: // the response from the server
       res.ok:   // true
     }, res=>{
       // called on network and status errors
       res.ok;    // false
       res.error; // the error
     });
```

Instead of calling `pajax.fetch(request)` you can call fetch directly on a request
without an argument.

```javascript
pajax.fetch(pajax.post(url, opts)).then(...);
// is the same as
pajax.post(url, opts).fetch().then(...);
```

### Configuring pajax/request instances

It is also possible to set options by chaining methods in a request before invoking fetch()

```javascript
pajax.put('/url')
     .header({'Accept-Language': 'en'}) // headers via object
     .header('Accept-Language', 'en')   // header via key-value
     .query({'foo': 'bar'})             // query parameters via object
     .query('foo', 'bar')               // query parameter via key-value
     .noCache()                         // Sets cache to `no-cache`
     .withCredentials()                 // Sets credentials to `include`
     .setResponseType('application/json')  
     .setContentType('application/json')
     .onProgress(req, event=>{
       ...
     })
     .setTimeout(5000)
     .attach({ foo: 'bar' })
     .fetch()
     .then(...);

```

Call the methods on the pajax instance to set the options for every request.

```javascript
var pajax = new Pajax()
            .header('Accept-Language', 'en')
            .noCache();

pajax.get(url).fetch().then(...);

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
     .fetch() // send request
     .then(res=>{
       // res.body: the response from the server
     });
```

Call the methods on the pajax instance to register transformation tasks for every request.

```javascript
var pajax = new Pajax().before(req=>{
       // do some stuff before a request is sent
     });

pajax.get(url).fetch().then(...);

```

## Modifying the Pajax/Request/Response Class

You can easily extend the Pajax, Request and Response Class to implement custom methods
or override the existing ones.

```javascript
// Our external authenticator
let auth = {token: 'g54gsfdgw34qj*9764w3'};

// Custom pajax class
class MyPajax extends Pajax {
  // All delete requests should be authenticated
  delete(...args) {
    return super.post(...args).authenticate();
  }

  // Use our custom Request class
  createRequest(...args) {
    return new MyRequest(this.auth, ...args);
  }

  // Use our custom Response class
  createResponse(...args) {
    return new MyResponse(...args);
  }
}

// Custom request class
MyPajax.Request = class extends Pajax.Request {
  constructor(auth, ...args) {
    super(...args);
    // Store the auth object on the request
    this.auth = auth;
  }
  // Adds the token to the request header
  authenticate() {
    return this.before(req=> {
      req.header('authorization', `Bearer ${req.auth.token}`);
    });
  }
}

// Custom response class
MyPajax.Reponse = class extends Pajax.Response {
  // Checks if we are authenticated
  get authenticated() {
    return this.headers['X-authentication-level'] > 0;
  }
}

var pajax = new MyPajax(auth, opts);

pajax.get(url)
     .authenticate() // Adds bearer token to request
     .fetch()
     .then(res => {
       // res.authenticated = true
     });

// bearer token is added by Pajax class
pajax.post(url)
     .fetch()
     .then(res => {
       // res.authenticated = true
     });     
```
There are also some predefined classes:

```javascript
// For jsons
var pajax = new Pajax.JSON(opts);
pajax.get('/url/to/json').fetch().then(res=>{
  res.body; /// js object
}, res=>{
  ...
});
```

```javascript
// For url encoded requests
var pajax = new Pajax.URLEncoded(opts);
pajax.post('/url', {foo:'bar'}).fetch().then(res=>{
  ...
}, res=>{
  ...
});
```
