# sender-js

Simple Node.js module for sending messages by e-mail, [Slack](https://slack.com/), [Telegram](https://telegram.org/) or HTTP API.

## Installation

`npm install sender-js`

## Usage overview

This module provides e-mail sending functionality via Nodemailer or Mailgun modules, supports sending messages to Slack team collaboration tool as well as HTTP API is supported too.

The messages can be sent separately or by all four services simultaneously.

Common Nodemailer usage with single service instance:
```js
var sender = require('sender-js');

var settings = {
  gmail: {
    "username": "your.mail@gmail.com",
    "password": "yourPassword"
	}
};

sender.init(settings);

var messageOptions = {
	to: 'recipient.mail@somemail.com',
	from: 'your.mail@mail.mail',
  subject: 'fff',
  text: 'test nodemailer text'
};

sender.send(messageOptions, function(err, message) {
	console.log(err + ' ' + message);
});
```

Common Mailgun usage with single service instance:
```js
var sender = require('sender-js');

var settings = {
  mailgun: {
    "apiKey": "key-somekey",
    "domain": "mg.yourdomain"
	}
};

sender.init(settings);

var messageOptions = {
	to: 'recipient.mail@somemail.com',
	from: 'your.mail@mail.mail',
  subject: 'fff',
  text: 'test mailgun test'
};

sender.send(messageOptions, function(err, message) {
	console.log(err + ' ' + message);
});
```

Common Slack usage with single service instance:
```js
var sender = require('sender-js');

var settings = {
  slack: {
    "token": "sasd-asdasdasdasdasdasda"
	}
};

sender.init(settings);

var messageOptions = {
	to: 'common',
  text: 'test slack text'
};

sender.send(messageOptions, function(err, message) {
	console.log(err + ' ' + message);
});
```

Common HTTP usage with single service instance:
```js
var sender = require('sender-js');

var settings = {
  http: {
    "url": "http://some.url",
		"method": "POST",
		"json": true,
		"headers": {
			"Content-type": "your content type",
			"Custom-header": "some header"
		},
		"queryString": {
			"id": 113
		}
	}
};

sender.init(settings);

var messageOptions = {
  text: 'test slack text'
};

sender.send(messageOptions, function(err, message) {
	console.log(err + ' ' + message);
});
```

Common Telegram usage with single service instance:
```js
var sender = require('sender-js');

var settings = {
  telegram: {
    "token": "43432424234:asdasdasdasdasdasda",
    "chatId": "-25434543" // Can be ommited
	}
};

sender.init(settings);

var messageOptions = {
  text: 'test slack text'
};

sender.send(messageOptions, function(err, message) {
	console.log(err + ' ' + message);
});
```
To send messages to Telegram sender-js needs respective chat ID. Chat ID can be received automatically by sending
`/start` command to the library. To do that you need follow the next few steps:
1. Add BotFather (@BotFather) to your chat
2. Create new bot with `/newbot` command
3. Add generated bot token to Telegram sender-js settings
4. Add generated bot to your chat
5. Start your application with sender-js lib
6. Send `/start` command from Telegram to newly created bot

Also there is an option to add chat ID manually, if you already have it. There is one way to get it for the group chat:
1. Open [Telegram Web](https://web.telegram.org/) in your browser
2. Do the necessary authorization
3. Create new chat group and add your bot to it
4. In browser address bar there is chat ID which looks like `g144782871`
5. Add it to sender-js settings as `chatId` field replacing "g" with "-": `-144782871`
Now sender-js can send messages to the group without `/start` command. Also you can transmit group chat ID to sender-js
with the first technique described above.


To send multiple messages you should specify options to all services you going to use:
```js
var sender = require('sender-js');

var settings = {
	gmail: {
    "username": "your.mail@gmail.com",
    "password": "yourPassword"
	},
	mailgun: {
    "apiKey": "key-somekey",
    "domain": "mg.yourdomain"
	},
  slack: {
    "token": "sasd-asdasdasdasdasdasda"
	},
	http: {
    "url": "http://jsonplaceholder.typicode.com/posts",
    "method": "POST",
    "json": true,
		"headers": {
			"Content-type": "your content type",
			"Custom-header": "some header"
		},
		"queryString": {
			"id": 11
		}
  }
};

// If we don't use the second argument, multiple service objects will be created
sender.init(settings);

var messageOptions = {
	to: 'recipient.mail@somemail.com',
	from: 'your.mail@mail.mail',
  subject: 'fff',
  text: 'test mailgun test',
	slack: {	// Slack destination name should be specified separately
	 to: 'common'
	},
	http: {	// HTTP request URL is specified separately, if needed
		url: 'http://some.url'
	}
};

sender.send(messageOptions, function(err, message) {
	console.log(err + ' ' + message);
});
```

## Tests

To run the test suite you must provide e-mail and Mailgun credetials. E-mail credentials is passed to Nodemailer module and Mailgun requires api key and domain setup to run.

All test settings are stored in `./test/settings.json` file. Before running test update it with your credentials.

Then install the dev dependencies and execute the test suite:

```
$ npm install
$ npm test
```

The tests will call all module functions and will check the sending functionality.

## License

Copyright 2015 Invatechs

Licensed under the MIT License.
