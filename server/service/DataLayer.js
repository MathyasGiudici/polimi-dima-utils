// Importing knex
const sqlDbFactory = require('knex');
// Importing tables init functions
var {dataInit} = require("./ArduinoDataService");
var {usersInit} = require("./UserService");

// Creating the db
var database;

// Parameters
const parametersServer = {
  debug: false,
  client: 'pg',
  connection: process.env.DATABASE_URL ,
  ssl: true
};


const getParametersDebug = function(params){
  // Loading parameters from file
  var fs = require('fs');
  var file = fs.readFileSync('./server/secret/db.json');
  var parametersDebug;

  try {
    parametersDebug = JSON.parse(file);
  } catch (e) {
    parametersDebug = params;
  }

  return parametersDebug;
}

// Function to Initialize the db in knex
exports.databaseInit = async function(){
  console.log("[DIMA]: Creating the DB");
  var isDebug = (process.env.DATABASE_URL === undefined);

  database = sqlDbFactory(isDebug ? getParametersDebug(parametersServer) : parametersServer);

  console.log("[DIMA]: Creating the tables");
  var tablePromise = Promise.all([dataInit(database),usersInit(database)]);

  await tablePromise;
}
