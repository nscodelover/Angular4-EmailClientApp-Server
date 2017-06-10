'use strict';

const jwt = require('jsonwebtoken');
const AccessToken = require('../model/access-token');
const passport = require('passport');
const expressJwt = require('express-jwt');
const LocalStrategy = require('passport-local').Strategy;
const passwordHash = require('password-hash');
const User = require('../model/user');

const AUTH_HEADER_PREFIX = 'Bearer ';

module.exports.generateToken = function (req, res, next) {
  req.token = jwt.sign({
    id: req.user.id,
  }, 'server secret', {
    expiresIn: '7d'
  });
  AccessToken.save(req.user.id, req.token).then(() => next()).catch(next);
};

module.exports.sendAccessToken = function (req, res) {
  res.json({token: req.token});
};

module.exports.checkAccessToken = expressJwt({secret: 'server secret'});

function extractAccessToken(req) {
  let authHeader = req.get('Authorization');
  if (authHeader) {
    authHeader = authHeader.startsWith(AUTH_HEADER_PREFIX) ? authHeader.substr(AUTH_HEADER_PREFIX.length - 1)
      : authHeader;
    authHeader = authHeader.trim();
  }
  return authHeader;
}

function sendInvalidAccessTokenError(res) {
  res.status(401).send('Invalid access token');
}

module.exports.checkAccessTokenValid = function (req, res, next) {
  if (req.user) {
    let accessToken = extractAccessToken(req);
    if (accessToken) {
      AccessToken.findByUserId(req.user.id).then(validToken =>
        !validToken || accessToken !== validToken.value ? sendInvalidAccessTokenError(res) : next()).catch(next);
    } else {
      sendInvalidAccessTokenError(res);
    }
  } else {
    next();
  }
};

module.exports.serialize = function (req, res, next) {
  req.user = {
    id: req.user.id
  };
  next();
};

module.exports.authenticate = passport.authenticate('local', {session: false});

module.exports.localStrategy = new LocalStrategy({usernameField: 'username', passwordField: 'password'},
  (username, password, done) => {
  User.findByUsernameOrEmail(username).then((user) => {
    user && user.active && passwordHash.verify(password, user.password) ? done(null, user) : done(null, false);
  }).catch(done);
});

module.exports.logout = function (req, res, next) {
  AccessToken.clearUserSession(req.user.id).then(() => {
    req.logout();
    res.send();
  }).catch(next);
};

