'use strict';

// Imports from node
const fs = require('fs');
const path = require('path');
const os = require('os');

// Function to load positions from a file
const loadPositions = function(filename){
  var positions = [];
  var loaded = fs.readFileSync(path.join(__dirname,filename));
  loaded = loaded.toString();
  var lines = loaded.split(os.EOL);

  lines.forEach((item, i) => {
    let entry = item.split(',');
    let obj = {};
    obj.latitude = entry[0];
    obj.longitude = entry[1];
    positions.push(obj);
  });

  positions.pop();

  return positions;
}

// Generate a timestamp
// format: 2019-06-13T16:30:00Z
const generateTimestamp = function(date){
 return date.toISOString();
 //  var string = date.getFullYear() + '-' + ("0" + (date.getMonth() + 1)).slice(-2)
 //  + '-' + ("0" + date.getDate()).slice(-2) + 'T';
 // // Fixing a given hour
 // string += ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2)
 // + ":" + ("0" + date.getSeconds()).slice(-2) +"Z";
 // return string;
}

// Function to create a random value given a range (min,max)
// and a rounder to select the number of decimals
const createRandomValue = function(min,max,rounder) {
  return Math.round(((Math.random()*(max - min)) + min) * rounder ) / rounder;
};

const roundNumber = function(num,rounder) {
  return Math.round( num * rounder ) / rounder;
};

// Function to create an item of the array
const createElement = function(id,posItem,date,base) {
  var element = {};
  element.id = id;
  element.timestamp = generateTimestamp(date);
  element.email = "admin@dimaproject.it";
  element.temperature = roundNumber((base.temperature + createRandomValue(-0.5,0.5,10)),10);
  element.humidity = roundNumber((base.humidity + createRandomValue(-2,2,1)),1);
  element.pressure = 102700;
  element.altitude = 122;
  element.tvocs = roundNumber((base.tvocs + createRandomValue(0,5,1)),1);
  element.eco2 = roundNumber((base.eco2 + createRandomValue(0,5,1)),1);
  element.pm05 = roundNumber((base.pm05 + createRandomValue(0,.5,1)),1);
  element.pm1 = roundNumber((base.pm1 + createRandomValue(0,0.1,10)),1);
  element.pm25 = roundNumber((base.pm25 + createRandomValue(0,0.1,10)),1);
  element.pm4 = roundNumber((base.pm4 + createRandomValue(0,0.5,10)),1);
  element.pm10 = roundNumber((base.pm10 + createRandomValue(0,0.5,10)),1);
  element.latitude = posItem.latitude;
  element.longitude = posItem.longitude;
  return element;
}

// Function to create random value to simulate the board registered data
exports.simulateArduinoData = function(){
  // Variables (mandatory to fill the database)
  var data = [];
  var index = 0;

  var positions_juvara = loadPositions('positions/positions_juvara.csv');
  // Checking navigation of positions
  if(positions_juvara.length == 0){
    console.log("[DIMA]: SOMETHING is not working with positions");
    return [];
  }

  var dates = [ new Date('2020-06-01T12:00:00'),
                new Date('2020-06-02T12:00:00'),
                new Date('2020-06-03T12:00:00'),
                new Date('2020-06-04T12:00:00'),
                new Date('2020-06-05T12:00:00'),
                new Date('2020-06-06T12:00:00'),
                new Date('2020-06-07T12:00:00'),
                new Date('2020-06-08T12:00:00'),
                new Date('2020-06-09T12:00:00'),
                new Date('2020-06-10T12:00:00'), ]

  dates.forEach((itemDate, i) => {
    var base = {};
    base.temperature = createRandomValue(20,30,10);
    base.humidity = createRandomValue(10,70,1);
    base.tvocs = createRandomValue(480,600,1);
    base.eco2 = createRandomValue(280,400,1);
    base.pm05 = createRandomValue(0,10,1);
    base.pm1 = createRandomValue(0,15,1);
    base.pm25 = createRandomValue(0,20,1);
    base.pm4 = createRandomValue(0,5,1);
    base.pm10 = createRandomValue(0,25,1);

    positions_juvara.forEach((itemPos, j) => {
      data.push(createElement(index,itemPos,itemDate,base));
      index += 1;
      itemDate.setSeconds(itemDate.getSeconds()+1);
    });
  });

  var positions_pascal = loadPositions('positions/positions_poli.csv');
  // Checking navigation of positions
  if(positions_pascal.length == 0){
    console.log("[DIMA]: SOMETHING is not working with positions");
    return [];
  }

  var dates = [ new Date('2020-06-01T15:00:00'),
                new Date('2020-06-02T15:00:00'),
                new Date('2020-06-03T15:00:00'),
                new Date('2020-06-04T15:00:00'),
                new Date('2020-06-05T15:00:00'),
                new Date('2020-06-06T15:00:00'),
                new Date('2020-06-07T15:00:00'),
                new Date('2020-06-08T15:00:00'),
                new Date('2020-06-09T15:00:00'),
                new Date('2020-06-10T15:00:00'), ]

  dates.forEach((itemDate, i) => {
    var base = {};
    base.temperature = createRandomValue(20,30,10);
    base.humidity = createRandomValue(10,70,1);
    base.tvocs = createRandomValue(480,600,1);
    base.eco2 = createRandomValue(280,400,1);
    base.pm05 = createRandomValue(0,10,1);
    base.pm1 = createRandomValue(0,15,1);
    base.pm25 = createRandomValue(0,20,1);
    base.pm4 = createRandomValue(0,5,1);
    base.pm10 = createRandomValue(0,25,1);

    positions_pascal.forEach((itemPos, j) => {
      data.push(createElement(index,itemPos,itemDate,base));
      index += 1;
      itemDate.setSeconds(itemDate.getSeconds()+1);
    });
  });

  return data;
}
