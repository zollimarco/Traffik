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


//Ricezionde dati dal Devicetwin
client_iothub.on('error', function (err) {
	console.error(err.message);
});

var mittente = "FF";


function invio_dati(coppia, destinatario, semafori) {
	for (var key in coppia) {	 // per ogni valore che c'è in coppia
		var tempo = coppia[key]; //prendo il tempo
		var fascia_oraria = key.substring(5); //prendo la fascia oraria 
		var fine = (parseInt(fascia_oraria) - 1) << 3 //faccio stare la fascia oraria in 5 bit come da protocollo
		if (tempo > 2047) { 	//2047 è il numero massimo possibile avendo 11bita a disposizione
			tempo = 2047;
		}
		if (tempo < 0)	//metto a zero il tempo se il tempo è negativo
			tempo = '0';

		if (tempo > 255) { 	//se è maggiore di 255 devo splittare il valore in 2 byte differenti
			tempo = tempo.toString(2);
			fine = (fine.toString(2) & 'F8') | tempo.substring(0, 4); //trasformo fine in bianrio lo metto in and con F8 che azzera gli ultimi
			//3 bit, lo metto in or con i primi 3 bit di tempo sempre convertito in bit 
			tempo = tempo.substring(3);
			tempo = parseInt(tempo, 2).toString(16);
			fine = fine.toString(16); //riconverto in hex
		}

		if (destinatario.length < 2) 	//controllo lunghezza hex e aggiungo lo zero davanti
			port.write('0' + destinatario, 'hex');
		else
			port.write(destinatario, 'hex');

		port.write(mittente, 'hex'); //invio dati
		port.write(semafori, 'hex'); //invio dati
		fine = fine.toString(16);
		tempo = tempo.toString(16);
		if (fine.length < 2) //controllo lunghezza hex e aggiungo lo zero davanti
			port.write('0' + fine.toString(16), 'hex')
		else
			port.write(fine.toString(16), 'hex')
		if (tempo.length < 2) //controllo lunghezza hex e aggiungo lo zero davanti
			port.write('0' + tempo, 'hex');
		else
			port.write(tempo, 'hex');

	}
}


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
			console.log(JSON.stringify(delta)); //visualizzo il json che mi arriva
			var coppia0 = delta.Config.coppia0;  //prendo la coppia di semafori 1 e 3
			var coppia1 = delta.Config.coppia1;  //prendo la coppia di semafori 2 e 4
			var destinatario = delta.Config.IdIncrocio.toString(16); //prendo il destinatario e lo converto in esadecimale

			invio_dati(coppia0, destinatario, '00');
			invio_dati(coppia1, destinatario, '01');

			/*for (var key in coppia1) {
				var tempo = coppia1[key].toString(16);
				var fascia_oraria = key.substring(5);
				var fine = (parseInt(fascia_oraria) - 1) << 3
				if (tempo < 0)
					tempo = '0';
				if (destinatario.length < 2)
					port.write('0' + destinatario, 'hex');
				else
					port.write(destinatario, 'hex');

				port.write(mittente, 'hex');
				port.write('01', 'hex');
				fine = fine.toString(16);
				if (fine.length < 2)
					port.write('0' + fine.toString(16), 'hex')
				else
					port.write(fine.toString(16), 'hex')
				if (tempo.length < 2)
					port.write('0' + tempo, 'hex');
				else
					port.write(tempo, 'hex');

			}*/

		});


	});
});


//Ricezione dati dal PIC
//funzione per arrotondare a due cifre dopo la virgola
function roundToTwo(num) {
	return +(Math.round(num + "e+2") + "e-2");
}

function parseMsg(data) { //ricevo i dati dal PIC
	//console.log(data);
	var date = (new Date()).toISOString().split('T')[0]; //prendo la data di oggi

	//let msgSize = data.lenght;
	//salvataggio dei dati 
	let destinatario = data[0];
	let mittente = data[1];
	let byte3 = parseInt(data[2], 10).toString(2).padStart(8, '0');
	let byte4 = parseInt(data[3], 10).toString(2).padStart(8, '0');
	let sensore = byte3.substring(0, 4); //prende i primi 4 bit
	let strada = (parseInt(byte3.substring(4), 2) + 1);  //prende il resto dei bit
	let fascia_oraria = parseInt(byte4.substring(0, 5), 2);
	let valore1 = byte4.substring(5);
	let byte5 = parseInt(data[4], 10).toString(2).padStart(8, '0');
	let valore2 = byte5;
	//let semaforo_id = mittente;
	let json = {};
	let valore = 0;
	fascia_oraria += 1;

	if (destinatario === gatewayDef) { //controllo che il dato sia per il gateway

		valore = parseInt(valore1 + valore2, 2); //sommo i 2 valori che si trovano su 2 byte differenti e ne creo uno

		if (sensore === "0010") { //faccio la scalatura della temperatura da 0 a 100 poi tolgo 40 per avere anche dei dati sotto zero
			let valoremin = 0;
			let valoremax = 1023;
			let A = 0;
			let B = 100;

			valore = ((valore - valoremin) * (B - A)) / ((valoremax - valoremin) + A);

			valore = valore - 40; //per andare sotto zero
			sensore = "Temperatura";
		}
		switch (sensore) { //converdo da binario a valori leggibili
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

		json = { //jsno da inviare alla coda di redis
			"id_incrocio": mittente,
			"Sensore": sensore,
			"Strada": strada,
			"Data": date,
			"Fascia_Oraria": fascia_oraria,
			"Valore": roundToTwo(valore)
		};

		console.log(json);

		client.rpush("dati", JSON.stringify(json)); //carico i dati nella coda di redis

		client.llen("dati", function (err, data) { //mi restituisce la lunghezza della coda
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
