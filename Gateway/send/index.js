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
var Client = require('azure-iot-device').Client;
var Message = require('azure-iot-device').Message;

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
			client.complete(msg, printResultFor('completed'));
		});
		//var contatore = 0;
		//lunghezza della coda di redis
		clientRedis.llen("dati", function (err, data) {
			console.log("Lunghezza coda ", data);
			lunghezza_coda = data;
		});

		function waitForPush() {//funzione che attende che la coda redis abbia qualcosa al suo interno
			clientRedis.brpop(['dati', 0], function (listName, item) { //prendo i dati e li elimino dalla coda
				if (item[1] != null) { //controllo di non inviare elementi vuoti
					console.log(item[1]);
					var message = new Message(item[1]); //invio il messaggio
					client.sendEvent(message/*, printResultFor('send')*/);
				}
				process.nextTick(waitForPush);
			});
		}
		waitForPush();


		client.on('error', function (err) {
			console.error(err.message);
		});

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
