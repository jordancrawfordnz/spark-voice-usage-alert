var LastUsage = require('./lastusage.js');

var SEND_ALERT_POINTS = [80, 90, 100, 110];

var UsageAlert = {};

UsageAlert._closestAlertPoint = function(percentUsed) {
  var currentPoint;

  for (var i = 0; i < SEND_ALERT_POINTS.length; i++) {
    if (percentUsed >= SEND_ALERT_POINTS[i]) {
      currentPoint = SEND_ALERT_POINTS[i];
    }
  }

  return currentPoint;
};

UsageAlert.shouldSendUsageAlert = function(mobileNumber, voiceUsage, lastUsage) {
  // Get the last usage.
  return lastUsage.percentageForMobile(mobileNumber).then(function(lastUsageForMobile) {
    // Find the alert points.
    var currentValueClosestAlert = UsageAlert._closestAlertPoint(voiceUsage.percentUsed);
    var previousValueClosestAlert = UsageAlert._closestAlertPoint(lastUsageForMobile);

    var toReturn;
    if (currentValueClosestAlert && currentValueClosestAlert !== previousValueClosestAlert) {
      toReturn = currentValueClosestAlert;
    }

    return Promise.resolve(toReturn);
  });
};

module.exports = UsageAlert;