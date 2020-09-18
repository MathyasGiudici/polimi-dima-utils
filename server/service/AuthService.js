'use strict';
// Imports
const jwt = require('jsonwebtoken');
var fs = require('fs');

var signature;

if (process.env.AUTHSIGN != undefined)
  signature = process.env.AUTHSIGN;
else
  signature = "I2kpDZ2oiH8e68eYblD7TEoko7JbXwGp";

// Function to create the token
exports.generateJWT = function(user){
  const dataString = JSON.stringify(user);
  const expiration = '48h';
  return jwt.sign({data: dataString}, signature, { expiresIn: expiration });
}

// Function to get the token from the header
const getTokenFromHeader = (req) => {
  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
    if(req.headers.authorization.split(' ')[1] == null)
      return jwt.sign({data: 'TokenExpiredError'}, signature);
    else
      return req.headers.authorization.split(' ')[1];
  }
  else{
    return jwt.sign({data: 'TokenExpiredError'}, signature);
  }
}

// Function to decode the token
exports.decodeJWT = (req) => {
  var decoded = jwt.verify(getTokenFromHeader(req), signature);

  // Handling expiration
  if(decoded.data == 'TokenExpiredError')
    return {name:'TokenExpiredError'};

  return {
    user: JSON.parse(decoded.data),
    token: getTokenFromHeader(req)
  };
}
