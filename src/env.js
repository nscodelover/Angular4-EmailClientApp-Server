'use strict';

const moment = require('moment');

const ENV_TYPE = {
  development: "development",
  production: "production"
};

module.exports = {
  ENV_TYPE: ENV_TYPE,
  NODE_ENV: process.env.NODE_ENV || ENV_TYPE.development,
  port: 8087,
  url: "localhost",
  priv_key: "key.pem",
  pub_key: "server.crt",
  frontend_url: "https://localhost:4200",
  data_source_url: "postgres://kgmsoft@localhost:5432/crm",
  post_address: "ma.team.pilot@gmail.com",
  mail_service: "gmail",
  post_password: "PASSWORD",
  post_sender_title: "MA TEAM",
  scheduler: {
    trial_period_check_interval_in_minutes: "10"
  }
};

module.exports.trial_period_interval_in_ms = moment.duration({
  seconds: 0,
  minutes: 0,
  hours: 0,
  days: 0,
  weeks: 0,
  months: 1,
  years: 0
}).asMilliseconds();
