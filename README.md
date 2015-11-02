# sender-js

Simple Node.js module for sending messages by e-mail or [Slack](https://slack.com/)

## Installation

`npm install sender-js`

## Usage overview

This module provides e-mail sending functionality via Nodemailer or Mailgun modules, and supports sending messages to Slack team collaboration tool. The messages can be sent separately or by all three services simultaneously.



## Tests

To run the test suite you must provide e-mail and Mailgun credetials. E-mail credentials is passed to Nodemailer module and Mailgun requires api key and domain setup to run.

All test settings are stored in _./test/settings.json_ file. Before running test update it with your credentials.

Then install the dev dependencies and execute the test suite:

```
$ npm install
$ npm test
```

The tests will call all module functions and will check the sending functionality.

## License

Copyright 2015 Invatechs

Licensed under the MIT License.
