util = require('util');
var SenderPrototype = require('./sender-prototype.js');

var options = {};

/**
 * Nodemailer prototype class
 * 
 * @param {Object} nmOptions Nodemailer options
 * @returns {undefined}
 */
function ServiceNodemailer(nmOptions) {
  SenderPrototype.call(this);

  for(var mailService in nmOptions) {}

  if(mailService || options.hasOwnProperty('nodemailer')) {
    this.setMailService(mailService);           // Service which is used to send mail (Gmail, Yahoo, etc.)
    if(mailService) {
      this.setAuthData(nmOptions[mailService].username, nmOptions[mailService].password);     // Auth data for selected service
    } else {  // Trying to initialize with global options
      this.setAuthData();
    }
  }
  
  this.transporter = undefined;                   // SMTP transporter for sending mails
}
util.inherits(ServiceNodemailer, SenderPrototype);

/**
 * Returns current mail service
 * 
 * @returns {String}
 */
ServiceNodemailer.prototype.getMailService = function () {
  return this.mailService;
};

/**
 * Sets the mail service to send mails
 * 
 * @param {String} mailService Mail service which is used to send mails
 * @returns {undefined}
 * @throws {Error}
 */
ServiceNodemailer.prototype.setMailService = function(mailService) {
  if(mailService) {
    this.mailService = mailService.toString();
  } else {  // Use the default mail service
    this.mailService = options.nodemailer.service;
  }
  
  if(this.mailService === "") {
    throw new Error("@setMailService: Mail service not specified");
  }
};

/**
 * Returns mail service authorization data
 * 
 * @returns {Object}
 */
ServiceNodemailer.prototype.getAuthData = function () {
  return this.authData;
};

/**
 * Sets the authorization data
 * 
 * @param {String} user E-mail address for sending mail
 * @param {String} password Password for e-mail
 * @returns {undefined}
 */
ServiceNodemailer.prototype.setAuthData = function (user, password) {
  if(user) {
    this.authData = {
      user: user.toString(),
      pass: password.toString()
    };
  } else {  // Use default settings
    this.authData = {
      user: options.nodemailer.username,
      pass: options.nodemailer.password
    };
  }
};

/**
 * Creates transporter to send e-mails
 * 
 * @param {boolean} makeNew Flag to make new transporter object
 * @returns {undefined}
 */
ServiceNodemailer.prototype.initialize = function (makeNew) {
  // Creates new transporter if there is no one or if the necessary flag is set
  if(!this.transporter || makeNew) {
    this.transporter = require('nodemailer').createTransport({
      service: this.mailService,
      auth: {
        user: this.authData.user,
        pass: this.authData.pass
      }
    });
  }
  
  if(!this.from) {  // Fill in From field with default value if it not set
    try {
      this.setFrom(options.nodemailer.username);
    } catch (e) {
      console.log('@initialize; wrong From field: ' + e);
    }
  }
};

/**
 * Sends mail to the specfied mail
 * 
 * @param {Object} messageOptions Message options which is used to send mail
 * @param {Function} callback Callback function
 * @returns {undefined}
 */
ServiceNodemailer.prototype.send = function(messageOptions, callback) {
  var self = this;

  SenderPrototype.prototype.send.call(this, messageOptions, callback);

  this.initialize();
  var mailOptions = {
    from: this.from,
    to: this.to,
    subject: this.subject
  };
  
  if(this.useHtml) { // Send mail as a plain text or HTML
    mailOptions.html = this.text;
  } else {
    mailOptions.text = this.text;
  }

  this.transporter.sendMail(mailOptions, function(error, info) {
    if(error) {
        callback(error, 'Mail send error: ' + error.toString() + '; To: ' + self.to + '; service: ' + self.mailService);
    } else {
      callback(error, 'Message sent: ' + info.response);
    }
  });
};

module.exports.getService = ServiceNodemailer;

/**
 * Injects sender-js global options to Nodemailer module
 * 
 * @param {object} nmOptions Nodemailer options in common sender-js module format
 * @returns {undefined}
 */
module.exports.setOptions = function(nmOptions) {
  options = nmOptions;
};