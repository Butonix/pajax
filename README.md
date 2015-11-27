#pajax

[![Build Status](http://img.shields.io/travis/n-fuse/pajax.svg?style=flat)](https://travis-ci.org/n-fuse/pajax)

pajax is a library for promise based xhr request

## Installation
```
jspm install github:n-fuse/pajax
```

## Usage

### Create an instance

```javascript
import Pajax from 'pajax';
var pajax = new Pajax(defaultOpts);
```

There are built-in methods for `get, post, put, patch, del, head`

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
     .attach(data)
     .send()
     .then(res=>{
       // res.body: the response from the server
     });
```

#### Parameters

- url (string) - the absolute or relative URL for this request
- opts (object) - set of key/value pairs to configure this ajax request
- data (mixed) - the data to be sent

#### Options (opts):

- noCache (boolean) - Forces GET requests not to be cached by the browser, by adding a _={timestamp} parameter when set to true
- queryParams (object) - set of key/value pairs that are added as parameters to the url
- responseType (string) - the expected result type from the server. Request is always rejected, when the result does not match the expected type.
- contentType (string) - the content type of the data sent to the server
- headers (object)- set of key/value pairs that are added to the request header
- progress (function) - callback for the the upload progress
- timeout (integer) - number of milliseconds to wait for a response
- withCredentials (boolean) - en/disables withCredentials


It is also possible to set the options via chaining in each request

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
       // res.body: the response from the server
     }, res=>{
       // error
     });
 ```

### Pipelets

Piplets are transformation tasks for requests.
They can be called in a before(), after() or afterSuccess() hook.

```javascript
pajax.get(url)
     .before(req=>{
       // do some stuff before a request is sent
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
     .send() // send request
     .then(res=>{
       // res.body: the response from the server
     });
```

## The Pajax Class

The Pajax class serves as a kind of factory for requests.
e.g. the implementation of the default get-method creates a chainable requests.

``` javascript

class Pajax {
  get(url, opts) {
    return this.request(url, opts, 'GET');
  }

  // Creates a request object
  request(url, opts, method) {
    ...
    return new PajaxRequest(url, opts, method, this);
  }
  ...
}

```

// You can implement custom methods or overwrite the existing ones.
```javascript

class AuthNPajax extends Pajax {

  constructor(authN, opts) {
    super(opts);
    this.authN = authN;
  }

  getWithFlavor(url, flavor, opts) {
    return this.get(url, opts)
               .afterSuccess(this.addTextToResponse(' with ' + flavor));
  }

  // Adds authentication token to every request
  request(url, opts, method) {
    return super.request(url, opts, method)
                .before(this.addToken())
  }

  addToken() {
    return req=>{
      req.header('Authorization', 'Bearer ' + this.authN.accessToken);
    }
  }

  addTextToResponse(text) {
    return res=>{
      res.body = text + res.body;
    }
  }
}

var pajax = new AuthNPajax(authN);
pajax.getWithFlavor('/text/1', 'honey').send().then(res=>{
  ...
}, res=>{
  ...
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

### License

[MIT license](LICENSE.txt)
