util = require('util');
var SenderPrototype = require('./sender-prototype.js');

var options = {};

/**
 * Slack prototype class
 * 
 * @param {Object} slOptions Slack options
 * @returns {undefined}
 */
function ServiceSlack(slOptions) {
  SenderPrototype.call(this);
  
  if(slOptions) {
    this.setToken(slOptions.token);
  } else if(options.hasOwnProperty('slack')) {
    this.setToken();
  }
  
  this.slack = undefined;
}

util.inherits(ServiceSlack, SenderPrototype);

/**
 * Returns current Slack token
 * 
 * @returns {String}
 */
ServiceSlack.prototype.getToken = function() {
  return this.token;
};

/**
 * Sets Slack token
 * 
 * @param {String} token Slack token. Used to authorize
 * @returns {undefined}
 * @throws {Error}
 */
ServiceSlack.prototype.setToken = function(token) {
  if(token) {
    this.token = token.toString();
  } else {  // Use the default token
    this.token = options.slack.token;
  }
  
  if(this.token === "") {
    throw new Error("@setToken: Token not specified");
  }
};

/**
 * Creates Slack object to send messages
 * 
 * @param {boolean} makeNew Flag to make new Slack object
 * @returns {undefined}
 */
ServiceSlack.prototype.initialize = function (makeNew) {
  // Creates new Slack object if there is no one or if the necessary flag is set
  if(!this.slack || makeNew) {
    var Slack = require('slack-client');
    this.slack = new Slack(this.token, true, true);
  }
};

/**
 * Sends message to the specfied user (direct message), group or channel
 * 
 * @param {Object} messageOptions Message options which is used to send message
 * @param {Function} callback Callback function
 * @returns {undefined}
 */
ServiceSlack.prototype.send = function(messageOptions, callback) {
  var self = this;
  
  SenderPrototype.prototype.send.call(this, messageOptions, callback);
  
  this.initialize();
  this.slack.on('open', function(){
    var recipient = self.slack.getChannelGroupOrDMByName(self.to);
    recipient.send(self.text);
    callback("", "Message successfully sent");
  });
  this.slack.login();
  this.slack.disconnect();
};

module.exports.getService = ServiceSlack;

/**
 * Injects sender-js global options to Slack module
 * 
 * @param {object} slOptions Slack options in common sender-js module format
 * @returns {undefined}
 */
module.exports.setOptions = function(slOptions) {
  options = slOptions;
};