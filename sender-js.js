var util = require('util');
var services = require('./services');
var ServiceNodemailer = require('./lib/service-nodemailer.js');
var ServiceMailgun = require('./lib/service-mailgun.js');
var ServiceSlack = require('./lib/service-slack.js');
var ServiceRequest = require('./lib/service-request.js');

var senderServices = {};  // Current sender service

var options = { };  // Sender-js options

/**
 * Checks if array or object is empty
 * 
 * @param {Array|Object} dataVar Variable to check
 * @returns {boolean} Returns true if empty
 */
function isEmpty(dataVar) {
  if(typeof dataVar === 'object' && !Object.keys(dataVar).length) {
    return true;
  }
  
  return false;
}

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
 * Resolves Request options and saves them into local options object
 * 
 * @param {String} rqName Request internal service name
 * @param {Object} rqOptions Request options to resolve
 * @returns {undefined}
 * @throws {Error} Exception
 */
function resolveRequestOptions(rqName, rqOptions) {
  if(!rqName) {
    throw new Error("Wrong Request name: " + rqName.toString());
  }
  
  if(rqOptions.hasOwnProperty('method') && rqOptions.method) {
    options[rqName].method = rqOptions.method;
  }
  
  if(rqOptions.hasOwnProperty('url') && rqOptions.url) {
    options[rqName].url = rqOptions.url;
  }
  
  if(rqOptions.hasOwnProperty('headers') && !isEmpty(rqOptions['headers'])) {
    options[rqName].headers = rqOptions.headers;
  }
  
  if(rqOptions.hasOwnProperty('queryString') && !isEmpty(rqOptions['queryString'])) {
    options[rqName].queryString = rqOptions.queryString;
  }
  
  if(rqOptions.hasOwnProperty('json') && rqOptions.json) {
    options[rqName].json = rqOptions.json;
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
        case "request":
          resolveRequestOptions(services[service], newOptions[service]);
          options.sendServices.push("request");
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
 * Return Slack service object
 * 
 * @param {Object} options Slack options
 * @returns {SlackService}
 */
module.exports.getSlackService = function(options) {
  return new ServiceSlack(options);
};

module.exports.getRequestService = function(options) {
  return new ServiceRequest(options);
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
 * Returns current service object
 * 
 * @returns {Object}
 */
module.exports.getCurrentService = function() {
  if(Object.keys(senderServices).length === 1) {
    return senderServices[Object.keys(senderServices)[0]];
  } else {
    return senderServices;
  }
};

/**
 * Returns sender service object which is specified in options
 * 
 * @param {Object} serviceOptions Options to select and use sender service
 * @returns {undefined}
 * @throws {Error} Exception
 */
var init = function (serviceOptions) {
  if(isEmpty(senderServices)) {
    try {
      setOptions(serviceOptions);
    } catch (e) {
      throw new Error(e);
    }

    for(var i = 0; i < options.sendServices.length; i++) {
      switch(options.sendServices[i])
      {
        case "nodemailer":
          senderServices['nodemailer'] = new ServiceNodemailer(options, true);
          break;
        case "mailgun-js":
          senderServices['mailgun-js'] = new ServiceMailgun(options, true);
          break;
        case "slack":
          senderServices['slack'] = new ServiceSlack(options, true);
          break;
        case "request":
          senderServices['request'] = new ServiceRequest(options, true);
          break;
      }
    }
  }
};
module.exports.init = init;

/**
 * Reinitializes sender service object
 * 
 * @param {Object} serviceOptions Options to select and use sender service
 * @returns {undefined}
 * @throws {Error} Exception
 */
module.exports.reInit = function (serviceOptions) {
  senderServices = {};
  initOptions(true);

  var service;
  try {
    init(serviceOptions);
  } catch(e) {
    throw new Error(e);
  }
};

/**
 * Sends message to activated services
 * 
 * @param {object} messageOptions Message text and options
 * @param {function} callback
 * @returns {undefined}
 */
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
      callback(err, message);
    }, callback);
  });
};