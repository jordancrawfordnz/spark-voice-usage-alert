var Authentication = require('./authentication.js');
var UsageData = require('./usagedata.js');
var LastUsage = require('./lastusage.js');
var UsageAlert = require('./usagealert.js');
var Promise = require('promise');

var mobileNumber = process.env.SPARK_MOBILE_NUMBER;
var password = process.env.SPARK_PASSWORD;
var redisHost = process.env.REDIS_HOST;

var requiredArgs = [mobileNumber, password, redisHost];

for (var i = 0; i < requiredArgs.length; i++) {
  if (!requiredArgs[i]) {
    console.log('A required environment variable was not provided!');
    process.exit();
  }
}

var lastUsage = new LastUsage(redisHost);

console.log("Logging in to Spark for the number " + mobileNumber + ".");

var getUsageDataPromise = Authentication.authenticate(mobileNumber, password).then(function(cookies) {
  return UsageData.getVoiceUsageData(cookies).then(function(voiceUsage) {
    console.log('Total used: ' + voiceUsage.totalUsed);
    console.log('Total cap: ' + voiceUsage.totalCap);
    console.log('Used ' + voiceUsage.percentUsed + '%');

    return UsageAlert.shouldSendUsageAlert(mobileNumber, voiceUsage, lastUsage).then(function(usageAlert) {
      if (usageAlert) {
        console.log('Will send alert for ' + usageAlert + '%.');
        // TODO: Send an alert.
      }
    }).then(function() {
      // Update the percentage in the data store.
      return lastUsage.setPercentageForMobile(mobileNumber, voiceUsage.percentUsed);
    });
  });
});

getUsageDataPromise.then(function() {
  // Close the connection to the data store.
  lastUsage.quit();
}, function(error) {
  console.log('Hit an error while getting usage data from Spark.');
  console.log(error)

  // Close the connection to the data store.
  lastUsage.quit();
});