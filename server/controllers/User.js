'use strict';

var utils = require('../utils/writer.js');
var User = require('../service/UserService');

const {decodeJWT} = require('../service/AuthService');

module.exports.deleteUserMe = function deleteUserMe (req, res, next) {
  //Extract session
  var session = decodeJWT(req);

  // Checking if it is the correct one
  if((!session) || session.name == 'TokenExpiredError')
  {
    return utils.unauthorizeAction(res);
  }

  User.deleteUserMe(session.user.email)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.getUserMe = function getUserMe (req, res, next) {
  //Extract session
  var session = decodeJWT(req);

  // Checking if it is the correct one
  if((!session) || session.name == 'TokenExpiredError')
  {
    return utils.unauthorizeAction(res);
  }

  User.getUserMe(session.user.email)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.postUserLogin = function postUserLogin (req, res, next) {
  var auth = req.swagger.params['body'].value;
  User.postUserLogin(auth.email,auth.password)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.postUserLogout = function postUserLogout (req, res, next) {
  //Extract session
  var session = decodeJWT(req);

  // Checking if it is the correct one
  if((!session) || session.name == 'TokenExpiredError')
  {
    return utils.unauthorizeAction(res);
  }

  utils.writeJson(res, {response: "Successful logout"});
};

module.exports.postUserRegister = function postUserRegister (req, res, next) {
  var body = req.swagger.params['body'].value;

  User.postUserRegister(body)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.putUserMe = function putUserMe (req, res, next) {
  //Extract session
  var session = decodeJWT(req);

  // Checking if it is the correct one
  if((!session) || session.name == 'TokenExpiredError')
  {
    return utils.unauthorizeAction(res);
  }

  var body = req.swagger.params['body'].value;

  // Checking not fake modification
  if(session.user.email != body.email)
    return utils.unauthorizeAction(res);

  User.putUserMe(body)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
