# pajax

[![Build Status](http://img.shields.io/travis/n-fuse/pajax.svg?style=flat)](https://travis-ci.org/n-fuse/pajax)

pajax is a library for promise based XHR request.
It is very close to the [Fetch](https://fetch.spec.whatwg.org/) standard.

## Installation

### jspm
```sh
jspm install pajax
```

```javascript
import Pajax from 'pajax';
```

### npm/cjs
```
npm install pajax/pajax
```


```javascript
var Pajax = require('pajax');
```

### global

Download `dist/pajax.js` or install via bower
```
bower install pajax
```

```
<script src="/url/to/pajax.js"></script>
```

## Quick start

Pajax provides some methods to perform http requests.
Each method returns a promise which resolves in a response object.

```javascript
// GET
Pajax.get(url, opts)
     .then(res=>{
       res: // the response
     }, res=>{
       // called on status or network errors
       res.ok;    // false
       res.error; // the error
     });

// POST
Pajax.post(url, reqBody, opts)
     .then(res=>{
       res: // the response
     }, res=>{
       // called on network and status errors
       res.ok;    // false
       res.error; // the error
     });
```

#### requests methods

- get(url, opts)
- delete(url, opts)
- post(url, reqBody, opts)
- put(url, reqBody, opts)
- patch(url, reqBody, opts)

### The response object

You can call one of the following methods to extract the body from a response:

- text()
- json()
- blob()
- arrayBuffer()
- formData()

```javascript
Pajax.get(url, opts)
     .then(res=>res.json())
     .then(body=>{
       body; // parsed json as javascript object
     });
```

If you just want to `GET` some data an do not care about the response object, you can use the following methods:

- getText(url, opts)
- getJSON(url, opts)
- getBlob(url, opts)
- getArrayBuffer(url, opts)
- getFormData(url, opts)

```javascript
Pajax.getJSON(url, opts)
     .then(body=>{
       body; // parsed json as javascript object
     });
```

#### Parameters

- url (string) - the URL for this request
- opts (object) - set of key/value pairs to configure the ajax requests
- reqBody (mixed) - The body you want to add to your request

#### Options (opts)

The options are very similar to the [Fetch](https://fetch.spec.whatwg.org/) options.

- cache (string) - `default`, `no-cache` - `no-cache` will add a no-cache request header
- contentType (string) - the content type of the data sent to the server
- headers (object) - set of key/value pairs that are added to the request header
- progress (function) - callback for the the upload progress
- method (string) - `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`
- timeout (integer) - number of milliseconds to wait for a response
- credentials (string) - `same-origin`, `include` - Use `include` to send cookies in a CORS request.
- body (mixed) - The body you want to add to your request

### fetch()

The fetch() method is close to the standard [Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch) specification

```javascript
Pajax.fetch(url, opts)
     .then(res=>{
       res; // response object
       res.ok:   // true
     }, res=>{
       // called only on network errors
       res.error; // the error
     });
```

fetch() does not reject on HTTP status error codes (non 2xx).
Use the Pajax.checkStatus handler to do so.

```javascript
Pajax.fetch(url, opts)
     .then(Pajax.checkStatus)
     .then(res=>{
       res.ok:   // true
     }, res=>{
       // called on status or network errors
       res.error; // the error
     });
```

## Advanced usage

### Pajax instances

A Pajax instance allows you to store default options for requests.

```javascript
let pajax = new Pajax({headers: {'foo': 'bar'});

// does not include foo header
Pajax.fetch(...)

// includes foo header
pajax.fetch(...)
pajax.get(...)
pajax.getJSON(...)
pajax.post(...)
pajax.put(...)
...
```

### Requests

A Request instance represents a request to a specific resource and can be provided as a fetch() argument.
The constructor has the same signature as the fetch method.

```javascript
let req = new Pajax.Request(url, opts);
Pajax.fetch(req).then(...);
```

Request objects can also be created with the request() method on a pajax instance.
They inherit the default options of the pajax instance.

```javascript
let pajax = new Pajax({cache: 'no-cache'});
let req = pajax.request(url, {contentType: 'application/json'});

Pajax.fetch(req).then(...); // cache = no-cache, contentType = application/json
```

Instead of calling `Pajax.fetch(request)` you can call fetch directly on a request
without an argument.

```javascript
pajax.request(url, opts).fetch().then(res=>{ ... });
// is an alias for
let req = pajax.request(url, opts);
Pajax.fetch(req).then(res=>{ ... });
```

Same goes for the get(), getJSON(), post(), put() etc. methods

```javascript
pajax.request(url, opts).get().then(res=>{ ... })

pajax.request(url, opts).getJSON().then(body=>{ ... })

pajax.request(url, opts).post().then(res=>{ ... })
```

### Responses

A fetch(), get(), post(), etc. is resolved with a response object.
Response objects are described [here](https://developer.mozilla.org/en-US/docs/Web/API/Response).

In addition to `text()`, `json()`, `blob()` etc, the the pajax response object has an `auto()` method.
auto() will try to infer the body based on the content type of the response.
e.g. a json response will yield a js object, whereas text will yield a string.

```javascript
Pajax.get('/url/to/json').then(res=>res.auto()).then(body=>{
  body; // js object
});
```

### Operators on request/pajax instances

Operators will spawn a new request/pajax instance inheriting all the options of the source

```javascript

let pajax = new Pajax().JSON().noCache();

pajax.request('/url')
     .header('Authentication', token)
     .attach({foo:'bar'})
     .post(res=>{
        // Request to /url as POST with content-type/accept=application/json, no-cache, authentication headers and data attached as body
     });
```

Operators on pajax and request instances:
```
- accept(type)                      // Sets the accept header
- header(object)                    // headers via object
- header(string, string)            // header via key-value
- noCache()                         // Sets cache to `no-cache`
- withCredentials()                 // Sets credentials to `include`
- type(type)                        // Sets the content header
- onProgress(callback)              // Progress callback
- setTimeout(number)                // Sets the timeout
```
Operators only on request instances
```
- as(method)                        // Sets the http method
- attach(body)                      // Sets the body
```
Operators only on pajax instances
```
- JSON()                            // Sets the accept header and content-type to `application/json`
- URLEncoded()                      // Sets the content-type to `application/x-www-form-urlencoded`
- before(callback)                  // See transformation operators
- after(callback)                   // See transformation operators
```

## Extending pajax

Pajax provides some helpers for common tasks such as getting or posting data,
but can easily be extended.

Let's add a method for an authenticated POST in this example:

```javascript
class MyPajax extends Pajax {
  authPost(url, token, body) {
    return this.request(url)
               .attach(body)
               .header('Authorization', token)
               .post();
  }
}
...

import auth from 'auth';
let pajax = new MyPajax();
pajax.authPost(url, auth.token, {foo:1}).then(...);
```

## Customizing the Pajax classes

See the following code for a more advanced example

```javascript
// Our authenticator
let auth = {token: 'g54gsfdgw34qj*9764w3'};

// Custom request class
let MyRequest = class extends Pajax.Request {
  // Operator for adding the auth token to request header
  authenticate() {
    return this.header('authorization', `Bearer ${auth.token}`);
  }
}

// Custom response class
let MyResponse = class extends Pajax.Response {
  // Checks if we are authenticated
  get isAuthenticated() {
    return this.headers.get('X-authentication-level']) > 0;
  }
}

// Custom pajax class
class MyPajax extends Pajax {

  constructor(init) {
    this.super(init, {
      // Provide some class defaults
      Request: MyRequest,   // Set Request class
      Response: MyResponse, // Set Response class
      cache: 'no-cache'     // Disables caching by default
    });
  }

  // Add new method for authenticated GETs
  authget(...args) {
    return this.request(...args)
               .authenticate()
               .get();
  }
  // Override delete()
  // All DELETE requests should be authenticated
  delete(...args) {
    return this.request(...args)
               .authenticate()
               .delete();
  }
}



let pajax = new MyPajax();

// authorization token added by authget()
pajax.authget(url)
     .then(res => { ... });

// no authorization token added
pajax.get(url)
     .then(res => { ... });

// authorization token added manually
pajax.request(url)
     .authenticate() // Adds bearer token to request
     .post()
     .then(res => { ... });

// token added by delete() override
pajax.delete(url)
     .then(res => { ... });
```
### Transformation operators

Use the following operators to transform a request or response

```javascript
let pajax = new Pajax()
     .before(req=>{
       req; // request object
       // do some stuff before a request is sent
       return { // returned options will be utilized in the request
         cache: 'no-cache'
       };
     })
     .before(req=>{
       req; // request object
       // do more stuff before a request is sent
     })
     .after(res=>{
       res; // response object
       // do some stuff after a request
     })

// before/after handlers are called
pajax.get(url).then(...);

```
