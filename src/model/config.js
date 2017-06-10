const {sequelize} = require('./data-source');
const Sequelize = require('sequelize');

const Config = sequelize.define('config', {
  id: {primaryKey: true, type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4},
  key: {type: Sequelize.STRING},
  value: {type: Sequelize.STRING},
  createdAt: {type: Sequelize.DATE, field: 'created_at'},
  updatedAt: {type: Sequelize.DATE, field: 'updated_at'}
}, {
  timestamps: true,
  underscored: true,
  freezeTableName: true
});

const configFields = ['id', 'key', 'value'];

module.exports.save = function (item) {
  return item.id ? Config.save(item,  {where: {id: item.id}}) : Config.create(item);
};

module.exports.findByKey = function (key) {
  return Config.findOne({attributes: configFields, where: {key: key}});
};