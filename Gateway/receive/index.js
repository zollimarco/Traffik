var Client = require('azure-iot-device').Client;
var Protocol = require('azure-iot-device-mqtt').Mqtt;

var connectionString = 'HostName=HubForApi.azure-devices.net;DeviceId=incrocio3;SharedAccessKey=NlF0wBvOlRucJOVtipjF+tDjlPjBbohfWDPMHvVSVLE=';

var client_iothub = Client.fromConnectionString(connectionString, Protocol);

const redis = require('redis');
let redisNotReady = true;
let client = redis.createClient({
	host: '127.0.0.1',
	port: 6379
});
client.on("error", (err) => {
	console.log("error", err)
});
client.on("connect", (err) => {
	console.log("connect");
	//se si connette riceve e invia i dati
});

client.on("ready", (err) => {
	redisNotReady = false;

});

const SerialPort = require('serialport')
const ByteLength = require('@serialport/parser-byte-length')
const port = new SerialPort('/dev/ttyS0', { baudRate: 9600 })

const parser = port.pipe(new ByteLength({ length: 5 }))
parser.on('data', parseMsg) // will have 8 bytes per data event

const gatewayDef = 255;


//port.write(byte1,'hex');
//port.write(byte2,'hex');
//port.write(byte3,'hex');

//RIcezionde dati dal Devicetwin
client_iothub.on('error', function (err) {
    console.error(err.message);
});
var mittente = "FF";

// connect to the hub
client_iothub.open(function (err) {
    if (err) {
        console.error('error connecting to hub: ' + err);
        process.exit(1);
    }
    console.log('client opened');
    // Create device Twin
    client_iothub.getTwin(function (err, twin) {
        if (err) {
            console.error('error getting twin: ' + err);
            process.exit(1);
        }
        // Output the current properties
        console.log('twin contents:');
        console.log(twin.properties);
        // Add a handler for desired property changes
        twin.on('properties.desired', function (delta) {
            	console.log('new desired properties received:');
            	console.log(JSON.stringify(delta));
		var coppia0 = delta.Config.coppia0;
		var coppia1 = delta.Config.coppia1;
		var destinatario = delta.Config.IdIncrocio.toString(16);
		console.log(destinatario)
		var tempo = coppia0["verde1"].toString(16);
                        var fascia_oraria = "verde1".substring(5);
                        var fine = parseInt(fascia_oraria) << 3
                        port.write (destinatario,'hex');
                        port.write (mittente,'hex');
                        port.write ('00','hex');
                        port.write (fine.toString(16),'hex')
                        port.write (tempo,'hex');
/*


		for (var key in coppia0){
			var tempo = coppia0[key].toString(16);
			var fascia_oraria = key.substring(5);
			var fine = parseInt(fascia_oraria) << 3
			console.log(fine.toString(16));
			port.write (destinatario,'hex');
			port.write (mittente,'hex');
			port.write ('00','hex');
			port.write (fine.toString(16),'hex') 
			port.write (tempo,'hex');
		}

		for(var key in coppia1){
			var tempo = coppia1[key].toString(16);
			var fascia_oraria = key.substring(5);
                        var fine = parseInt(fascia_oraria) << 3

			port.write(destinatario,'hex');
                        port.write(mittente,'hex');
                        port.write('01','hex');
			 port.write (fine.toString(16),'hex')
			port.write(tempo,'hex');

		}
*/

		//port.write(byte1,'hex');
		//port.write(byte2,'hex');
		//port.write(byte3,'hex');

        });


    });
});


//Ricezione dati dal PIC
//funzione per arrotondare 
function roundToTwo(num) {
	return +(Math.round(num + "e+2") + "e-2");
}

function parseMsg(data) {
	//console.log(data);
	var date = (new Date()).toISOString().split('T')[0];

	let msgSize = data.lenght;

	let destinatario = data[0];
	let mittente = data[1];

	let byte3 = parseInt(data[2], 10).toString(2).padStart(8, '0');
	let byte4 = parseInt(data[3], 10).toString(2).padStart(8, '0');
	let sensore = byte3.substring(0, 4); //prende i primi 4 bit
	let strada = (parseInt(byte3.substring(4),2) + 1);  //prende il resto dei bit
	let fascia_oraria = parseInt(byte4.substring(0, 5),2);
	let valore1 = byte4.substring(5);
	let byte5 = parseInt(data[4], 10).toString(2).padStart(8, '0');
	fascia_oraria += 1;
	let valore2 = byte5;
	let semaforo_id = mittente;
	let json = {};
	let valore = 0;

	if (destinatario === gatewayDef) {

		valore = parseInt(valore1 + valore2, 2);

		if (sensore === "0010") {
			let valoremin = 0;
			let valoremax = 1023;
			let A = 0;
			let B = 100;

			valore = ((valore - valoremin) * (B - A)) / ((valoremax - valoremin) + A);

			valore = valore - 40; //per andare sotto zero
			sensore = "Temperatura";
		}
		switch (sensore) {
			case "0001":
				sensore = "Stato_Semaforo";
				break;
			case "0011":
				sensore = "Umidità";
				break;
			case "0100":
				sensore = "Pressione";
				break;
			case "0101":
				sensore = "Auto";
				break;
			case "0111":
				sensore = "Moto";
				break;
			case "0110":
				sensore = "Camion";
				break;
		}

		json = {
			"id_incrocio": mittente,
			"Sensore": sensore,
			"Strada": strada,
			"Data": date,
			"Fascia_Oraria": fascia_oraria,
			"Valore": roundToTwo(valore)
		};

		console.log(json);

		client.rpush("dati", JSON.stringify(json));

		client.llen("dati", function (err, data) {
			console.log("Lunghezza della lista: " + data);
		});

		//elimina l'elemento in coda e restituisce l'elemento eliminato
/*			 client.lpop("dati", function(err, data)
			 {
					 console.log(data);
			 });
*/		 
	}
	// console.log(json);
}
