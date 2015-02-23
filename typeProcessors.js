// Type specific result processors
export default {
  json: function(xhr, result) {
    try {
      // IE11 and old(new?) Safari does not support responseType = json
      // so try parsing, when json was expected and string is delivered
      // Note: response can be empty string in Cordova
      if (typeof result.response==='string' && result.response && result.response.length !== 0) {
        result.response = JSON.parse(result.response);
      }
      // Throw error if response has no json body and status is not 204/205 (no content/reset content)
      if(xhr.status!==204 && xhr.status!==205 && (result.response===null || typeof result.response!=='object')) {
        throw Ajax.prototype.ERROR_INVALID_JSON;
      }
    } catch(ex) {
      result.error = Ajax.prototype.ERROR_INVALID_JSON;
      result.errorText = 'Invalid JSON';
    }
  }
};
