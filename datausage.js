var DATA_USAGE_URL = 'https://www.spark.co.nz/rest/v1/myspark/secure/mobile/datausage';

var promise = require('promise');
var request = require('request');

request.defaults({jar: true})
var cookieJar = request.jar();

var requestWithPromise = promise.denodeify(request);

var DataUsage = {};

DataUsage.getDataUsage = function(authCookies) {
  DataUsage._makeDataUsageRequest(authCookies).then(function(response) {
    console.log(response.body)
  });
};

DataUsage._makeDataUsageRequest = function(authCookies) {
  console.log(authCookies)
  authCookies.forEach(function(cookie) {
    request.cookie(cookie);
  });

  return requestWithPromise({
    method: 'POST',
    uri: DATA_USAGE_URL,
    headers: {
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    }
  });
};

module.exports = DataUsage;