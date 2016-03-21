/**
 * Request service implementation
 * 
 * @author Invatechs Software https://www.invatechs.com
 */

var util = require('util');
var SenderPrototype = require('./sender-prototype.js');

var options = {};

var _methods = ["GET", "POST", "PUT", "DELETE"];

/**
 * Checks if the method right and supported
 * 
 * @param {string} method REST method
 * @returns {boolean} True if REST method is supported
 */
function checkMethod(method) {
  if(!method)
    return false;
  method = method.toString().trim();
  
  if(_methods.indexOf(method) === -1) {
    return false;
  }
  
  return true;
}

/**
 * Injects sender-js global options to Request module
 * 
 * @param {object} rqOptions Request options in common sender-js module format
 * @returns {undefined}
 */
function setOptions(rqOptions) {
  options['request'] = rqOptions['request'];
}

/**
 * Request prototype class
 * 
 * @param {Object} rqOptions Options object needs to use Request
 * @param {boolean} setLocalOptions Flag to save option in local object
 * @returns {undefined}
 */
function ServiceRequest(rqOptions, setLocalOptions) {
  if(setLocalOptions) {
    setOptions(rqOptions);
  }
  
  this.to = 'http://localhost';
  this.method = 'POST';
  this.request = undefined;
  this.headers = {};
  this.queryString = {};
  this.json = false;
  
  SenderPrototype.call(this);

  if(rqOptions && !setLocalOptions) {
    this.setMethod(rqOptions.method);
    this.setTo(rqOptions.url);
    this.addHeaders(rqOptions.headers);
    this.addQsParams(rqOptions.queryString);
    this.setJson(rqOptions.json);
  } else if(options.hasOwnProperty('request')) {
    this.setMethod();
    this.setTo();
    this.addHeaders();
    this.addQsParams();
    this.setJson();
  }
}
util.inherits(ServiceRequest, SenderPrototype);

/**
 * Returns request method
 * 
 * @returns {ServiceRequest.method}
 */
ServiceRequest.prototype.getMethod = function() {
  return this.method;
};

/**
 * Sets the request method
 * 
 * @param {string} method New request method
 * @returns {undefined}
 * @throws {Error} Exception
 */
ServiceRequest.prototype.setMethod = function (method) {
  if(checkMethod(method)) {
    this.method = method;
  } else if(checkMethod(options.request.method)) {
    this.method = options.request.method;
  } else {
    throw new Error("@setMethod; Wrong REST method: " + method);
  }
};

/**
 * Sets URL destination as To field
 * 
 * @param {String} url URL to use as To field
 * @returns {undefined}
 * @throws {Error} Exception
 */
ServiceRequest.prototype.setTo = function(url) {
  if(this.validateURL(url)) {
    this.to = url;
  } else if(this.validateURL(options.request.url)) {
    this.to = options.request.url;
  } else {
    throw new Error("@setMethod; Wrong URL: " + url);
  }
};

/**
 * Returns headers object
 * 
 * @returns {Object}
 */
ServiceRequest.prototype.getHeaders = function() {
  return this.headers;
};

/**
 * Add header or headers
 * 
 * @param {Object} headers Headers to add
 * @param {boolean} replace Flag to replace old headers with the new one
 * @returns {undefined}
 */
ServiceRequest.prototype.addHeaders = function(headers, replace) {
  if( headers === undefined ) {
    if( options.request === undefined ) {
      return;
    } else if(options.request.headers === undefined) {
      return;
    }
  }

  if(!headers || !Object.keys(headers).length) {
    headers = options.request.headers;
  }
  
  if(replace) { // Empty headers object
    this.headers = {};
  }
  
  for(var header in headers) {
    this.headers[header] = headers[header];
  }
};

/**
 * Returns query string object
 * 
 * @returns {undefined}
 */
ServiceRequest.prototype.getQueryString = function() {
  return this.queryString;
};

/**
 * Add parameters to query string
 * 
 * @param {Object} params Parameters to add
 * @param {boolean} replace Flag to replace old parameters with the new one
 * @returns {undefined}
 */
ServiceRequest.prototype.addQsParams = function(parameters, replace) {
  if( parameters === undefined ) {
    if( options.request === undefined ) {
      return;
    } else if(options.request.queryString === undefined) {
      return;
    }
  }

  if(!parameters || !Object.keys(parameters).length) {
    parameters = options.request.queryString;
  }
  
  if(replace) { // Empty headers object
    this.queryString = {};
  }
  
  for(var param in parameters) {
    this.queryString[param] = parameters[param];
  }
};

/**
 * Returns JSON flag value
 * 
 * @returns {Boolean}
 */
ServiceRequest.prototype.getJson = function() {
  return this.json;  
};

/**
 * Sets JSON flag to true or false
 * 
 * @param {boolean} value New JSON value
 * @returns {undefined}
 */
ServiceRequest.prototype.setJson = function(value) {
  if( value === undefined ) {
    if( options.request === undefined ) {
      return;
    } else if(options.request.json === undefined) {
      return;
    }
  }
  
  if(value === undefined) {
    value = options.request.json;
  }
  
  this.json = Boolean(value);
};

/**
 * Creates Request object to send messages
 * 
 * @param {boolean} makeNew Flag to make new Request object
 * @returns {undefined}
 */
ServiceRequest.prototype.initialize = function (makeNew) {
  var self = this;

  // Creates new Request object if there is no one or if the necessary flag is set
  if(!this.request || makeNew) {
    this.request = require('request');
  }
};

/**
 * Sends message to the specfied URL
 * 
 * @param {Object} messageOptions Message options which is used to send message
 * @param {Function} callback Callback function
 * @returns {undefined}
 */
ServiceRequest.prototype.send = function(messageOptions, callback) {
  var self = this;

  SenderPrototype.prototype.send.call(this, messageOptions, callback);
  // If toSlack property is set then we use it to send message
  if(messageOptions.hasOwnProperty('http')) {
    this.setTo(messageOptions.http.url);
  }
  
  var message = {
      url: this.to,
      method: this.method
  };

  this.initialize();
  
  if(Object.keys(this.headers).length) {
    message.headers = this.headers;
  }
  
  if(Object.keys(this.queryString).length) {
    message.qs = this.queryString;
  }
  
  if(this.method === "PUT" || this.method === "POST") {
    if(this.json) {
      message.json = true;
      message.body = this.text;
    } else {
      message.body = encodeURI(this.text);
    }
  }
  
  this.request(message, function(error, response, body){
    if(error) {
      callback(error, response.statusCode);
    } else {
      callback("", response.statusCode);
    }
  });
};

module.exports = ServiceRequest;