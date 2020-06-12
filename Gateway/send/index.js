// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

const redis = require("redis");
let redisNotReady = true;
let clientRedis = redis.createClient({
    host: '127.0.0.1',
    port: 6379
});
clientRedis.on("error", (err) => {
   console.log("error", err)
});
clientRedis.on("connect", (err) => {
    console.log("redis_connect");
});

clientRedis.on("ready", (err) => {
   	console.log("redis_ready");
	 redisNotReady = false;
});


'use strict';

var Protocol = require('azure-iot-device-mqtt').Mqtt;
// Uncomment one of these transports and then change it in fromConnectionString to test other transports
// var Protocol = require('azure-iot-device-amqp').AmqpWs;
// var Protocol = require('azure-iot-device-http').Http;
// var Protocol = require('azure-iot-device-amqp').Amqp;
// var Protocol = require('azure-iot-device-mqtt').MqttWs;
var Client = require('azure-iot-device').Client;
var Message = require('azure-iot-device').Message; //la roba in più che arriva è qui mi sa

// String containing Hostname, Device Id & Device Key in the following formats:
//  "HostName=<iothub_host_name>;DeviceId=<device_id>;SharedAccessKey=<device_key>"
var deviceConnectionString = require('../config/gateway-config.json').deviceConnectionString;

// fromConnectionString must specify a transport constructor, coming from any transport package.
var client = Client.fromConnectionString(deviceConnectionString, Protocol);

var lunghezza_coda = 0;

var connectCallback = function (err) {
  if (err) {
    console.error('Could not connect: ' + err.message);
  } else {
    	console.log('Client connected');
	client.on('message', function (msg) {
      		//console.log('Id: ' + msg.messageId + ' Body: ' + msg.data);
      		// When using MQTT the following line is a no-op.
      		client.complete(msg, printResultFor('completed'));
  	 });
var contatore = 0 ;
//	var sendInterval = setInterval(function () {

		clientRedis.llen("dati", function(err, data)
        	{
			console.log("Lunghezza coda ",data);
 			lunghezza_coda = data;
	        });

		function waitForPush () {
			clientRedis.brpop(['dati',0], function (listName,item) {
			if(item[1] != null){
				console.log(item[1]);
		 		var message = new Message(item[1]);
                 		client.sendEvent(message/*, printResultFor('send')*/);
			}
  	  		process.nextTick(waitForPush);
 		});
	}
	waitForPush();

    // Create a message and send it to the IoT Hub every two seconds
    /*var sendInterval = setInterval(function () {
      var data = JSON.stringify({ deviceId: 'myFirstDevice', windSpeed: windSpeed, temperature: temperature, humidity: humidity });
      var message = new Message(data);
      message.properties.add('temperatureAlert', (temperature > 28) ? 'true' : 'false');
      console.log('Sending message: ' + message.getData());
      client.sendEvent(message, printResultFor('send'));
    }, 5000);*/

    client.on('error', function (err) {
      console.error(err.message);
    });

    /*client.on('message', function (msg) {
        console.log('Id: ' + msg.messageId + ' Body: ' + msg.data);
        client.complete(msg, function (err) {
          if (err) {
            console.error('complete error: ' + err.toString());
          } else {
            console.log('complete sent');
          }
        });
      });*/

    client.on('disconnect', function () {
      //clearInterval(sendInterval);
      client.removeAllListeners();
      client.open(connectCallback);
    });
  }
};


client.open(connectCallback);

// Helper function to print results in the console
function printResultFor(op) {
  return function printResult(err, res) {
    if (err) console.log(op + ' error: ' + err.toString());
    if (res) console.log(op + ' status: ' + res.constructor.name);
  };
}
