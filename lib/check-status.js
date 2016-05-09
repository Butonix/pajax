export function checkStatus(res) {
  if(!res.error && !res.ok) {
    res.error = res.statusText || 'Request failed';
  }
  return res.error ? Promise.reject(res) : Promise.resolve(res);
}
