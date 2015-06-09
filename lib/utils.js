export var clone = function(obj) {
  var clone = {};
  if (obj) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        clone[key] = obj[key];
      }
    }
  }
  return clone;
}

export var merge = function(original, updates, override=true) {
  var result = clone(original);
  for (var prop in updates) {
    if(updates.hasOwnProperty(prop) && (!result.hasOwnProperty(prop) || override)) {
      result[prop] = updates[prop];
    }
  }
  return result;
};

export var defaults = function(original, updates) {
  return merge(original, updates, false);
};
