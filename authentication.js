var AUTHENTICATION_COOKIE_NAME = 'GAM-PBBXVR-CEBQ';
var AUTHENTICATION_URL = 'https://www.spark.co.nz/rest/v1/authenticate';

var promise = require('promise');
var request = promise.denodeify(require('request'));

var Authentication = {};

// Returns a promise with the authentication cookie.
Authentication.authenticate = function(username, password) {
  return Authentication._makeAuthenticationRequest(username, password).then(function(response) {
    if (response.statusCode != 200) {
      return promise.reject('Non 200 status code.');
    }

    var authenticationCookie = Authentication._getAuthenticationCookie(response.headers);
    if (authenticationCookie) {
      return promise.resolve(authenticationCookie);
    } else {
      return promise.reject('No authentication cookie set.');
    }
  })
};

// Returns a promise with the authentication result.
Authentication._makeAuthenticationRequest = function(username, password) {
  return request({
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

Authentication._getAuthenticationCookie = function(authenticationHeaders) {
  var setCookies = authenticationHeaders['set-cookie'];
  
  if (setCookies) {
    for (var i = 0; i < setCookies.length; i++) {
      var setCookie = setCookies[i];
      if (setCookie.indexOf(AUTHENTICATION_COOKIE_NAME) !== -1) {
        return { AUTHENTICATION_COOKIE_NAME: setCookie.split('=')[1].split(';')[0] };
      }
    }
  }

  return null;
};

module.exports = Authentication;