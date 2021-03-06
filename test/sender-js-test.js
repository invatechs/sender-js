var settings = {};

try {
  settings = require('./settings.local.json');
} catch(e) {
  settings = require('./settings.json');
}


var assert = require('assert');

var sender;
var senderJs = require('../sender-js.js');


module.exports = {
  beforeEach: function (done) {
    setTimeout(done, 400);
  },
  
  //
  // Nodemailer service init
  //
  'test Nodemailer service init': function(done) {
    sender = senderJs.getNodemailerService(settings.nodemailer);
    assert.equal( typeof sender, 'object' );
    done();
  },
  
  //
  // Setting functions
  //
  
  'test invalid setFrom value': function(done) {
    assert.throws(function() {sender.setFrom(settings.testValues.invalidMail);}, Error);
    done();
  },
  
  'test valid setFrom value': function(done) {
    assert.doesNotThrow(function () {sender.setFrom(settings.testValues.validMail)}, Error);
    done();
  },
  
  'test invalid setTo value': function(done) {
    assert.throws(function() {sender.setTo(settings.testValues.invalidMail, true);}, Error);
    done();
  },
  
  'test valid setTo value': function(done) {
    assert.doesNotThrow(function () {sender.setTo(settings.testValues.validMail, true)}, Error);
    done();
  },
  
  'test setSubject function': function(done) {
    assert.ok(!sender.setSubject(settings.testValues.subject));
    done();
  },
  
  'test setText function': function(done) {
    assert.ok(!sender.setText(settings.testValues.message));
    done();
  },
  
  'test setHtmlFlag function': function(done) {
    assert.ok(!sender.setHtmlFlag(false));
    done();
  },
  
  //
  // Getting functions
  //
  
  'test getFrom value': function(done) {
    assert.notEqual(sender.getFrom(), "");
    done();
  },
  
  'test getTo value': function(done) {
    assert.notEqual(sender.getTo(), "");
    done();
  },
  
  'test getSubject value': function(done) {
    assert.notEqual(sender.getSubject(), undefined);
    done();
  },
  
  'test getText value': function(done) {
    assert.notEqual(sender.getText(), undefined);
    done();
  },
  
  'test getHtmlFlag value': function(done) {
    assert.notEqual(sender.getHtmlFlag(), undefined);
    done();
  },
  
  //
  // Nodemailer functions
  // Setting functions
  //
  
  'test Nodemailer setMailService function': function(done) {
    assert.doesNotThrow(function () {sender.setMailService(settings.testValues.nodemailerService)}, Error);
    done();
  },
  
  'test Nodemailer setAuthData function': function(done) {
    assert.ok(!sender.setAuthData(settings.nodemailer[settings.testValues.nodemailerService].username,
                                  settings.nodemailer[settings.testValues.nodemailerService].password));
    done();
  },
  
  //
  // Getting functions
  //
  
  'test Nodemailer getMailService value': function(done) {
    assert.notEqual(sender.getMailService(), "");
    done();
  },
  
  'test Nodemailer getAuthData value': function(done) {
    assert.ok(typeof sender.getMailService(), "object");
    done();
  },
  
  //
  // Send function
  //
  
  'test Nodemailer send email with predefined message options': function(done) {
    try {
      sender.setTo(settings.testValues.toEmail);
    } catch(e) {
      sender.setTo(settings.nodemailer[settings.testValues.nodemailerService].username);
    }
    sender.send({}, function(err, message) {
      assert.ifError(err);
      done();
    });
  },
  
  'test Nodemailer send email with new message options': function(done) {
    var messageOptions = {
      from: settings.testValues.fromEmail,
      to: settings.testValues.toEmail,
      subject: settings.testValues.subject,
      text: settings.testValues.message + ' ' + 'test send email via Nodemailer with new message options'
    };
    
    sender.send(messageOptions, function(err, message) {
      assert.ifError(err);
      done();
    });
  },
  
  //
  // Mailgun functions
  // Mailgun service init
  //
  'test Mailgun service init': function(done) {
    sender = senderJs.getMailgunService(settings['mailgun-js']);
    assert.equal(typeof sender, 'object');
    done();
  },
  
  //
  // Setting functions
  //
  'test Mailgun setCredentials function with options object argument': function(done) {
    assert.doesNotThrow(function () {sender.setCredentials(settings['mailgun-js']);}, Error);
    done();
  },
  
  'test Mailgun setCredentials function with separate options arguments': function(done) {
    assert.doesNotThrow(function () {
      sender.setCredentials(settings['mailgun-js'].apiKey, settings['mailgun-js'].domain);
    }, Error);
    done();
  },
  
  //
  // Getting functions
  //
  
  'test Mailgun getCredentials value': function(done) {
    assert.equal( typeof sender.getCredentials(), 'object' );
    done();
  },
  
  //
  // Send function
  //
  'test Mailgun send email with predefined message options': function(done) {
    try {
      sender.setFrom(settings.testValues.fromEmail);
      sender.setTo(settings.testValues.toEmail, true);
      sender.setSubject(settings.testValues.subject);
      sender.setText(settings.testValues.message + '. Via Mailgun');
      sender.send({}, function(err, message) {
      assert.ifError(err);
      done();
    });
    } catch(e) {}
  },
  
  'test Mailgun send email with new message options': function(done) {
    var messageOptions = {
      from: settings.testValues.fromEmail,
      to: settings.testValues.toEmail,
      subject: settings.testValues.subject,
      text: settings.testValues.message + ' ' + 'test send email via Mailgun with new message options'
    };
    
    sender.send(messageOptions, function(err, message) {
      assert.ifError(err);
      done();
    });
  },
  
  //
  // Slack functions
  // Slack service init
  //
  'test Slack service init': function(done) {
    sender = senderJs.getSlackService(settings.slack);
    assert.equal( typeof sender, 'object' );
    done();
  },
  
  //
  // Setting functions
  //
  'test Slack setToken function with options object argument': function(done) {
    assert.doesNotThrow(function () {sender.setToken(settings['slack'].token);}, Error);
    done();
  },
  
  //
  // Getting functions
  //
  
  'test Slack getToken value': function(done) {
    assert.notEqual(sender.getToken(), "");
    done();
  },
  
  //
  // Send function
  //
    'test Slack send message': function(done) {
    var messageOptions = {
      to: settings.testValues.slackRecipient,
      text: settings.testValues.message + ' ' + 'test send message via Slack'
    };
    
    sender.send(messageOptions, function(err, message) {
      assert.ifError(err);
      done();
    });
  },
  
  //
  // Request functions
  // Request service init
  //
  'test Request service init': function(done) {
    sender = senderJs.getRequestService(settings.request);
    assert.equal( typeof sender, 'object' );
    done();
  },
  
  //
  // Setting functions
  //
  'test Request setMethod function with options object argument': function(done) {
    assert.doesNotThrow(function () {sender.setMethod(settings['request'].method);}, Error);
    done();
  },
  
  'test Request setTo function with URL argument': function(done) {
    assert.doesNotThrow(function () {sender.setTo(settings['request'].url);}, Error);
    done();
  },
  
  'test Request addHeaders function with options object argument': function(done) {
    assert.doesNotThrow(function () {sender.addHeaders(settings.testValues.requestHeaders);}, Error);
    done();
  },
  
  'test Request addHeaders function to replace current headers': function(done) {
    assert.doesNotThrow(function () {sender.addHeaders(settings.testValues.requestHeadersReplace, true);}, Error);
    done();
  },
  
  'test Request addQsParams function with options object argument': function(done) {
    assert.doesNotThrow(function () {sender.addQsParams(settings.testValues.requestQs);}, Error);
    done();
  },
  
  'test Request addQsParams function to replace current query string parameters': function(done) {
    assert.doesNotThrow(function () {sender.addQsParams(settings.testValues.requestQsReplace, true);}, Error);
    done();
  },
  
  'test setJson function': function(done) {
    assert.ok(!sender.setJson(settings['request'].json));
    done();
  },
  
  //
  // Getting functions
  //
  
  'test Request getMethod value': function(done) {
    assert.notEqual(sender.getMethod(), "");
    done();
  },
  
  'test Request getHeaders value': function(done) {
    assert.equal(typeof sender.getHeaders(), "object");
    done();
  },
  
  'test Request getQueryString value': function(done) {
    assert.equal(typeof sender.getQueryString(), "object");
    done();
  },
  
  'test getJson value': function(done) {
    assert.notEqual(sender.getJson(), undefined);
    done();
  },
  
  //
  // Send function
  //
  'test Request send message': function(done) {
    var messageOptions = {
      text: settings.testValues.requestMessage
    };
    
    sender.send(messageOptions, function(err, message) {
      assert.ifError(err);
      done();
    });
  },
  
  //
  // Telegram functions
  // Telegram service init
  //
  'test Telegram service init': function(done) {
    sender = senderJs.getTelegramService(settings.telegram);
    assert.equal( typeof sender, 'object' );
    done();
  },
  
  //
  // Setting functions
  //
  'test Telegram setToken function with options object argument': function(done) {
    assert.doesNotThrow(function () {sender.setToken(settings['telegram'].token);}, Error);
    done();
  },
  
  'test Telegram setCharId function with options string argument': function(done) {
    assert.doesNotThrow(function () {sender.setChatId(settings['telegram'].chatId);}, Error);
    done();
  },
  
  //
  // Getting functions
  //
  
  'test Telegram getToken value': function(done) {
    assert.notEqual(sender.getToken(), "");
    done();
  },
  
  'test Telegram getChatId value': function(done) {
    assert.notEqual(sender.getChatId(), "");
    done();
  },
  
  //
  // Send function
  //
    'test Telegram send message': function(done) {
    var messageOptions = {
      text: settings.testValues.message + ' ' + 'test send message via Telegram'
    };
    
    sender.send(messageOptions, function(err, message) {
      assert.ifError(err);
      done();
    });
  },
  
  
  //
  // Common sender-js init
  // Nodemailer
  //
  'test sender-js common initialization with Nodemailer only gmail credentials': function(done) {
    assert.doesNotThrow(function() {
      senderJs.init(settings.nodemailer);
      sender = senderJs.getCurrentService();
    }, Error);
    assert.ok(typeof sender, "object");
    done();
  },
  
  'test Nodemailer send email via common interface': function(done) {
    var messageOptions = {
      from: settings.testValues.fromEmail,
      to: settings.testValues.toEmail,
      subject: settings.testValues.subject,
      text: settings.testValues.message + 'test send email via common interface via Nodemailer'
    };

    sender.send(messageOptions, function(err, message) {
      assert.ifError(err);
      done();
    });
  },
  
  //
  // Mailgun
  //
  'test sender-js common re-initialization with Mailgun only credentials': function(done) {
    var mgSettings = {mailgun: settings['mailgun-js']};
    assert.doesNotThrow(function() {
      senderJs.reInit(mgSettings);
      sender = senderJs.getCurrentService();
    }, Error);
    assert.ok(typeof sender, "object");
    done();
  },
  
  'test Mailgun send email via common interface': function(done) {
    var messageOptions = {
      from: settings.testValues.fromEmail,
      to: settings.testValues.toEmail,
      subject: settings.testValues.subject,
      text: settings.testValues.message + 'test send email via common interface via Mailgun'
    };

    sender.send(messageOptions, function(err, message) {
      assert.ifError(err);
      done();
    });
  },
  
  //
  // Slack
  //
  'test sender-js common re-initialization with Slack only credentials': function(done) {
    var slSettings = {slack: settings['slack']};
    assert.doesNotThrow(function() {
      senderJs.reInit(slSettings);
      sender = senderJs.getCurrentService();
    }, Error);
    assert.ok(typeof sender, "object");
    done();
  },
  
  'test Slack send message via common interface': function(done) {
    var messageOptions = {
      to: settings.testValues.slackRecipient,
      text: settings.testValues.message + 'test send email via common interface via Slack'
    };

    sender.send(messageOptions, function(err, message) {
      assert.ifError(err);
      done();
    });
  },
  
  //
  // Request
  //
  'test sender-js common re-initialization with Request only credentials': function(done) {
    var rqSettings = {http: settings['request']};
    assert.doesNotThrow(function() {
      senderJs.reInit(rqSettings);
      sender = senderJs.getCurrentService();
    }, Error);
    assert.ok(typeof sender, "object");
    done();
  },
  
    'test Request send message via common interface': function(done) {
    var messageOptions = {
      text: settings.testValues.requestMessage
    };

    sender.send(messageOptions, function(err, message) {
      assert.ifError(err);
      done();
    });
  },
  
  'test supported services list return': function(done) {
    assert.equal( typeof senderJs.getSenderServicesList(), 'object' );
    done();
  },

  //
  // Telegram
  //
  'test sender-js common re-initialization with Telegram only credentials': function(done) {
    var tgSettings = {telegram: settings['telegram']};
    assert.doesNotThrow(function() {
      senderJs.reInit(tgSettings);
      sender = senderJs.getCurrentService();
    }, Error);
    assert.ok(typeof sender, "object");
    done();
  },
  
  'test Telegram send message via common interface': function(done) {
    var messageOptions = {
      text: settings.testValues.message + 'test send email via common interface via Telegram'
    };

    sender.send(messageOptions, function(err, message) {
      assert.ifError(err);
      done();
    });
  },

  'test multiple objects init': function(done) {
    assert.doesNotThrow(function() {
      
      var mSettings = {
        gmail: settings.nodemailer.gmail,
        slack: settings.slack,
        mailgun: settings['mailgun-js'],
        http: settings.request
      };
      
      senderJs.reInit(mSettings);
    }, Error);
    assert.ok(typeof senderJs, Object);
    done();
  },
  
  'test multiple message send': function(done) {
    var messageOptions = {
      services: ['http'],
      to: settings.testValues.toEmail,
      from: settings.testValues.fromEmail,
      subject: settings.testValues.subject,
      text: settings.testValues.message + ' t\n\
est multiple messages send',
      http: {
        url: settings.request.url
      }
    };

    senderJs.send(messageOptions, function(err, message) {
      assert.ifError(err);
      done();
    });
  },
};