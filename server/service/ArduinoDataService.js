'use strict';

let sqlDatabase;
let {simulateArduinoData} = require("../utils/DataServiceUtils");

// Generate a timestamp
// format: 2019-06-13T16:30:00Z
const generateTimestamp = function(){
  var date = new Date();
  // Setting current date
 //  var string = date.getFullYear() + '-' + ("0" + (date.getMonth() + 1)).slice(-2)
 //  + '-' + ("0" + date.getDate()).slice(-2) + 'T';
 // // Fixing a given hour
 // string += ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2)
 // + ":" + ("0" + date.getSeconds()).slice(-2) +"Z";
 // return string;
 return date.toISOString();
}

// Parser for ArduinoData
const arduinoDataParser = function(body){
  // Object
  let data = {
    temperature: 0,
    humidity: 0,
    pressure: 0,
    altitude: 0,
    tvocs: 0,
    eco2: 0,
    pm05: 0,
    pm1: 0,
    pm25: 0,
    pm4: 0,
    pm10: 0,
    latitude: 0,
    longitude: 0,
  };
  // Splitting body of the post
  let array = body.split(';');
  // Creating data object keys
  var keys = Object.keys(data);
  // Looping on keys to update the values
  keys.forEach((item, i) => {
    data[item] = array[i];
  });

  data.timestamp = generateTimestamp();

  return data;
}

/**
* Init of all arduino data
**/
exports.dataInit = function(database){
  sqlDatabase = database;
  sqlDatabase.schema.hasTable("data").then( exists => {
    if(!exists){
      console.log("[DIMA]: Creating Data's table");
      sqlDatabase.schema.createTable("data", table => {
        table.increments("id");
        table.datetime("timestamp");
        table.text("email");
        table.float("temperature");
        table.float("humidity");
        table.float("pressure");
        table.float("altitude");
        table.float("tvocs");
        table.float("eco2");
        table.float("pm05");
        table.float("pm1");
        table.float("pm25");
        table.float("pm4");
        table.float("pm10");
        table.float("latitude");
        table.float("longitude");
      })
      .then( () => {
        // Filling the database
        console.log("[DIMA]: Filling Data's table");
        return Promise.all(simulateArduinoData()).then( obj => {
          return sqlDatabase("data").insert(obj);
        });
      });
    }
    else{
      return true;
    }
  });
}

/**
* Get all arduino data
*
* returns List
**/
exports.getData = function(offset,limit) {
  return sqlDatabase("data").limit(limit).offset(offset).select();
}


/**
* Get all arduino data
*
* startDate date Start date for the filter
* endDate date End date for the filter
* returns List
**/
exports.getDataByDate = function(startDate,endDate) {
  return sqlDatabase("data").whereBetween("timestamp",[startDate,endDate]).select();
}


/**
* Post a specific arduino datum
*
* body String String from arduino
* returns List
**/
exports.postData = async function(body,email) {
  var promise = new Promise(function(resolve, reject) {
    return sqlDatabase("data").max('id as maxId').first().then(maxIdQuery => {
      resolve(maxIdQuery.maxId);
    });
  });

  var max = await promise;

  var obj = arduinoDataParser(body.data);
  obj.id = parseInt(max, 10) + 1;
  obj.email = email;

  // Pushing the new object
  return sqlDatabase("data").insert(obj).then( data => {
    // Returning the object just created
    return sqlDatabase("data").where("id",obj.id).select().then( data => { return data[0];});
  });
}
