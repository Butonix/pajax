export function checkStatus() {
  return res=>{
    // SUCCESS: status between 200 and 299 or 304
    // Failure: status below 200 or beyond 299 excluding 304
    if(res.status < 200 || (res.status >= 300 && res.status!==304)) {
      // Unknown status code
      if(res.status<100 || res.status >=1000) {
        res.error = 'Invalid status code';
      } else {
        // Use statusText as error
        if(res.statusText) {
          res.error = res.statusText;
        } else {
          // Unknown error
          res.error = 'Request failed';
        }
      }
    }
    if(res.error) {
      return Promise.reject(res);
    } else {
      return Promise.resolve(res);
    }
  };
}
