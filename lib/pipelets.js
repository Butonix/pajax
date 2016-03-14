export function checkStatus() {
  return res=>{
    if(!res.error && !res.ok) {
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
