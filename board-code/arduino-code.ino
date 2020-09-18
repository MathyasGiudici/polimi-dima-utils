#include <SoftwareSerial.h>
#include <SparkFunESP8266WiFi.h>
#include <Wire.h>
#include "SparkFunBME280.h"
#include "SparkFunCCS811.h"
#include "SparkFun_Ublox_Arduino_Library.h" //http://librarymanager/All#SparkFun_Ublox_GPS
#include <MicroNMEA.h>

#define CCS811_ADDR 0x5B

SFE_UBLOX_GPS gps;
char nmeaBuffer[100];
MicroNMEA nmea(nmeaBuffer, sizeof(nmeaBuffer));

const String htmlHeader = "HTTP/1.1 200 OK\r\n"
                          "Content-Type: text/html\r\n"
                          "Connection: close\r\n\r\n"
                          "<!DOCTYPE HTML>\r\n"
                          "<html>\r\n";

//Quantities to measure
float temperature;
float humidity;
float tvoc;
float co2;
float pressure;
float altitude;
long latitude;  //measured in degree minute
long longitude; //measured in degree minute
int numberOfSatellites;


//Environmental combo sensor ccs811
CCS811 ccs(CCS811_ADDR);

//Environmental combo sensor BME280
BME280 bme;

//Server (default port 3000) used for letting react native acquire measures from the board
ESP8266Server server = ESP8266Server(3000);

//Define the client in order to ask for gnss correction
ESP8266Client client;

//Wifi SSID and credentials, for letting arduino connecting to the internet
const char mySSID[] = "<SSID to fill>";
const char myPSK[] = "<Password to fill>";

//Send a request for obtaining gnss correction data from SPIN3 Lombardia-Piemonte-Valle D'Aosta correction net.
//The destServer is the ip address of the ntrip caster, the port on which the ntrip casters listens is the 2101
const char destServer[] = "158.102.7.10";
const int port = 2101;

//This is the correction request sent by arduino (that acts as an NTRIP client). It is an http request. This request depends on the
//actual position in NMEA format
// TODO: remember to fill in the authentication field with the user token < TOKEN to fill>
String correctionRequest = "GET /RTK_MAC/MAX_RTCM3 HTTP/1.1\r\nAccept: rtk/rtcm, dgps/rtcm\r\nUser-Agent: NTRIP Client python v.1.0\r\nAuthorization: Basic <TOKEN to fill> =\r\n\r\n$GPGGA,164043.901,4528.544,N,00913.444,E,1,12,1.0,0.0,M,0.0,M,,*63\r\n\r\n";

//htmlBody of the page displayed to react native app
String htmlBody;

/*functions declarations*/
void initializeESP8266();
void connectESP8266();
void displayConnectInfo();
void serverSetup();
void sendCorrectionToI2C_GPSModule();
void updateHtmlPage();

void setup() {

  //Main Initialization
  Serial.begin(9600);
  Wire.begin();

  //Initialize environmental combo sensors
  if (ccs.begin() == false || bme.beginI2C() == false)
  {
    Serial.println("The sensor did not respond. Please check wiring.");
    while(1); //Freeze
  }

  //Initialize GPS
  if (gps.begin() == false)
  {
    Serial.println(F("Ublox GPS not detected at default I2C address. Please check wiring. Freezing."));
    while (1);
  }

  //Initialize WIfi
  initializeESP8266();
  connectESP8266();
  displayConnectInfo();
  serverSetup();

}

void loop() {


  /*Retrieve correction data*/
  connectToDestServer();
  requestCorrectionData(correctionRequest);
  closeTCPConnection();
  /*Connection data has been retrieved*/
  delay(500);

  /*@TODO: send obtained data to gps module, so that it will parse them automatically and perform the correction of the position*/
  sendCorrectionToI2C_GPSModule();

  updateHtmlPage();
  delay(1500);

}

void connectToDestServer() {

  int retVal = client.connect(destServer, 2101);
  if (retVal <= 0)
  {
    Serial.println(F("Failed to connect to server."));
    return;
  }

}

void requestCorrectionData(String correctionRequest) {

  client.print(correctionRequest);
  // available() will return the number of characters currently in the receive buffer.
  while (client.available())
    Serial.write(client.read()); // read() gets the FIFO char

}


void closeTCPConnection() {

  // connected() is a boolean return value - 1 if the
  // connection is active, 0 if it's closed.
  if (client.connected()){
    client.stop(); // stop() closes a TCP connection.
  }

}

void serverSetup() {

  // begin initializes a ESP8266Server object. It will
  // start a server on the port specified in the object's
  // constructor (in global area)
  server.begin();
  Serial.print(F("Server started! Go to "));
  Serial.println(esp8266.localIP());
  Serial.println();

}



void updateMeasures() {

  readSensors();
  htmlBody += "CO2: ";
  htmlBody += String(co2);
  htmlBody += "\nHumidity: ";
  htmlBody+= String(humidity);
  htmlBody += "\nAltitude: ";
  htmlBody+= String(altitude);
  htmlBody += "\nTVOC: ";
  htmlBody+= String(tvoc);
  htmlBody += "\nPressure: ";
  htmlBody+= String(pressure);
  htmlBody += "\nTemperature: ";
  htmlBody+= String(temperature);
  htmlBody += "\nLatitude: ";
  htmlBody+= String(latitude);
  htmlBody += "\nLongitude: ";
  htmlBody+= String(longitude);
  htmlBody += "<br>\n";
  htmlBody += "</html>\n";

}

void updateHtmlPage() {

   ESP8266Client client = server.available(500);
   boolean currentLineIsBlank = true;
   while (client.connected()) {
      if (client.available()) {
        char c = client.read();
        if (c == '\n' && currentLineIsBlank) {
           client.print(htmlHeader);
           updateMeasures();
           client.print(htmlBody);
           break;
        }
        if (c == '\n')
        {
          // you're starting a new line
          currentLineIsBlank = true;
        }
        else if (c != '\r')
        {
          // you've gotten a character on the current line
          currentLineIsBlank = false;
        }
      }
   }
   delay(2000);
   client.stop();

}

void readSensors() {

  if (ccs.dataAvailable()) {
    ccs.readAlgorithmResults();
    co2 = ccs.getCO2();
    tvoc = ccs.getTVOC();
  }
    humidity = bme.readFloatHumidity();
    pressure = bme.readFloatPressure();
    altitude = bme.readFloatAltitudeMeters();
    temperature = bme.readTempC();

    latitude = nmea.getLatitude();
    longitude = nmea.getLongitude();
    numberOfSatellites = nmea.getNumSatellites();
}

//@todo
void sendCorrectionToI2C_GPSModule(){

}


/*###########################################################################################*/


/*Factory code, leave as it is*/
void initializeESP8266()
{
  int test = esp8266.begin();
  if (test != true)
  {
    Serial.println(F("Error talking to ESP8266."));
    errorLoop(test);
  }
  Serial.println(F("ESP8266 Shield Present"));
}

/*Factory code, leave as it is*/
void connectESP8266()
{

  int retVal = esp8266.getMode();
  if (retVal != ESP8266_MODE_STA)
  {
    retVal = esp8266.setMode(ESP8266_MODE_STA);
    if (retVal < 0)
    {
      Serial.println(F("Error setting mode."));
      errorLoop(retVal);
    }
  }
  Serial.println(F("Mode set to station"));

  // esp8266.status() indicates the ESP8266's WiFi connect
  // status.
  // A return value of 1 indicates the device is already
  // connected. 0 indicates disconnected. (Negative values
  // equate to communication errors.)
  retVal = esp8266.status();
  if (retVal <= 0)
  {
    Serial.print(F("Connecting to "));
    Serial.println(mySSID);
    // esp8266.connect([ssid], [psk]) connects the ESP8266
    // to a network.
    // On success the connect function returns a value >0
    // On fail, the function will either return:
    //  -1: TIMEOUT - The library has a set 30s timeout
    //  -3: FAIL - Couldn't connect to network.
    retVal = esp8266.connect(mySSID, myPSK);
    if (retVal < 0)
    {
      Serial.println(F("Error connecting"));
      errorLoop(retVal);
    }
  }
}

/*Factory code, leave as it is*/
void displayConnectInfo()
{
  char connectedSSID[24];
  memset(connectedSSID, 0, 24);
  // esp8266.getAP() can be used to check which AP the
  // ESP8266 is connected to. It returns an error code.
  // The connected AP is returned by reference as a parameter.
  int retVal = esp8266.getAP(connectedSSID);
  if (retVal > 0)
  {
    Serial.print(F("Connected to: "));
    Serial.println(connectedSSID);
  }

  // esp8266.localIP returns an IPAddress variable with the
  // ESP8266's current local IP address.
  IPAddress myIP = esp8266.localIP();
  Serial.print(F("My IP: ")); Serial.println(myIP);
}

/*Factory code, leave as it is*/
void SFE_UBLOX_GPS::processNMEA(char incoming)
{
  //Take the incoming char from the Ublox I2C port and pass it on to the MicroNMEA lib
  //for sentence cracking
  nmea.process(incoming);
}

void errorLoop(int error)
{
  Serial.print(F("Error: ")); Serial.println(error);
  Serial.println(F("Looping forever."));
  for (;;)
    ;
}
