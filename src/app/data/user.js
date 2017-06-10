'use strict';

const User = require('../../model/user');

module.exports.init = function () {
  return User.save({
    username: 'admin',
    email: 'ma.team.pilot@gmail.com',
    displayName: 'Eric Smith',
    firstName: "Eric",
    lastName: "Smith",
    active: true,
    password: 'qwerty123'
  });
};

