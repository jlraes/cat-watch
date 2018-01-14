# Cat Watch

## About
Heroku demonstration app forked from [Bear Watch](https://github.com/pozil/bear-watch).

## Prerequisite
### complete the Trailhead project: [Build an Instant Notification App](https://trailhead.salesforce.com/en/projects/workshop-platform-events)
We make use of the same settings.

### make sure you have the same version of node.js
    $ node --version
    v8.9.1

package.json --> engines --> node

    "engines": {
        "node": "8.9.x"
    }

### create a connected app in your salesforce org, and set the same values.
Login to Salesforce --> Setup --> Apps --> App Manager --> New Connected App
- **Connected App Name:** Salesforce Node Client
- **API Name:** Salesforce_Node_Client
- **Contact Email:** *your email address*
- **Enable OAuth Settings:** Yes
- **Callback URL:** https://*your-heroku-app.herokuapp.com*/auth/callback
- **Selected OAuth Scopes:** Access and manage your data (api)

Click the save button and wait for a while.
We can make use of the Consumer Key and Consumer Secret.

server/config.js --> config.sfdc --> domain, callbackUrl, consumerKey, consumerSecret, apiVersion

    config.sfdc = {
      auth : {
        domain : 'https://login.salesforce.com',    // develper edition
        callbackUrl : 'https://your-heroku-app.herokuapp.com/auth/callback',
        consumerKey : 'xxxxxxxxxxxxxxxxxxxx',
        consumerSecret : 'xxxxxxxxxx',
      },
      data : {
        apiVersion : 'v42.0'
      }
    };

### set some value as your secret key
server/config.js --> config.server --> sessionSecretKey

    config.server = {
      sessionSecretKey : 'xxxxxxxxxx'
    };

### deploy to Heroku
    $ heroku create --app your-heroku-app
    $ git add .
    $ git commit -m "initial commit"
    $ git push heroku master
    $ heroku open --app your-heroku-app

# Bear Watch

## About
Heroku demonstration app for the "Build an Instant Notification App" Trailhead project (an introduction to platform events).

This application uses the following dependencies (non-exhaustive):
- [Salesforce Node client](https://github.com/pozil/salesforce-node-client) a Node library for Force.com OAuth 2.0 authentication and data interactions.
- [Salesforce Lightning Design System](https://www.lightningdesignsystem.com) (SLDS).

## Credits
- Background image source: https://w-dog.net
- Bear footprint image source: http://icons8.com
