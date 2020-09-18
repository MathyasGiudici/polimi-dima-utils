'use strict';

// Import
const argon2 = require('argon2');
const {generateJWT} = require('./AuthService');

let sqlDatabase;

// Initial user loaded in the database
const initialUser = async function() {
  const passwordHashed = await argon2.hash("passwordSegret@130");
  return {
    email : "admin@dimaproject.it",
    firstName : "Admin",
    lastName : "Dima Project",
    password : passwordHashed,
    gender : "female",
    birthDay : "1990-07-21",
  };
}

/**
* Init of users' table
**/
exports.usersInit = function(database){
  sqlDatabase = database;
  sqlDatabase.schema.hasTable("users").then( exists => {
    if(!exists){
      console.log("[DIMA]: Creating Users' table");
      sqlDatabase.schema.createTable("users", table => {
        table.string("email").primary();
        table.string("firstName");
        table.string("lastName");
        table.string("password");
        table.enum("gender",["female","male"]);
        table.date("birthDay");
      }).then( () => {
        console.log("[DIMA]: Filling Users' table");
        return Promise.all([initialUser()]).then( obj => {
          return sqlDatabase("users").insert(obj);
        });
      });
    }
    else{
      return true;
    }
  });
}

/**
* Delete a specific user
*
* email String Email of the user to delete
* returns String
**/
exports.deleteUserMe = function(email) {
  return sqlDatabase("users").where("email",email).del().then(function(response){
    if(response){
      return {response: email};
    } else {
      return {response: "Something gets wrong"};
    }
  });
}


/**
* Get user with email
*
* email String Email of the user to look for
* returns User
**/
exports.getUserMe = function(email) {
  return sqlDatabase("users").where("email",email).select().then(
    data => {
      return data.map( e => {
        delete e.password;
        return e;
      });
    }).then( data => {return data[0];});
}


/**
* Login with a form
*
* email String
* password String
* no response value expected for this operation
**/
exports.postUserLogin = async function(email,password) {
  return sqlDatabase("users").where("email",email).select().then(async function(data) {
    // Checking if the user exists
    if(data.length == 0)
      return {response: "You must be register"};

    var user = data[0];
    // Checking the password
    const correctPassword = await argon2.verify(user.password, password);
    // Correctness of the password
    if(correctPassword){
      delete user.password;
      return {response: "Successful login",
              user: user,
              token: generateJWT(user)};
    }
    else
      return {response: "Password is wrong"};
  });
}


/**
* Register into the store
*
* email String
* no response value expected for this operation
**/
exports.postUserRegister = async function(body) {
  return sqlDatabase("users").where("email",body.email).select().then(async function(data) {
    // Checking if the user exists
    if(data.length != 0)
      return {response: "You are already register"};

    const passwordHashed = await argon2.hash(body.password);
    body.password = passwordHashed;

    return sqlDatabase("users").insert(body).then(
      data => {
        return sqlDatabase("users").where("email",body.email).select().then(
          data => {
            return data.map( e => {
              delete e.password;
              return e;
            });
          }).then( data => {return data[0];});
      });
  });
}


/**
* Update a specific user
*
* email String Email of the user to modify
* returns User
**/
exports.putUserMe = async function(body) {
  // Checking if the password must be changhed or not
  if(body.password != ""){
    const passwordHashed = await argon2.hash(body.password);
    body.password = passwordHashed;
    return sqlDatabase("users").where("email",body.email).update(body).then(
       data => {
         return sqlDatabase("users").where("email",body.email).select().then(
            data => {
              return data.map( e => {
                 delete e.password;
                 return e;
              });
            }).then( data => {return data[0];});
      });
  } else {
    return sqlDatabase("users").where("email",body.email).select().then( myUser => {
      body.password = myUser[0].password;
      return sqlDatabase("users").where("email",body.email).update(body).then(
         data => {
           return sqlDatabase("users").where("email",body.email).select().then(
              data => {
                return data.map( e => {
                   delete e.password;
                   return e;
                });
              }).then( data => {return data[0];});
        });
    });
  }
}
