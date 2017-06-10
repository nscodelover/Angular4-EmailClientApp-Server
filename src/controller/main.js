'use strict';

const env = require('../env');

module.exports.addHeaders = function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', env.frontend_url);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  next();
};

module.exports.errorHandler = function(err, req, res, next) {
  if(err.status && err.status === 401){
    res.status(401).send(err.message);
  } else {
    res.status(500).send('Internal server error');
  }
};