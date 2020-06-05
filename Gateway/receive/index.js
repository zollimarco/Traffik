const redis = require("redis");
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

const SerialPort = require('serialport')
const ByteLength = require('@serialport/parser-byte-length')
const port = new SerialPort('/dev/ttyS0')

const parser = port.pipe(new ByteLength({length:3 }))
parser.on('data', parseMsg) // will have 8 bytes per data event

const gatewayDef = '1111';

function parseMsg(data){
        //console.log(data[1]);

        let msgSize = data.lenght;

        let byte0 = parseInt(data[0],10).toString(2).padStart(8,'0');
        //let byte1 = parseInt(data[1],10).toString(2).padStart(8,'0');
        //let byte2 = parseInt(data[2],10).toString(2).padStart(8,'0');


        //console.log("byte 1 ",byte0); //gateway + id sensore
        //console.log("byte 2 ",byte1); //id incrocio
        //console.log("byte 3 ",byte2); //valore
        //console.log("---------------");

        let gateway = byte0.substring(0,4); //prende i primi 4 bit
        let sensore = byte0.substring(4);  //prende il resto dei bit
        var id = data[1];
        var valore = data[2];
        let json = {};

        if(gateway == '1111'){

       		if(sensore = "0010"){ 
		valore -= 20;
		}
		if(sensore = "0100"){
		valore += 870;
		}
	json = {
        "id_incrocio":id,
        "Sensore": sensore,
        "Valore":valore
        };

	client.on("ready", (err) => {
	redisNotReady = false;
        client.rpush("dati", json);

        client.llen("dati", function(err, data)
        {
                console.log("Lunghezza della lista: "+data);
        });

        //elimina l'elemento in coda e restituisce l'elemento eliminato
        client.lpop("dati", function(err, data)
        {
                console.log(data);
        });

});

        }
        console.log(json);
}
