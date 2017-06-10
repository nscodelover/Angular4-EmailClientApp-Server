'use strict';

var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');
var _ = require('lodash');

var SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'gmail-nodejs-quickstart.json';

// var google = require('googleapis');
// var GoogleAuth = require('google-auth-library');

var subject = [];

// Load client secrets from a local file.
module.exports.loadFolders = function (req, res, next) {

  /* id token verifiy
  *
  const CLIENT_ID = '765916680484-i944m8sqi5hqluirmciutggkect65miu.apps.googleusercontent.com';
  var auth = new googleAuth;
  var client = new auth.OAuth2(CLIENT_ID, '', '');
  var token = req.body.id_token;

  client.verifyIdToken(token, CLIENT_ID, function(e, login) {
        var payload = login.getPayload();
        var userid = payload['sub'];

        console.log('payload', payload);
        console.log('userid', userid);

  });
  */

  fs.readFile('client_secret.json', function processClientSecrets(err, content) {
    if (err) {
      console.log('Error loading client secret file: ' + err);
      return;
    }
    // Authorize a client with the loaded credentials, then call the Gmail API.
    authorize(JSON.parse(content), req, res, listLabels);
  });
}

module.exports.loadMails = function (req, res, next) {
  fs.readFile('client_secret.json', function processClientSecrets(err, content) {
    if (err) {
      console.log('Error loading client secret file: ' + err);
      return;
    }
    // Authorize a client with the loaded credentials, then call the Gmail API.
    authorize(JSON.parse(content), req, res, listMessages);
  });
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, req, res, callback) {
  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  var auth = new googleAuth();
  var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, function(err, token) {
    if (err) {
      getNewToken(oauth2Client, req, res, callback);
    } else {
      oauth2Client.credentials = JSON.parse(token);
      callback(oauth2Client, req, res);
    }
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized client.
 */
function getNewToken(oauth2Client, req, res, callback) {
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Authorize this app by visiting this url: ', authUrl);
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Enter the code from that page here: ', function(code) {
    rl.close();
    oauth2Client.getToken(code, function(err, token) {
      if (err) {
        console.log('Error while trying to retrieve access token', err);
        return;
      }
      oauth2Client.credentials = token;
      storeToken(token);
      callback(oauth2Client, req, res);
    });
  });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token));
  console.log('Token stored to ' + TOKEN_PATH);
}

/**
 * Lists the labels in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listLabels(auth, req, res) {
  var gmail = google.gmail('v1');
  gmail.users.labels.list({
    auth: auth,
    userId: 'me',
  }, function(err, response) {
      if (err) {
        console.log('The API returned an error: ' + err);
        return;
      }
      var labels = response.labels;
      if (labels.length == 0) {
        console.log('label', labels);
        res.status(200).json({status: 'success', content: 'No labels found.'});
      } else {
        console.log('label', labels);
        res.status(200).json({status: 'success', content: labels});
      }
    }
  );
}

/**
 * Lists the messages in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listMessages(auth, req, res) {
  subject = [];
  var pageNum = req.body.page;

  var gmail = google.gmail({ auth: auth, version: 'v1' });
  var emails = gmail.users.messages.list({
      includeSpamTrash: false,
      maxResults: 10 * pageNum,
      q: "in:" + req.body.folder,
      userId: 'me'
  }, function (err, results) {
      if (err) {
        console.log('The API returned an error: ' + err);
        return;
      }
      var messages = results.messages;
      
      if (messages == undefined || messages.length == 0) {
        var noMessage = ['No message found.'];
        res.status(200).json({status: 'success', content: noMessage});
      } else {

        var done = _.after(messages.length, function() {   
          subject.splice(0, 10 * (pageNum - 1));
          res.status(200).json({status: 'success', content: subject});
        });

        _.forEach(messages, function(message) {
          gmail.users.messages.get({
            'userId': 'me',
            'id': message.id
          }, function (err, result) {
            if (err) {
              console.log('The API returned an error: ' + err);
              return;
            }
            subject.push(result.snippet);
           
            console.log('header ||', JSON.stringify(result.payload.headers));
            console.log('subject ||', subject);
            console.log('subject length ||', subject.length);

            done();
          });     
        });
      }
    }
  );
}


