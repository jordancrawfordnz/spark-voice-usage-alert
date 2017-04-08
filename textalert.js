var plivo = require('plivo');
var Promise = require('promise');

var TextAlert = {};

TextAlert.send = function(plivoOptions, text) {
  return new Promise(function(resolve, reject) {
    var plivoSession = plivo.RestAPI({
      authId: plivoOptions.authID,
      authToken: plivoOptions.authToken
    });

    var params = {
      'src': plivoOptions.sourceNumber,
      'dst' : plivoOptions.destinationNumber,
      'text' : text
    };

    plivoSession.send_message(params, function (status, response) {
      if (status === 202) {
        resolve();
      } else {
        reject(response);
      }
    });
  });
};

module.exports = TextAlert;