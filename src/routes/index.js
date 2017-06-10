const authController = require('../controller/auth');
const userController = require('../controller/user');

module.exports = (router) => {
  router.post('/login', authController.authenticate, authController.serialize,
    authController.generateToken, authController.sendAccessToken);
  router.post('/logout', authController.checkAccessToken, authController.checkAccessTokenValid, authController.logout);
  router.post('/user/already-exist', userController.checkAlreadyExist);

  router.all('/rest/*', authController.checkAccessToken, authController.checkAccessTokenValid);
  router.post('/user/mail/load-folders', userController.loadFolders);
  router.post('/user/mail/load-mails', userController.loadMails);
  router.all('/rest/user/mail/load-contacts', userController.loadContacts);

  // user
  router.get('/rest/administration/user/all', userController.loadAllUsers);
  router.post('/rest/administration/user/save', userController.save);
  router.post('/rest/administration/user/remove', userController.remove);
};
