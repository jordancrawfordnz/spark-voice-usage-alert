var Authentication = require('./authentication.js');
var UsageData = require('./usagedata.js');
var LastUsage = require('./lastusage.js');
var UsageAlert = require('./usagealert.js');
var TextAlert = require('./textalert.js');

var mobileNumber = process.env.SPARK_MOBILE_NUMBER;
var password = process.env.SPARK_PASSWORD;
var redisHost = process.env.REDIS_HOST;
var plivoAuthID = process.env.PLIVO_AUTH_ID;
var plivoAuthToken = process.env.PLIVO_AUTH_TOKEN;
var plivoDestinationNumber = process.env.PLIVO_DESTINATION_NUMBER;
var plivoSourceNumber = process.env.PLIVO_SOURCE_NUMBER;

var plivoOptions = {
  authID: plivoAuthID,
  authToken: plivoAuthToken,
  destinationNumber: plivoDestinationNumber,
  sourceNumber : plivoSourceNumber
};

var requiredArgs = [mobileNumber, password, redisHost, plivoAuthID, plivoAuthToken, plivoDestinationNumber, plivoSourceNumber];

for (var i = 0; i < requiredArgs.length; i++) {
  if (!requiredArgs[i]) {
    console.log('A required environment variable was not provided!');
    process.exit();
  }
}

var lastUsage = new LastUsage(redisHost);

console.log("Logging in to Spark for the number " + mobileNumber + ".");

var promise = Authentication.authenticate(mobileNumber, password).then(function(cookies) {
  return UsageData.getVoiceUsageData(cookies).then(function(voiceUsage) {
    console.log('Total used: ' + voiceUsage.totalUsed);
    console.log('Total cap: ' + voiceUsage.totalCap);
    console.log('Used ' + voiceUsage.percentUsed + '%');

    return UsageAlert.shouldSendUsageAlert(mobileNumber, voiceUsage, lastUsage).then(function(usageAlert) {
      if (usageAlert) {
        return TextAlert.send(plivoOptions, UsageAlert.getAlertMessage(mobileNumber, voiceUsage)).then(function() {
          console.log('Text sent.');
        });
      }
    }).then(function() {
      // Update the percentage in the data store.
      return lastUsage.setPercentageForMobile(mobileNumber, voiceUsage.percentUsed);
    });
  });
});

promise.then(function() {
  // Close the connection to the data store.
  lastUsage.quit();

  // TODO: Hit a service like deadmansnitch so I know when this check isn't happening.
}, function(error) {
  console.log('Hit an error while getting usage data from Spark.');
  console.log(error)

  // Close the connection to the data store.
  lastUsage.quit();
});