# pajax

[![Build Status](http://img.shields.io/travis/n-fuse/pajax.svg?style=flat)](https://travis-ci.org/n-fuse/pajax)

pajax is a library for promise based XHR request.
It is very close to the [Fetch](https://fetch.spec.whatwg.org/) standard.

## Installation

### jspm
```sh
jspm install github:n-fuse/pajax
```

```javascript
import Pajax from 'pajax';
```

### npm/cjs
```
npm install n-fuse/pajax
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
<script src="/path/to/pajax.js"></script>
```

## Basic usage

### fetch()

The basic fetch() is similar to the standard [Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch) specification

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
Use Pajax.checkStatus to do so.

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

### Using the helpers

There are some built-in helpers for common HTTP methods.
Helper methods are rejecting on erroneous status codes, so no need for Pajax.checkStatus.

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

#### helper methods

- get(url, opts)
- delete(url, opts)
- post(url, reqBody, opts)
- put(url, reqBody, opts)
- patch(url, reqBody, opts)

### The Response body

To extract the body content from the response, you need to call one of the following methods.  All return a promise that is resolved with the response's body.

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

If you want to `get` some data an do not care about the response object, you can use the following methods:

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

- method (string) - `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`
- cache (string) - `default`, `no-cache` - `no-cache` will add a no-cache request header
- contentType (string) - the content type of the data sent to the server
- headers (object) - set of key/value pairs that are added to the request header
- progress (function) - callback for the the upload progress
- timeout (integer) - number of milliseconds to wait for a response
- credentials (string) - `same-origin`, `include` - Use `include` to send cookies in a CORS request.
- body (mixed) - The body you want to add to your request
- dataType (string) - `text`, `json`, `blob`, `arrayBuffer` - Forces the responses auto() method to resolve in the specified type


## Advanced usage

### Pajax instances

A Pajax instance allows you to store default options for requests.

```javascript
let pajax = new Pajax({cache: 'no-cache'});

// includes no-cache header
pajax.fetch(...)

// does not include no-cache header
Pajax.fetch(...)
```

All the helper-methods are also available on an instance

```javascript
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

Same goes for the get(), getJSON(), post(), put() etc. helpers

```javascript
pajax.request(url, opts).get().then(res=>{ ... })

pajax.request(url, opts).getJSON().then(body=>{ ... })

pajax.request(url, opts).post().then(res=>{ ... })
```

### Responses

A fetch() is resolved with a response object.
Response objects are described [here](https://developer.mozilla.org/en-US/docs/Web/API/Response).

In addition to `text()`, `json()`, `blob()` etc, the the pajax response object has an `auto()` method.
auto() will try to infer the body based on the content type of the response.
e.g. a json response will yield a js object, whereas text will yield a string.

```javascript
Pajax.fetch('/url/to/json').then(res=>res.auto()).then(body=>{
  body; // js object
});
```

### Operators on request/pajax instances

Operators will spawn a new request/pajax instance inheriting all the options of the source

```javascript
let req1 = pajax.request('/url');
let req2 = req1.accept('application/json');
let req3 = req2.header('Accept-Language', 'en');
let req4 = req3.header('Authentication', token);

// Request to /url with Accept, Accept-Language and Authentication headers
req4.get().then(res=>{

});

// In short
pajax.request('/url')
     .accept('application/json')
     .header('Accept-Language', 'en')
     .header('Authentication', token)
     .fetch()
     .get(res=>{

     });

```

See the following example for a full list of operators

```javascript
pajax.request('/url')                   // creates the request
     .is('POST')                        // Sets the http method
     .accept('application/json')        // Sets the accept header to `application/json`
     .header({'Accept-Language': 'en'}) // headers via object
     .header('Accept-Language', 'en')   // header via key-value
     .noCache()                         // Sets cache to `no-cache`
     .withCredentials()                 // Sets credentials to `include`
     .type('application/json')          // Sets the content-type to `application/json`
     .onProgress(req, event=>{          // Progress callback
       ...
     })
     .setTimeout(5000)                  // Sets the timeout
     .attach({ foo: 'bar' })            // Set the body
     .checkStatus()                     // Rejects on status code errors
     .fetch()                           // Send the request
     .then(res=>{                       
       res; // Response object
     });

```

The operators are also available on pajax instances.

```javascript
let pajax = new Pajax()
            .header('Accept-Language', 'en')
            .noCache();

// Includes accept-language and no-cache header
pajax.fetch(url).then(...);
```

## Extending pajax

Pajax provides some helpers for common tasks such as getting or posting data,
but can easily be extended.

Let's add a method for an authenticated POST in this example:

```javascript
class MyPajax extends Pajax {
  authPost(url, body, token) {
    return this.request(url)
               .attach(body)
               .header('Authorization', token)
               .post();
  }
}
...

import auth from 'auth';
let pajax = new MyPajax();
pajax.authPost(url, {foo:1}, auth.token).then(...);
```

## Customizing the Pajax classes

See the following code for a more advanced example how to customize Pajax

```javascript
// Our external authenticator
let auth = {token: 'g54gsfdgw34qj*9764w3'};

// Custom pajax class
class MyPajax extends Pajax {
  // Add new method for authenticated GETs
  aget(...args) {
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

// Custom request class
MyPajax.Request = class extends Pajax.Request {
  // Operator for adding the auth token to request header
  authenticate() {
    return this.header('authorization', `Bearer ${auth.token}`);
  }
}

// Custom response class
MyPajax.Response = class extends Pajax.Response {
  // Checks if we are authenticated
  get isAuthenticated() {
    return this.headers.get('X-authentication-level']) > 0;
  }
}

let pajax = new MyPajax();

// token added by getAuth()
pajax.aget(url)
     .then(res => { ... });

// no token added
pajax.get(url)
     .then(res => { ... });

// token added manually
pajax.request()
     .authenticate() // Adds bearer token to request
     .post()
     .then(res => { ... });

// token added by delete() override
pajax.delete(url)
     .then(res => { ... });
```
### Request/Response transformation operators

To transform a request or response use the following operators:

```javascript
pajax.request(url)
     .before(req=>{
       // do some stuff before a request is sent
       return { // returned options will be utilized in the request
         cache: 'no-cache'
       };
     })
     .before(req=>{
       // do more stuff before a request is sent
     })
     .after(res=>{
       // do some stuff after a request
     })
     .afterSuccess(res=>{
       // do some stuff after a successful request
     })
     .afterFailure(res=>{
       // do some stuff after a failed request
     })
     .fetch() // send request
     .then(res=>{
       // res.body: the response from the server
     });
```

Call the operators on the pajax instance to register transformation tasks for every request.

```javascript
let pajax = new Pajax().before(req=>{
       // do some stuff before a request is sent
     });

pajax.get(url).then(...);

```
