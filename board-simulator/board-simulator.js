// Imports
const http = require('http');
const fs = require('fs');
const os = require('os');

// Bool to add or not position in the simulation
const add_position = true;

// Global constants
const sep = ";";
const port = 3000;
var host = 'localhost';

var ifaces = os.networkInterfaces();

Object.keys(ifaces).forEach(function (ifname) {
  var alias = 0;

  ifaces[ifname].forEach(function (iface) {
    if ('IPv4' !== iface.family || iface.internal !== false) {
      // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
      return;
    }

    if (alias >= 1) {
      // this single interface has multiple ipv4 addresses
      console.log(ifname + ':' + alias, iface.address);
    } else {
      // this interface has only one ipv4 adress
      console.log(ifname, iface.address);
    }
    host = iface.address;
    ++alias;
  });
});

// Global variables
var index = 0;
var positions = [];

// Function to load positions from a file
const loadPositions = function(){
  var loaded = fs.readFileSync('positions/positions_juvara.csv');
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
};

// Function to create a random value given a range (min,max)
// and a rounder to select the number of decimals
const createRandomValue = function(min,max,rounder) {
  return Math.round(((Math.random()*(max - min)) + min) * rounder ) / rounder;
};

const roundNumber = function(num,rounder) {
  return Math.round( num * rounder ) / rounder;
};

let temperature_base = createRandomValue(20,30,10);
let humidity_base = createRandomValue(10,70,1);
let tvocs_base = createRandomValue(480,600,1);
let eco2_base = createRandomValue(280,400,1);
let pm05_base = createRandomValue(0,10,1);
let pm1_base = createRandomValue(0,15,1);
let pm25_base = createRandomValue(0,20,1);
let pm4_base = createRandomValue(0,5,1);
let pm10_base = createRandomValue(0,25,1);


// Function to create random value to simulate the board
const createValues = function() {
  let temperature = roundNumber((temperature_base + createRandomValue(-0.5,0.5,10)),10);
  let humidity = roundNumber((humidity_base + createRandomValue(-2,2,1)),1);
  let pressure = 102700;
  let altitude = 122;
  let tvocs = roundNumber((tvocs_base + createRandomValue(0,5,1)),1);
  let eco2 = roundNumber((eco2_base + createRandomValue(0,5,1)),1);
  let pm05 = roundNumber((pm05_base + createRandomValue(0,.5,1)),1);
  let pm1 = roundNumber((pm1_base + createRandomValue(0,0.1,10)),1);
  let pm25 = roundNumber((pm25_base + createRandomValue(0,0.1,10)),1);
  let pm4 = roundNumber((pm4_base + createRandomValue(0,0.5,10)),1);
  let pm10 = roundNumber((pm10_base + createRandomValue(0,0.5,10)),1);
  let pos = {
    latitude : 0.0,
    longitude : 0.0
  };

  // Checking navigation of positions
  if(positions.length == 0){
    console.log('SOMETHING is not working with positions');
  } else {
    // End of positions -> go back
    if(positions.length == index)
      index = 0;

    pos.latitude = positions[index].latitude;
    pos.longitude = positions[index].longitude;
    index += 1;
  }

  let toReturn = new String(temperature).concat(sep,humidity,sep,
    pressure,sep,altitude,sep,tvocs,sep,eco2,sep,pm05,sep,
    pm1,sep,pm25,sep,pm4,sep,pm10);

  if(add_position)
    toReturn = new String(toReturn).concat(sep,pos.latitude,sep,pos.longitude);

  console.log('DATA: ',toReturn);

  return toReturn;
};

// Loading positions
loadPositions();

// Creation of the server
const server = http.createServer(function(request, response) {
  if (request.method == 'POST') {
    // Logger
    console.log('POST');

    // Body handling
    var body = ''
    request.on('data', function(data) { body += data });

    // Response handling
    request.on('end', function() {
      response.writeHead(200, {'Content-Type': 'text/plain'})
      response.end('POST received')
    });
  } else {
    // Logger
    console.log('GET')

    // Response handling
    response.writeHead(200, { "Content-type": "text/plain" });
    response.end(createValues());
  }
})

server.listen(port, host)
console.log(`Listening at http://${host}:${port}`)
