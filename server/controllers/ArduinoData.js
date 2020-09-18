'use strict';

var utils = require('../utils/writer.js');
var ArduinoData = require('../service/ArduinoDataService');

const {decodeJWT} = require('../service/AuthService');

module.exports.getData = function getData (req, res, next) {
  //Extract session
  var session = decodeJWT(req);

  // Checking if it is the correct one
  if((!session) || session.name == 'TokenExpiredError')
  {
    return utils.unauthorizeAction(res);
  }

  var offset = req.swagger.params['offset'].value;
  var limit = req.swagger.params['limit'].value;
  ArduinoData.getData(offset,limit)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.getDataByDate = function getDataByDate (req, res, next) {
  //Extract session
  var session = decodeJWT(req);

  // Checking if it is the correct one
  if((!session) || session.name == 'TokenExpiredError')
  {
    return utils.unauthorizeAction(res);
  }

  var startDate = req.swagger.params['startDate'].value;
  var endDate = req.swagger.params['endDate'].value;
  ArduinoData.getDataByDate(startDate,endDate)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.postData = function postData (req, res, next) {
  //Extract session
  var session = decodeJWT(req);

  // Checking if it is the correct one
  if((!session) || session.name == 'TokenExpiredError')
  {
    return utils.unauthorizeAction(res);
  }

  var body = req.swagger.params['body'].value;
  ArduinoData.postData(body,session.user.email)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
