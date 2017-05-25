/**
 * Mailgun service implementation
 * 
 * @author Invatechs Software https://www.invatechs.com
 */

var util = require('util');
var SenderPrototype = require('./sender-prototype.js');

var options = {};

/**
 * Injects sender-js global options to Mailgun module
 * 
 * @param {object} mgOptions Mailgun options in common sender-js module format
 * @returns {undefined}
 */
function setOptions(mgOptions) {
  options['mailgun-js'] = mgOptions['mailgun-js'];
}

/**
 * Mailgun prototype class
 * 
 * @param {Object} mgOptions Options object needs to use Mailgun
 * @param {boolean} setLocalOptions Flag to save option in local object
 * @returns {undefined}
 */
function ServiceMailgun(mgOptions, setLocalOptions) {
  if(setLocalOptions) {
    setOptions(mgOptions);
  }
  
  SenderPrototype.call(this);

  if(mgOptions && !setLocalOptions) {
    this.setCredentials(mgOptions);
  } else if(options.hasOwnProperty('mailgun-js')) {
    this.setCredentials();
  }
  
  this.mailgun = undefined;
}
util.inherits(ServiceMailgun, SenderPrototype);

/**
 * 
 * @returns {Object} Maigun credentials object
 */
ServiceMailgun.prototype.getCredentials = function() {
  return this.options;
};

/**
 * Sets Mailgun options
 * 
 * @param {Object|String} [options|apiKey] Mailgun credentials or API key for Mailgun
 * @param {String} [domain] Mailgun domain
 * @returns {undefined}
 * @throws {Error}
 */
ServiceMailgun.prototype.setCredentials = function() {
  var firstArg = arguments[0];
  
  if(typeof firstArg === 'object') { // Options sent as an object
    this.options = {
      apiKey: firstArg.apiKey,
      domain: firstArg.domain
    };
  } else if(arguments.length > 1) { // API key and domain sent as separate params
    this.options = {
      apiKey: firstArg,
      domain: arguments[1]  // Domain is passed as second argument
    };
  } else if(options.hasOwnProperty('mailgun-js')) {  // If there is no arguments, we'll fill mailgun options with general options by default
    this.options = {
      apiKey: options['mailgun-js'].apiKey,
      domain: options['mailgun-js'].domain
    };
  } else {
    throw new Error('@setCredentials Wrong Mailgun options');
  }
};

/**
 * Creates Mailgun object
 * 
 * @param {boolean} makeNew Flag to make new Mailgun object
 * @returns {undefined}
 */
ServiceMailgun.prototype.initialize = function (makeNew) {
  // Creates new Mailgun object if there is no one or if the necessary flag is set
  if(!this.mailgun || makeNew) {
    this.mailgun = require('mailgun-js')(this.options);
  }
};

/**
 * Sends mail to the specfied mail
 * 
 * @param {Object} messageOptions Message options which is used to send mail
 * @param {Function} callback Callback function
 * @returns {undefined}
 */
ServiceMailgun.prototype.send = function(messageOptions, callback) {
  var self = this;

  SenderPrototype.prototype.send.call(this, messageOptions, callback);

  this.initialize();
  var mailOptions = {
    from: this.from,
    to: this.to,
    subject: this.subject
  };
  
  if(this.attachment.data) {
    mailOptions.attachment = new this.mailgun.Attachment(this.attachment);
  }
  
  if(this.useHtml) { // Send mail as a plain text or HTML
    mailOptions.html = this.text;
  } else {
    mailOptions.text = this.text;
  }

  this.mailgun.messages().send(mailOptions, function(error, body) {
    if(error) {
      callback(error, 'Mail send error: ' + error.toString() + '; To: ' + self.to + ';');
    } else {
      callback(error, 'Message sent: ' + body.message);
    }
  });
};

module.exports = ServiceMailgun;