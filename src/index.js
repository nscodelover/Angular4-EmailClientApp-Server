'use strict';

const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const fs = require('fs');
const https = require('https');
const app = express();
const env = require('./env');
const passport = require('passport');
const authController = require('./controller/auth');
const mainController = require('./controller/main');
const rootRouter = express.Router();
const routes = require("./routes");
const morgan = require('morgan');
const errorhandler = require('errorhandler');
const appStarter = require('./app/app-starter');

/* Load https certificates */
var https_options = {
  key: fs.readFileSync(env.priv_key, 'utf8'),
  cert: fs.readFileSync(env.pub_key, 'utf8')
};

console.info(`Environment: ${env.NODE_ENV}`);
app.use(morgan('combined'));

app.use(bodyParser.json());
app.use(mainController.addHeaders);
passport.use(authController.localStrategy);
app.use(passport.initialize());
app.use(passport.session());

routes(rootRouter);
app.use('/', rootRouter);

env.NODE_ENV === env.ENV_TYPE.development ? app.use(errorhandler({dumpExceptions: true, showStack: true}))
  : app.use(mainController.errorHandler);


appStarter.start().then(() => {
  https.createServer(https_options, app).listen(env.port, env.url);

  /* Start https server */
  console.info("Server is running on port: " + env.port);
});
