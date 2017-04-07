var authentication = require('./authentication.js');
var datausage = require('./datausage.js');

// request = require('request');
// request.defaults({jar: true})
// var cookieJar = request.jar();

var username = process.env.SPARK_USERNAME;
var password = process.env.SPARK_PASSWORD;

var requiredArgs = [username, password];

for (var i = 0; i < requiredArgs.length; i++) {
  if (!requiredArgs[i]) {
    console.log('A required environment variable was not provided!');
    process.exit();
  }
}

console.log("Logging in to Spark with the username " + username + ".");

var authenticationRequest = authentication.authenticate(username, password).then(function(cookies) {
  console.log('cookies');
  console.log(cookies)

  datausage.getDataUsage(cookies);
});

authenticationRequest.catch(function(error) {
  console.log('Hit an error while authenticating with Spark. Throw an error!');
  console.log(error)
});
