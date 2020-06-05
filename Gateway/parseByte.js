const SerialPort = require('serialport')
const ByteLength = require('@serialport/parser-byte-length')
const port = new SerialPort('/dev/ttyS0')

const parser = port.pipe(new ByteLength({length:3 }))
parser.on('data', parseMsg) // will have 8 bytes per data event

const gatewayDef = '1111';

function parseMsg(data){
        console.log(data[1]);

        let msgSize = data.lenght;

	let byte0 = parseInt(data[0],10).toString(2).padStart(8,'0');
        let byte1 = parseInt(data[1],10).toString(2).padStart(8,'0');
        let byte2 = parseInt(data[2],10).toString(2).padStart(8,'0');


	console.log("byte 1 ",byte0); //incrocio
	console.log("byte 2 ",byte1); //valore
	console.log("byte 3 ",byte2); //gateway + id sensore
	console.log("---------------");

	let gateway = byte2.substring(0,4); //prende i primi 4 bit
        let sensore = byte2.substring(4);  //prende il resto dei bit

	console.log(gateway);

	if(gateway == '1111'){
	

	}
}



