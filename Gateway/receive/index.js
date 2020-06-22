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
const port = new SerialPort('/dev/ttyS0', { baudRate: 115200 })

const parser = port.pipe(new ByteLength({ length: 5 }))
parser.on('data', parseMsg) // will have 8 bytes per data event

const gatewayDef = 255;

let byte1 = '00';
let byte2 = '01';
let byte3 = '0A';

//port.write(byte1,'hex');
//port.write(byte2,'hex');
//port.write(byte3,'hex');

function roundToTwo(num) {
	return +(Math.round(num + "e+2") + "e-2");
}

function parseMsg(data) {
	//console.log(data);

	let msgSize = data.lenght;

	let destinatario = 255 //data[0];
	let mittente = 00 //data[1];

	let byte3 = parseInt(data[2], 10).toString(2).padStart(8, '0');
	//let byte4 = parseInt(data[3], 10).toString(2).padStart(8, '0');
	let sensore = "0010" //byte3.substring(0,4); //prende i primi 4 bit
	let strada = "0000" //byte3.substring(4);  //prende il resto dei bit
	let fascia_oraria = "11111111" //byte4.substring(0, 5);
	let valore1 = "11"; //byte4.substring(5);
	let byte5 = parseInt(data[4], 10).toString(2).padStart(8, '0');

	let valore2 = "11111111";
	let semaforo_id = 0;
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

		}

		if (sensore === "0001") {
			json = {
				"id_incrocio": mittente,
				"Sensore": sensore,
				"Coppia": strada,
				"Data": Date(Date.now()),
				"Valore": valore2
			};

		} else {
			json = {
				"id_incrocio": mittente,
				"Sensore": sensore,
				"Strada": strada,
				"Data": Date(Date.now()),
				"Fascia_Oraria": fascia_oraria,
				"Valore": roundToTwo(valore)
			};
		}

		//console.log(json);
		client.rpush("dati", JSON.stringify(json));

		client.llen("dati", function (err, data) {
			console.log("Lunghezza della lista: " + data);
		});

		//elimina l'elemento in coda e restituisce l'elemento eliminato
		/*	 client.lpop("dati", function(err, data)
			 {
					 console.log(data);
			 });
		 */
	}
	// console.log(json);
}
