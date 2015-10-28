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

module.exports = SenderPrototype;