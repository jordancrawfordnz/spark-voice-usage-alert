var AUTHENTICATION_COOKIE_NAME = 'GAM-PBBXVR-CEBQ';
var AUTHENTICATION_URL = 'https://www.spark.co.nz/rest/v1/authenticate';

var Promise = require('promise');
var request = require('request');
var requestWithPromise = Promise.denodeify(request);

var Authentication = {};

// Returns a Promise with the authentication cookie.
Authentication.authenticate = function(username, password) {
  return Authentication._makeAuthenticationRequest(username, password).then(function(response) {
    if (response.statusCode != 200) {
      return Promise.reject('Non 200 status code.');
    }

    var authenticationCookies = Authentication._getAuthenticationCookies(response.headers);

    if (authenticationCookies) {
      return Promise.resolve(authenticationCookies);
    } else {
      return Promise.reject('No authentication cookies set.');
    }
  })
};

// Returns a Promise with the authentication result.
Authentication._makeAuthenticationRequest = function(username, password) {
  return requestWithPromise({
    method: 'POST',
    uri: AUTHENTICATION_URL,
    form: {
      username: username,
      password: password,
      rememberMe: false
    },
    headers: {
      'Accept': 'application/json'
    }
  });
};

Authentication._getAuthenticationCookies = function(authenticationHeaders) {
  var setCookies = authenticationHeaders['set-cookie'];
  
  if (setCookies) {
    for (var i = 0; i < setCookies.length; i++) {
      var setCookie = setCookies[i];
      if (setCookie.indexOf(AUTHENTICATION_COOKIE_NAME) !== -1) {
        var cookieValue = setCookie.split('=')[1].split(';')[0];

        return [AUTHENTICATION_COOKIE_NAME + "=" + cookieValue];
      }
    }
  }

  return null;
};

module.exports = Authentication;