var DATA_USAGE_URL = 'https://www.spark.co.nz/rest/v1/myspark/secure/mobile/datausage';
var VOICE_USAGE_TYPE = 'Voice';

var promise = require('promise');
var request = require('request');

request.defaults({jar: true})
var cookieJar = request.jar();

var requestWithPromise = promise.denodeify(request);

var UsageData = {};

UsageData.getVoiceUsageData = function(authCookies) {
  return UsageData.getUsageData(authCookies).then(function(usageData) {
    var usageMeters = usageData.usageMeters;

    if (!usageMeters) {
      return promise.reject('No usage meter information.');
    }

    var result = {
      totalUsed: 0,
      totalCap: 0
    };

    var voiceMeters = [];
    usageMeters.forEach(function(meter) {
      if (meter.usageType === VOICE_USAGE_TYPE) {
        result.totalUsed += meter.dataUsed;
        result.totalCap += meter.dataCap;
      }
    });

    result.percentUsed = Math.round(100 * result.totalUsed / Math.max(result.totalCap, 1));

    return promise.resolve(result);
  });
};

UsageData.getUsageData = function(authCookies) {
  return UsageData._makeUsageDataRequest(authCookies).then(function(response) {
    return JSON.parse(response.body);
  });
};

UsageData._makeUsageDataRequest = function(authCookies) {
  return requestWithPromise({
    method: 'POST',
    uri: DATA_USAGE_URL,
    headers: {
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      'Cookie': UsageData._getCookie(authCookies)
    }
  });
};

UsageData._getCookie = function(authCookies) {
  var cookieString = "";

  authCookies.forEach(function(value) {
    cookieString += value + ";";
  });

  return cookieString;
};

module.exports = UsageData;