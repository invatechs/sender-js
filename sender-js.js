var util = require('util');
var services = require('./services');
var ServiceNodemailer = require('./lib/service-nodemailer.js');
var ServiceMailgun = require('./lib/service-mailgun.js');
var ServiceSlack = require('./lib/service-slack.js');

var senderServices = {};  // Current sender service

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
    sendServices: []
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
 * @param {Object} mgOptions Mailgun options to resolve
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
 * Resolves Slack options and saves them into local options object
 * 
 * @param {String} slName Slack internal service name
 * @param {Object} slOptions Slack options to resolve
 * @returns {undefined}
 * @throws {Error} Exception
 */
function resolveSlackOptions(slName, slOptions) {
  if(!slName) {
    throw new Error("Wrong Slack name: " + slName.toString());
  }
  
  if(slOptions.hasOwnProperty('token') && slOptions.token) {
    options[slName].token = slOptions.token;
  } else {
    throw new Error("Wrong Slack token: " + slOptions.token);
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
            options.sendServices.push("nodemailer");
          } catch (e) {
            throw new Error(e);
          }
          break;
        case "mailgun-js":
          resolveMailgunOptions(services[service], newOptions[service]);
          options.sendServices.push("mailgun-js");
          break;
        case "slack":
          resolveSlackOptions(services[service], newOptions[service]);
          options.sendServices.push("slack");
          break;
      }
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
 * Gets services internal name
 * 
 * @param {String} service Service name to resolve
 * @returns {}
 */
function getServiceIntName(service) {
  service = service.toString(); // Force service name to be a string
  
  for(var k in services) {
    if(k === service) {
      return services[service];
    }
  }
  
  return null;
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
 * Return Slack service object
 * 
 * @param {Object} options Slack options
 * @returns {SlackService}
 */
module.exports.getSlackService = function(options) {
  return new ServiceSlack.getService(options);
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
 * @param {boolean} singleService Flag to use single or multiple sending services
 * @returns {Object|null} Selected sender service object or null if there more then one service
 * @throws {Error} Exception
 */
var init = function (serviceOptions, singleService) {
  if(!Object.keys(senderServices).length) {
    try {
      setOptions(serviceOptions);
    } catch (e) {
      throw new Error(e);
    }

    for(var i = 0; i < options.sendServices.length; i++) {
      switch(options.sendServices[i])
      {
        case "nodemailer":
          ServiceNodemailer.setOptions(options);
          senderServices['nodemailer'] = new ServiceNodemailer.getService();
          break;
        case "mailgun-js":
          ServiceMailgun.setOptions(options);
          senderServices['mailgun-js'] = new ServiceMailgun.getService();
          break;
        case "slack":
          ServiceSlack.setOptions(options);
          senderServices['slack'] = new ServiceSlack.getService();
          break;
      }
      
      if(singleService) {
        senderServices = senderServices[options.sendServices[i]];
        break;
      }
    }
  }
  
  if(singleService) {
    return senderServices;
  } else {
    return null;
  }
};
module.exports.init = init;

/**
 * Reinitializes sender service object
 * 
 * @param {Object} serviceOptions Options to select and use sender service
 * @param {boolean} singleService Flag to use single or multiple sending services
 * @returns {Object|null} Selected mail service object or null if service options are wrong
 * @throws {Error} Exception
 */
module.exports.reInit = function (serviceOptions, singleService) {
  senderServices = {};
  initOptions(true);

  var service;
  try {
    service = init(serviceOptions, singleService);
  } catch(e) {
    throw new Error(e);
  }

  return service;
};

module.exports.send = function (messageOptions, callback) {
  if(!messageOptions) {
    throw new Error("@send; Message options are empty");
  }
    
  // Send message to the specified services
  var usedServices = [];
  if(messageOptions.hasOwnProperty('services')) {
    messageOptions.services.forEach(function(service){
      usedServices.push(getServiceIntName(service));
    });
  } else {
    for(var k in senderServices) {
      usedServices.push(k);
    }
  }

  usedServices.forEach(function(service) {
    senderServices[service].send(messageOptions, function(err, message) {
      console.log(message);
      callback(err, message);
      //setTimeout(function(){callback(err, message);}, 2000);
    });
  });
};