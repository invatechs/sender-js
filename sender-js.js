var util = require('util');
var services = require('./services');
var ServiceNodemailer = require('./lib/service-nodemailer.js');
var ServiceMailgun = require('./lib/service-mailgun.js');

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
 * Returns Nodemailer service object
 * 
 * @param {Object} options Nodemailer options
 * @returns {ServiceNodemailer}
 */
module.exports.getNodemailerService = function() {
  if(!arguments.length) {
    return new ServiceNodemailer.getService();
  } else {
    return new ServiceNodemailer.getService(arguments[0]);
  }
};

/**
 * Returns Mailgun service object
 * 
 * @param {Object} options Mailgun options
 * @returns {ServiceMailgun}
 */
module.exports.getMailgunService = function(options) {
  return new ServiceMailgun.getService(options);
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
        ServiceNodemailer.setOptions(options);
        senderService = new ServiceNodemailer.getService();
        break;
      case "mailgun-js":
        ServiceMailgun.setOptions(options);
        senderService = new ServiceMailgun.getService();
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