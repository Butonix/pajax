export default function async(generator){
  let iterator = generator.apply(this, arguments);

  function handle(result){
    // result => { done: [Boolean], value: [Object] }
    if (result.done)  {
      return Promise.resolve(result.value);
    }
    return Promise.resolve(result.value).then(res=>{
      return handle(iterator.next(res));
    }).catch(err=>{
      return handle(iterator.throw(err));
    });
  }

  try {
    let result = iterator.next();
    let finalPromise = handle(result);
    return Promise.resolve(finalPromise);
  } catch (ex) {
    return Promise.reject(ex);
  }
}
