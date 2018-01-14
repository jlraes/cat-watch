# Cat Watch

## About
Heroku demonstration app forked from [Bear Watch](https://github.com/pozil/bear-watch).

## Prerequisite
### make sure you have the same version of node.js
    $ node --version
    v8.9.1

package.json

    "engines": {
        "node": "8.9.x"
    }

### create the Connected App in your salesforce org, and set the same value.
server/config.js --> config.sfdc --> domain, callbackUrl, consumerKey, consumerSecret, apiVersion

    config.sfdc = {
      auth : {
        domain : 'https://login.salesforce.com',
        callbackUrl : 'https://your-heroku-app.herokuapp.com/auth/callback',
        consumerKey : 'xxxxxxxxxxxxxxxxxxxx',
        consumerSecret : 'xxxxxxxxxx',
      },
      data : {
        apiVersion : 'v42.0'
      }
    };

### set a value as your secret key
server/config.js --> config.server --> sessionSecretKey

    config.server = {
      sessionSecretKey : 'xxxxxxxxxx'
    };

# Bear Watch

## About
Heroku demonstration app for the "Build an Instant Notification App" Trailhead project (an introduction to platform events).

This application uses the following dependencies (non-exhaustive):
- [Salesforce Node client](https://github.com/pozil/salesforce-node-client) a Node library for Force.com OAuth 2.0 authentication and data interactions.
- [Salesforce Lightning Design System](https://www.lightningdesignsystem.com) (SLDS).

## Credits
- Background image source: https://w-dog.net
- Bear footprint image source: http://icons8.com
