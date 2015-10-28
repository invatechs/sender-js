var settings = require('./settings.json');
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
    assert.throws(function() {sender.setTo(settings.testValues.invalidMail);}, Error);
    done();
  },
  
  'test valid setTo value': function(done) {
    assert.doesNotThrow(function () {sender.setTo(settings.testValues.validMail)}, Error);
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
  'test Mailgun setOptions function with options object argument': function(done) {
    assert.doesNotThrow(function () {sender.setOptions(settings['mailgun-js']);}, Error);
    done();
  },
  
  'test Mailgun setOptions function with separate options arguments': function(done) {
    assert.doesNotThrow(function () {
      sender.setOptions(settings['mailgun-js'].apiKey, settings['mailgun-js'].domain);
    }, Error);
    done();
  },
  
  'test Mailgun send email with predefined message options': function(done) {
    try {
      sender.setFrom(settings.testValues.fromEmail);
      sender.setTo(settings.testValues.toEmail);
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
  // Common sender-js init
  //
  'test sender-js common initialization with Nodemailer gmail credentials': function(done) {
    assert.doesNotThrow(function() {
      sender = senderJs.init(settings.nodemailer);
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
  
  'test sender-js common re-initialization with Mailgun gmail credentials': function(done) {
    var mgSettings = {mailgun: settings['mailgun-js']};
    assert.doesNotThrow(function() {
      sender = senderJs.reInit(mgSettings);
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
  
  'test supported services list return': function(done) {
    assert.equal( typeof senderJs.getSenderServicesList(), 'object' );
    done();
  },
};