'use strict';

const {sequelize} = require('./data-source');
const Sequelize = require('sequelize');
const User = require('./user');


const AccessToken = sequelize.define('access_token', {
  id: {primaryKey: true, type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4},
  value: {type: Sequelize.STRING, field: 'value'},
  userId: {
    type: Sequelize.UUID,
    field: 'user_id',
    references: {
      model: User.Model,
      key: 'id',
      unique: true,
      deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
    }
  },
  createdAt: {type: Sequelize.DATE, field: 'created_at'},
  updatedAt: {type: Sequelize.DATE, field: 'updated_at'}
}, {
  freezeTableName: true
});

module.exports.findByUserId = function (userId) {
  return AccessToken.findOne({where: {userId: userId}});
};

module.exports.save = function (userId, value) {
  return AccessToken.findOrCreate({
    where: {userId: userId}, defaults: {
      userId: userId,
      value: value,
    }
  }).then((res) => {
    let token = res[0];
    token.value = value;
    return token.save();
  });
};

module.exports.clearUserSession = function (userIds, transaction) {
  userIds = typeof userIds === 'string' ?  [userIds] : userIds;
  return AccessToken.destroy({where: {userId: {$in: userIds}}, transaction: transaction});
};

module.exports.Model = AccessToken;