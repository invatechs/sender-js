var util = require('util');
var services = require('./services');

var senderService;  // Current sender service

var options = { };  // Sender-js options


/**
 * Initializes options object
 * 
 * @param {boolean} reInit Re-initialize options
 * @returns {undefined}
 */
function initOptions(reInit) {
  if(reInit) {
    options = undefined;
  }
  
  options = {
    sendService: ""
  };
}
initOptions();

/**
 * Resolves Nodemailer options and saves them into local options object
 * 
 * @param {String} nmName Nodemailer internal service name
 * @param {String} Mail service name
 * @param {Object} nmOptions Nodemailer options to resolve
 * @returns {undefined}
 * @throws {Error} Exception
 */
function resolveNodemailerOptions(nmName, nmServiceName, nmOptions) {
  if(!nmName) {
    throw new Error("Wrong Nodemailer name: " + nmName.toString());
  }
  
  if(!nmServiceName) {
    throw new Error("Wrong Nodemailer mail service name: " + nmServiceName.toString());
  }
  
  options[nmName].service = nmServiceName;
  
  if(nmOptions.hasOwnProperty('username') && nmOptions.username) {
    options[nmName].username = nmOptions.username;
  } else {
    throw new Error("Wrong " + nmServiceName + " service username: " + nmOptions.username);
  }
  
  if(nmOptions.hasOwnProperty('username')) {
    options[nmName].password = nmOptions.password;
  } else {
    options[nmName].password = "";
  }
}

/**
 * Resolves Mailgun options and saves them into local options object
 * 
 * @param {String} mgName Mailgun internal service name
 * @param {type} mgOptions Mailgun options to resolve
 * @returns {undefined}
 * @throws {Error} Exception
 */
function resolveMailgunOptions(mgName, mgOptions) {
  if(!mgName) {
    throw new Error("Wrong Mailgun name: " + mgName.toString());
  }
  
  if(mgOptions.hasOwnProperty('apiKey') && mgOptions.apiKey) {
    options[mgName].apiKey = mgOptions.apiKey;
  } else {
    throw new Error("Wrong Mailgun service apiKey: " + mgOptions.apiKey);
  }
  
  if(mgOptions.hasOwnProperty('domain') && mgOptions.domain) {
    options[mgName].domain = mgOptions.domain;
  } else {
    throw new Error("Wrong Mailgun service domain: " + mgOptions.domain);
  }
}

/**
 * Parses options passed by argument
 * 
 * @param {Object} newOptions Options need to be parsed
 * @returns {undefined}
 * @throws {Error} Exception
 */
function setOptions(newOptions) {
  for(var service in newOptions) {
    if(services.hasOwnProperty(service)) {
      options[services[service]] = { };
      
      switch(services[service]) { // Sets options for necessary service
        case "nodemailer":
          try {
            resolveNodemailerOptions(services[service], service, newOptions[service]);
            options.sendService = "nodemailer";
          } catch (e) {
            throw new Error(e);
          }
          break;
        case "mailgun-js":
          resolveMailgunOptions(services[service], newOptions[service]);
          options.sendService = "mailgun-js";
          break;
      }

      return;
    } else {
      throw new Error("Service " + services[service] + " not supported");
    }
  }
}

/**
 * Checks if service is supported by sender-js
 * 
 * @param {String} service Service to check
 * @returns {boolean} Returns true if service is supported, false if not
 */
function isServiceSupported(service) {
  service = service.toString(); // Force service name to be a string
  
  for(var k in services) {
    if(k === service) {
      return true;
    }
  }
  
  return false;
}

/**
 * Sender prototype object
 * 
 * @returns {SenderPrototype}
 */
function SenderPrototype() {
  this.from = "";              // Address for "From" field
  this.to = "";                // Address for "To" field. Is used as destination mail address
  this.subject = "";           // Mail subject
  this.text = "";              // Mail body
  this.useHtml = false;  // Flag to use HTML in letter
}

/**
 * Validates Email address
 * 
 * @param {String} email Email address to validate
 * @returns {Boolean} Returns true, if email is valid
 */
SenderPrototype.prototype.validateEmail = function (email) { 
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
};

/**
 * Returns From field
 * 
 * @returns {String}
 */
SenderPrototype.prototype.getFrom = function () {
  return this.from;
};

/**
 * Sets From field
 * 
 * @param {String} from From field
 * @returns {undefined}
 * @throws {Error} Exception
 */
SenderPrototype.prototype.setFrom = function (from) {
  from = from.toString();
  
  if( this.validateEmail(from) ) {
    this.from = from;
  } else {
    throw new Error("Wront From email");
  }
};

/**
 * Returns To field
 * 
 * @returns {String}
 */
SenderPrototype.prototype.getTo = function () {
  return this.to;
};

/**
 * Sets To field
 * 
 * @param {String} to To field address
 * @returns {undefined}
 * @throws {Error} Wrong To field
 */
SenderPrototype.prototype.setTo = function (to) {
  to = to.toString();
  
  if( this.validateEmail(to) ) {
    this.to = to;
  } else {
    throw new Error("Wrong To email field");
  }
};

/**
 * Returns message subject
 * 
 * @returns {String}
 */
SenderPrototype.prototype.getSubject = function () {
  return this.subject;
};

/**
 * Sets mail subject
 * 
 * @param {String} subject Message subject
 * @returns {undefined}
 */
SenderPrototype.prototype.setSubject = function (subject) {
  subject = subject.toString();
  
  this.subject = subject;
};

/**
 * Returns mail Message body
 * 
 * @returns {String}
 */
SenderPrototype.prototype.getText = function () {
  return this.text;
};

/**
 * Sets message body
 * 
 * @param {String} text Message body
 * @returns {undefined}
 */
SenderPrototype.prototype.setText = function (text) {
  text = text.toString();
  
  this.text = text;
};

/**
 * Returns HTML flag
 * 
 * @returns {Boolean}
 */
SenderPrototype.prototype.getHtmlFlag = function () {
  return this.useHtml;
};

/**
 * Sets HTML flag
 * 
 * @param {Boolean} htmlFlag New HTML flag value
 * @returns {undefined}
 */
SenderPrototype.prototype.setHtmlFlag = function (htmlFlag) {
  this.useHtml = Boolean(htmlFlag);
};

/**
 * Prototype for sending function
 * 
 * @param {Object} messageOptions Message options which is used to send mail
 * @param {Function} callback Callback function
 * @returns {undefined}
 */
SenderPrototype.prototype.send = function (messageOptions, callback) {
  if(messageOptions.hasOwnProperty("to")) {
    try {
      this.setTo(messageOptions.to);
    } catch (e) {
      callback(e);
    }
  }
  
  if(messageOptions.hasOwnProperty("from")) {
    try {
      this.setFrom(messageOptions.from);
    } catch (e) {
      callback(e);
    }
  }
  
  if(messageOptions.hasOwnProperty("subject")) {
    this.setSubject(messageOptions.subject);
  }
  if(messageOptions.hasOwnProperty("text")) {
    this.setText(messageOptions.text);
  }
};

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

/**
 * Mailgun prototype class
 * 
 * @param {Object} mgOptions Options object needs to use Mailgun
 * @returns {undefined}
 */
function ServiceMailgun(mgOptions) {
  SenderPrototype.call(this);

  if(mgOptions) {
    this.setOptions(mgOptions);
  } else if(options.hasOwnProperty('mailgun-js')) {
    this.setOptions();
  }
  
  this.mailgun = undefined;
}
util.inherits(ServiceMailgun, SenderPrototype);

/**
 * 
 * @returns {Object} Maigun options object
 */
ServiceMailgun.prototype.getOptions = function() {
  return this.options;
};

/**
 * Sets Mailgun options
 * 
 * @param {Object|String} [options|apiKey] Mailgun options or API key for Mailgun
 * @param {String} [domain] Mailgun domain
 * @returns {undefined}
 * @throws {Error}
 */
ServiceMailgun.prototype.setOptions = function() {
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
    throw new Error('@setOptions Wrong Mailgun options');
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

/**
 * Returns Nodemailer service object
 * 
 * @param {Object} options Nodemailer options
 * @returns {ServiceNodemailer}
 */
module.exports.getNodemailerService = function() {
  if(!arguments.length) {
    return new ServiceNodemailer();
  } else {
    return new ServiceNodemailer(arguments[0]);
  }
};

/**
 * Returns Mailgun service object
 * 
 * @param {Object} options Mailgun options
 * @returns {ServiceMailgun}
 */
module.exports.getMailgunService = function(options) {
  return new ServiceMailgun(options);
};

/**
 * Returns list of supported services
 * 
 * @returns {Object}
 */
module.exports.getSenderServicesList = function() {
  return services;
};

/**
 * Returns sender service object which is specified in options
 * 
 * @param {Object} serviceOptions Options to select and use sender service
 * @returns {Object|null} Selected mail service object or null if service options are wrong
 * @throws {Error} Exception
 */
var init = function (serviceOptions) {
  if(!senderService) {
    try {
      setOptions(serviceOptions);
    } catch (e) {
      throw new Error(e);
    }

    switch(options.sendService)
    {
      case "nodemailer":
        senderService = new ServiceNodemailer();
        break;
      case "mailgun-js":
        senderService = new ServiceMailgun();
        break;
      default:
    }
  }
  
  return senderService;
};
module.exports.init = init;

/**
 * Reinitializes sender service object
 * 
 * @param {Object} serviceOptions Options to select and use sender service
 * @returns {Object|null} Selected mail service object or null if service options are wrong
 * @throws {Error} Exception
 */
module.exports.reInit = function (serviceOptions) {
  senderService = undefined;
  initOptions(true);
  
  var service;
  try {
    service = init(serviceOptions);
  } catch(e) {
    throw new Error(e);
  }

  return service;
};