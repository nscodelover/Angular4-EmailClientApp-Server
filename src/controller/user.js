'use strict';

const User = require('../model/user');
const AccessToken = require('../model/access-token');
const GmailLoader = require('./gmail');

module.exports.loadAllUsers = function (req, res, next) {
  User.loadAll().then((users) => res.json(users)).catch(next);
};

function clearTokenForInactiveUser(user) {
  return new Promise((resolve, reject) => user && user.id && !user.active ?
    AccessToken.clearUserSession(user.id).then(resolve()).catch(reject) : resolve());
}

module.exports.save = function (req, res, next) {
  if (req.body) {
    clearTokenForInactiveUser(req.body).then(() => User.save(req.body)).then(user => res.json(user)).catch(next);
  } else {
    res.status(400).send("Incorrect request");
  }
};

module.exports.checkAlreadyExist = function (req, res, next) {
  let usernameOrEmail = req.body ? req.body.usernameOrEmail : '';
  let id = req.body ? req.body.currentUserId : '';
  if (usernameOrEmail) {
    User.findByUsernameOrEmail(usernameOrEmail).then(user => res.json({exist: !!user && user.id !== id})).catch(next);
  } else {
    res.status(400).send("Incorrect request");
  }
};

module.exports.remove = function (req, res, next) {
  let id = req.body ? req.body.id : '';
  if (id) {
    AccessToken.clearUserSession(id).then(() => User.removeUserById(id)).then(() => res.send()).catch(next);
  } else {
    res.status(400).send("Incorrect request");
  }
};

module.exports.loadFolders = function (req, res, next) {
  console.log('id_token: ' + req.body.id_token);
  console.log('access_token: ' + req.body.access_token);
  GmailLoader.loadFolders(req, res, next);
};

module.exports.loadMails = function (req, res, next) {
  GmailLoader.loadMails(req, res, next);
};

module.exports.loadContacts = function (req, res, next) {
  GmailLoader.loadContacts(req, res, next);
};
