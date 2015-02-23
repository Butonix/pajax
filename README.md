# pajax

pajax is a library for promise based xhr request


### Installation
```
jspm install npm:pajax
```

### Usage

```javascript
import Pajax from 'pajax';
var pajax = new PAjax(dataType, opts);
```

#### Constuctor parameters

- dataType  (string, optional) - Predefined options for specified datatype (urlencoded, json, json-ld)
- opts (object, optional) - Default request options as set of key/value pairs.  

#### Requests

```javascript
pajax.get(url, opts).then(...);
pajax.head(url, opts).then(...);
pajax.post(url, data, opts).then(...);
pajax.put(url, data, opts).then(...);
pajax.patch(url, data, opts).then(...);
pajax.del(url, data, opts).then(...);
```
#### Parameters

- url (string) - the absolute or relative URL for this request
- data (mixed) - the data to be sent
- opts (object) - set of key/value pairs t configure this ajax request

#### Options (opts):

- cache (boolean) - Forces GET requests not to be cached by the browser, by adding a _={timestamp} parameter when set to false
- queryParams (object) - set of key/value pairs that are added as parameters to the url
- responseType (string) - the expected result type from the server. Request is always rejected, when the result is not the correct type.
- contentType (string) - the content type of the data sent to the server
- headers (object)- set of key/value pairs that are added to the request header
- meta (boolean) - the result is an object with additional information about the request including the response body when set to true
- responseHeaders (boolean) - adds the response headers to the meta information when set to true
- progress: (function) - callback for the the upload progress
- timeout: (integer) - number of milliseconds to wait for a response

### Handlers

TODO

### License

[MIT license](LICENSE.txt)
