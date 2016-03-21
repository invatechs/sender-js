/**
 * Telegram bot service implementation
 * 
 * @author Invatechs Software https://www.invatechs.com
 */

require('es6-shim');
var Message = require('telegram-api/types/Message');
util = require('util');
var SenderPrototype = require('./sender-prototype.js');

var options = {};

/**
 * Injects sender-js global options to Telegram module
 * 
 * @param {object} tgOptions Telegram options in common sender-js module format
 * @returns {undefined}
 */
function setOptions(tgOptions) {
  options['telegram'] = tgOptions['telegram'];
};

/**
 * Telegram prototype class
 * 
 * @param {Object} tgOptions Telegram options
 * @param {boolean} setLocalOptions Flag to save option in local object
 * @returns {undefined}
 */
function ServiceTelegram(tgOptions, setLocalOptions) {
  if(setLocalOptions) {
    setOptions(tgOptions);
  }
  
  SenderPrototype.call(this);
  if(tgOptions && tgOptions.hasOwnProperty('telegram')) {
    if(tgOptions.telegram.hasOwnProperty('token')) {
      this.setToken(tgOptions.telegram.token);
    }
    
    if(tgOptions.telegram.hasOwnProperty('chatId')) {
      this.setChatId(tgOptions.telegram.chatId);
    }
  } else if(options.hasOwnProperty('telegram')) {
    this.setToken();
    this.setChatId();
  }
  
  this.telegram = undefined;
  this.telMessage = undefined;
  
  this.initialize();
}

util.inherits(ServiceTelegram, SenderPrototype);

/**
 * Returns current Telegram token
 * 
 * @returns {String}
 */
ServiceTelegram.prototype.getToken = function() {
  return this.token;
};

/**
 * Sets Telegram token
 * 
 * @param {String} token Telegram token. Used to authorize
 * @returns {undefined}
 * @throws {Error}
 */
ServiceTelegram.prototype.setToken = function(token) {
  if(token) {
    this.token = token.toString();
  } else {  // Use the default token
    this.token = options.telegram.token;
  }
  
  if(this.token === "") {
    throw new Error("@setToken: Token not specified");
  }
};

/**
 * Returns current Telegram chat ID
 * 
 * @returns {String}
 */
ServiceTelegram.prototype.getChatId = function() {
  return this.chatId;
};

/**
 * Sets Telegram chat ID
 * 
 * @param {String} chatId Telegram chat ID
 * @returns {undefined}
 */
ServiceTelegram.prototype.setChatId = function(chatId) {
  if(chatId) {
    this.chatId = chatId.toString();
  } else if(options.telegram.chatId) {  // Use the default chat ID
    this.chatId = options.telegram.chatId;
  }
};

/**
 * Creates Telegram object to send messages
 * 
 * @param {boolean} makeNew Flag to make new Telegram object
 * @returns {undefined}
 */
ServiceTelegram.prototype.initialize = function (makeNew) {
  var self = this;

  // Creates new Telegram object if there is no one or if the necessary flag is set
  if(!this.telegram || makeNew) {
    var Telegram = require('telegram-api');
    this.telegram = new Telegram({token: this.token});
    this.telegram.start();
    
    if(!this.chatId) {
      this.telegram.command('start', function(message) {
        self.setChatId(message.chat.id);
      });
    }

    this.telMessage = new Message();
  }
};

/**
 * Sends message to the specfied user
 * 
 * @param {Object} messageOptions Message options which is used to send message
 * @param {Function} callback Callback function
 * @returns {undefined}
 */
ServiceTelegram.prototype.send = function(messageOptions, callback) {
  var self = this;

  SenderPrototype.prototype.send.call(this, messageOptions, callback);
  // If Telegram property is set then we use it to send message
  if(messageOptions.hasOwnProperty('telegram')) {
    if(messageOptions.telegram.hasOwnProperty('text')) {
      this.setText(messageOptions.telegram.text);
    }
  }

  this.initialize();

  if(this.chatId) {
    this.telMessage.text(this.text).to(this.chatId);
    this.telegram.send(this.telMessage);
    callback("", "Message successfully sent");
  } else {
    var interval = setInterval(function() {
      if(self.chatId) {
        self.telMessage.text(self.text).to(self.chatId);
        self.telegram.send(self.telMessage);
        callback("", "Message successfully sent");
        clearInterval(interval);
      }
    }, 500);
  }
};

module.exports = ServiceTelegram;