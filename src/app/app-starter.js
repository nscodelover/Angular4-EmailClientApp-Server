'use strict';

const {sequelize} = require('../model/data-source');
const Config = require('../model/config');
const userData = require('./data/user');

const APPLICATION_INITIALIZATION_KEY = "app.initialized";

function initialize(taskKey, initializationFunc) {
  let initializationKey = `${APPLICATION_INITIALIZATION_KEY}.${taskKey}`;
  return new Promise((resolve, reject) => {
    Config.findByKey(initializationKey).then(key => {
      if (!key || !key.value) {
        initializationFunc().then(() => Config.save({key: initializationKey, value: 1})).then(resolve).catch(reject);
      }
      resolve();
    });
  })
}

module.exports.start = function () {
  return sequelize.sync({force: false}).then(() => {
    return Promise.all([
      initialize('user', userData.init.bind(userData))
    ]);
  });
};
