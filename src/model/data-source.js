'use strict';

const Sequelize = require('sequelize');
const env = require('../env');

module.exports.sequelize = new Sequelize(env.data_source_url, { logging: env.NODE_ENV === env.ENV_TYPE.development });