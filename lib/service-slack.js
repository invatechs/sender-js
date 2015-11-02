util = require('util');
var SenderPrototype = require('./sender-prototype.js');

var options = {};

var slack = {}; // Local module Slack object

/**
 * Injects sender-js global options to Slack module
 * 
 * @param {object} slOptions Slack options in common sender-js module format
 * @returns {undefined}
 */
function setOptions(slOptions) {
  options['slack'] = slOptions['slack'];
};

/**
 * Slack prototype class
 * 
 * @param {Object} slOptions Slack options
 * @param {boolean} setLocalOptions Flag to save option in local object
 * @returns {undefined}
 */
function ServiceSlack(slOptions, setLocalOptions) {
  if(setLocalOptions) {
    setOptions(slOptions);
  }
  
  SenderPrototype.call(this);
  
  slack = {};
  
  if(slOptions) {
    this.setToken(slOptions.token);
  } else if(options.hasOwnProperty('slack')) {
    this.setToken();
  }
  
  this.recipient = undefined;
  this.opened = false;
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
  var self = this;

  // Creates new Slack object if there is no one or if the necessary flag is set
  if(!Object.keys(slack).length || makeNew) {
    var Slack = require('slack-client');
    slack = new Slack(this.token, true, true);
    
    slack.on('open', function(){
      self.opened = true;
    });

    slack.login();
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
  // If toSlack property is set then we use it to send message
  if(messageOptions.hasOwnProperty('toSlack')) {
    this.setTo(messageOptions.toSlack);
  }

  this.initialize();

  var interval = setInterval(function() {
    if(self.opened) {
      self.recipient = slack.getChannelGroupOrDMByName(self.to);
      self.recipient.send(self.text);
      callback("", "Message successfully sent");
      clearInterval(interval);
    }
  }, 500);

  slack.disconnect();
};

module.exports = ServiceSlack;