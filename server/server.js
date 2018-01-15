// 3rd party dependencies
var httpClient = require("request"),
  path = require('path'),
  express = require('express'),
  session = require('express-session'),
  pgSession = require('connect-pg-simple')(session),
  SalesforceClient = require('salesforce-node-client');
  bodyParser = require('body-parser')

// App dependencies
var config = require('./config');

// Configure Salesforce client while allowing command line overrides
if (process.env.sfdcAuthConsumerKey)
  config.sfdc.auth.consumerKey = process.env.sfdcAuthConsumerKey;
if (process.env.sfdcAuthConsumerSecret)
  config.sfdc.auth.consumerSecret = process.env.sfdcAuthConsumerSecret;
if (process.env.sfdcAuthCallbackUrl)
  config.sfdc.auth.callbackUrl = process.env.sfdcAuthCallbackUrl;

var sfdc = new SalesforceClient(config.sfdc);

// Prepare command line overrides for server config
if (process.env.isHttps)
  config.server.isHttps = (process.env.isHttps === 'true');
if (process.env.sessionSecretKey)
  config.server.sessionSecretKey = process.env.sessionSecretKey;

// Setup HTTP server
var app = express();
var port = process.env.PORT || 8080;
app.set('port', port);

// Enable server-side sessions
app.use(session({
  store: new pgSession(), // Uses default DATABASE_URL
  secret: config.server.sessionSecretKey,
  cookie: {
    secure: config.server.isHttps,
    maxAge: 60 * 60 * 1000 // 1 hour
  },
  resave: false,
  saveUninitialized: false
}));

// Serve HTML pages under root directory
app.use('/', express.static(path.join(__dirname, '../public')));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

/**
*  Attemps to retrieves the server session.
*  If there is no session, redirects with HTTP 401 and an error message
*/
function getSession(request, response, isRedirectOnMissingSession) {
  var curSession = request.session;
  if (!curSession.sfdcAuth) {
    if (isRedirectOnMissingSession) {
      response.status(401).send('No active session');
    }
    return null;
  }
  return curSession;
}


/**
* Login endpoint
*/
app.get("/auth/login", function(request, response) {
  // Redirect to Salesforce login/authorization page
  var uri = sfdc.auth.getAuthorizationUrl({scope: 'api'});
  return response.redirect(uri);
});


/**
* Login callback endpoint (only called by Force.com)
*/
app.get('/auth/callback', function(request, response) {
    if (!request.query.code) {
      response.status(500).send('Failed to get authorization code from server callback.');
      return;
    }

    // Authenticate with Force.com via OAuth
    sfdc.auth.authenticate({
        'code': request.query.code
    }, function(error, payload) {
        if (error) {
          console.log('Force.com authentication error: '+ JSON.stringify(error));
          response.status(500).json(error);
          return;
        }
        else {
          // Store oauth session data in server (never expose it directly to client)
          var session = request.session;
          session.sfdcAuth = payload;

          // Redirect to app main page
          return response.redirect('/index.html');
        }
    });
});


/**
* Logout endpoint
*/
app.get('/auth/logout', function(request, response) {
  var curSession = getSession(request, response, false);
  if (curSession == null)
    return;

  // Revoke OAuth token
  sfdc.auth.revoke({token: curSession.sfdcAuth.access_token}, function(error) {
    if (error) {
      console.error('Force.com OAuth revoke error: '+ JSON.stringify(error));
      response.status(500).json(error);
      return;
    }

    // Destroy server-side session
    curSession.destroy(function(error) {
      if (error)
        console.error('Force.com session destruction error: '+ JSON.stringify(error));
    });

    // Redirect to app main page
    return response.redirect('/index.html');
  });
});


/**
* Endpoint for retrieving currently connected user
*/
app.get('/auth/whoami', function(request, response) {
  var curSession = getSession(request, response, false);
  if (curSession == null) {
    response.send({"isNotLogged": true});
    return;
  }

  // Request user info from Force.com API
  sfdc.data.getLoggedUser(curSession.sfdcAuth, function (error, userData) {
    if (error) {
      console.log('Force.com identity API error: '+ JSON.stringify(error));
      response.status(500).json(error);
      return;
    }
    // Return user data
    response.send(userData);
    return;
  });
});

/**
* Endpoint for publishing a platform event on Force.com
*/
app.post('/publish', function(request, response) {
  var curSession = getSession(request, response, true);
  if (curSession == null)
    return;

  var apiRequestOptions = sfdc.data.createDataRequest(curSession.sfdcAuth, 'sobjects/Notification__e');
  response.setHeader('Content-Type', 'text/plain');
  apiRequestOptions.body = {
    "Message__c"  : request.body.comment,
    // TODO: create new fields on salesforce org
    "Notifier__c" : request.body.notifier,
    "Email__c"    : request.body.email
  };
  apiRequestOptions.json = true;

  httpClient.post(apiRequestOptions, function (error, payload) {
    if (error) {
      console.error('Force.com data API error: '+ JSON.stringify(error));
      response.status(500).json(error);
      return;
    }
    else {
      response.send(payload.body);
      return;
    }
  });
});


app.listen(app.get('port'), function() {
  console.log('Server started: http://localhost:' + app.get('port') + '/');
});
