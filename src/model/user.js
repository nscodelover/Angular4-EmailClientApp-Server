'use strict';

const {sequelize} = require('./data-source');
const Sequelize = require('sequelize');
const passwordHash = require('password-hash');
const passwordGenerator = require('generate-password');
const {prepareForClient} = require('./utils');
const _ = require('lodash');

const User = sequelize.define('user', {
    id: {primaryKey: true, type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4},
    username: {type: Sequelize.STRING, unique: true},
    email: {type: Sequelize.STRING, unique: true},
    phone: {type: Sequelize.STRING},
    firstName: {type: Sequelize.STRING, field: 'first_name'},
    lastName: {field: 'last_name', type: Sequelize.STRING},
    displayName: {field: 'display_name', type: Sequelize.STRING},
    company: {type: Sequelize.STRING},
    jobTitle: {field: 'job_title', type: Sequelize.STRING},
    employeeNumber: {field: 'employee_number', type: Sequelize.INTEGER},
    businessType: {field: 'business_type', type: Sequelize.STRING},
    location: {type: Sequelize.STRING},
    password: {type: Sequelize.STRING},
    active: {type: Sequelize.BOOLEAN},
    expires: {type: Sequelize.DATE},
    createdAt: {type: Sequelize.DATE, field: 'created_at'},
    updatedAt: {type: Sequelize.DATE, field: 'updated_at'}
  },
  {freezeTableName: true});

const userFields = ['id', 'username', 'email', 'firstName', 'lastName', 'displayName', 'active', 'password'];

module.exports.loadAll = function () {
  return User.findAll({attributes: userFields});
};

function saveUser(user) {
  user.password = !user.id && !user.password ? passwordGenerator.generate({
    length: 20,
    numbers: true
  }) : user.password;

  if (user.password) {
    user.password = passwordHash.generate(user.password);
  } else {
    delete user["password"];
  }

  user.id = user.id ? user.id : undefined;
  user.username = user.username ? user.username.trim() : user.username;
  user.email = user.email ? user.email.trim() : user.email;
  user.displayName = `${user.firstName} ${user.lastName}`;
  return new Promise((resolve, reject) => {
    let query = {attributes: ['id']};
    if(user.username && user.email){
      query.where = {$or: [{username: user.email}, {email: user.username}]}
    } else {
      query.where = user.username ? {email: user.username} : {username: user.email};
    }
    User.findOne(query).then((otherUser) => {
      if(!otherUser || otherUser.id === user.id){
        (user.id ? User.update(user, {where: {id: user.id}}).then(() => user) : User.create(user))
          .then((user) => resolve(user)).catch(reject);
      } else {
        reject(new Error('User with this name or email is already exist'));
      }
    });
  });
}

module.exports.save = function (user) {
  return saveUser(user).then((user) => prepareForClient(user, userFields));
};

module.exports.findByUsernameOrEmail = function (usernameOrEmail = '') {
  return User.findOne({attributes: userFields, where: {$or: [{username: usernameOrEmail}, {email: usernameOrEmail}]}});
};

module.exports.findByUserId = function (id) {
  return User.findOne({attributes: userFields, where: {id: id}});
};

module.exports.activateUser = function (id, password, expires, transaction) {
  let user = {password: passwordHash.generate(password), active: true, expires: expires};
  return User.update(user, {where: {id: id}, transaction: transaction});
};

module.exports.resetPassword = function (id, password, transaction) {
  let user = {password: passwordHash.generate(password)};
  return User.update(user, {where: {id: id}, transaction: transaction});
};

module.exports.deactivateTrialUsers = function (ids, transaction) {
  return User.update({active: false, expires: null}, {where: {id: {$in: ids}}, transaction: transaction});
};

module.exports.removeUserById = function (id) {
  return User.destroy({where: {id: id}});
};

module.exports.findExpiredUsers = function (limit) {
  return User.findAll({attributes: userFields, where: {expires: {lt: new Date()}}, order: 'expires', limit: limit});
};

module.exports.Model = User;
