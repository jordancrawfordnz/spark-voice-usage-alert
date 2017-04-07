var redis = require('redis');
var Promise = require('promise');

var LastUsage = function(redisHost) {
  this.redisClient = redis.createClient({
    host: redisHost
  });
};

LastUsage.prototype.percentageForMobile = function(mobileNumber) {
  return new Promise(function(resolve, reject) {
    this.redisClient.get(mobileNumber, function(error, result) {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  }.bind(this));
};

LastUsage.prototype.setPercentageForMobile = function(mobileNumber, newValue) {
  return new Promise(function(resolve, reject) {
    this.redisClient.set(mobileNumber, newValue, function(error, result) {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  }.bind(this));
};

LastUsage.prototype.quit = function() {
  if (this.redisClient) {
    this.redisClient.quit();
    this.redisClient = null;
  }
};

module.exports = LastUsage;