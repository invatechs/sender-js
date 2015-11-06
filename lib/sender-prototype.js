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
  this.useHtml = false;        // Flag to use HTML in letter
  
  this.globalErrors = "";       // Global error var
}

/**
 * Validates Email address
 * 
 * @param {String} emails Email address to validate
 * @returns {Object} Returns object with email validation results
 */
SenderPrototype.prototype.validateEmail = function (emails) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    var mails = Array.isArray(emails) ? emails : emails.replace(/\s/g, "").split(/,|;/);
    var mailCheckResult = {};
    mails.map(function(mail){
      mailCheckResult[mail] = re.test(mail);
    });
    
    var resultMails = [];
    for(var addr in mailCheckResult) {
      if(mailCheckResult[addr]) {
        resultMails.push(addr);
      } else {
        this.globalErrors += addr + '; ';
      }
    }
    
    if(resultMails.length) {
      return resultMails.toString();
    } else {
      return null;
    }
};

/**
 * Validates URL
 * 
 * @param {String} url URL to validate
 * @returns {Boolean} True if URL is correct
 */
SenderPrototype.prototype.validateURL = function (url) {
  if(!url) {
    return false;
  }

  var pattern = new RegExp("^((cc:|https:|http:|[/][/]|www.)([a-z]|[A-Z]|[:0-9]|[/.])*)$", 'g');
  
  if(pattern.test(url) || url === 'http://localhost' || url === 'localhost') {
    return true;
  } else {
    return false;
  }
}

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
  var mails = [];
  if( mails = this.validateEmail(from) ) {
    this.from = mails;
  } else {
    throw new Error("Wrong From email");
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
 * @param {String} email Email flag is used to validate the To value
 * @returns {undefined}
 * @throws {Error} Wrong To field
 */
SenderPrototype.prototype.setTo = function (to, email) {
  to = to.toString();
  var mails = [];
  
  if(email) {
    if( mails = this.validateEmail(to) ) {
      this.to = mails;
    } else {
      throw new Error("Wrong To email field");
    }
  } else {
    this.to = to;
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
SenderPrototype.prototype.setText = function (text, dontConvert) {
  if(dontConvert) {
    text = text.toString();
  }
  
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
