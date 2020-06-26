// Copyright (c) Microsoft Corporation.
// Licensed under the MIT Licence.

/*
  This sample demonstrates how to use the Microsoft Azure Event Hubs Client for JavaScript to 
  read messages sent from a device. Please see the documentation for @azure/event-hubs package
  for more details at https://www.npmjs.com/package/@azure/event-hubs
  For an example that uses checkpointing, follow up this sample with the sample in the 
  eventhubs-checkpointstore-blob package on GitHub at the following link:
  https://github.com/Azure/azure-sdk-for-js/blob/master/sdk/eventhub/eventhubs-checkpointstore-blob/samples/javascript/receiveEventsUsingCheckpointStore.js
*/

const { EventHubConsumerClient } = require("@azure/event-hubs");

// If using websockets, uncomment the following require statement
// const WebSocket = require("ws");

// If you need proxy support, uncomment the below code to create proxy agent
// const HttpsProxyAgent = require("https-proxy-agent");
// const proxyAgent = new HttpsProxyAgent(proxyInfo);

// Event Hub-compatible endpoint
// az iot hub show --query properties.eventHubEndpoints.events.endpoint --name {your IoT Hub name}
//const eventHubsCompatibleEndpoint = "sb://ihsuprodamres044dednamespace.servicebus.windows.net";

// Event Hub-compatible name
// az iot hub show --query properties.eventHubEndpoints.events.path --name {your IoT Hub name}
//const eventHubsCompatiblePath = "iothub-ehub-hubforapi-3522311-cda7ebab0f";

// Primary key for the "service" policy to read messages
// az iot hub policy show --name service --query primaryKey --hub-name {your IoT Hub name}
//const iotHubSasKey = "RuG5CRBhsBmuXjgohrvpDdPnP0L1GYYBIVQW/IPnXrE=";

// If you have access to the Event Hub-compatible connection string from the Azure portal, then
// you can skip the Azure CLI commands above, and assign the connection string directly here.
//const connectionString = `Endpoint=${eventHubsCompatibleEndpoint}/;EntityPath=${eventHubsCompatiblePath};SharedAccessKeyName=service;SharedAccessKey=${iotHubSasKey}`;

const Influx = require('influx');

const influx = new Influx.InfluxDB({
  host: "40.119.129.35",
  database: "Traffik",
  port: 8086
});


const connectionString = "Endpoint=sb://ihsuprodamres044dednamespace.servicebus.windows.net/;SharedAccessKeyName=iothubowner;SharedAccessKey=bNfWqzIU43AT2kk0IumPG9mXhVVPfDdAiPzrzFpgHL4=;EntityPath=iothub-ehub-hubforapi-3522311-cda7ebab0f";

var printError = function (err) {
  console.log(err.message);
};

var ConnectionPool = require('tedious-connection-pool');
var Request = require('tedious').Request


var poolConfig = {
  min: 2,
  max: 10,
  log: true
};


var connectionConfig = {
  server: 'itszolli.database.windows.net',  //update me   
  userName: 'ZolliMarco', //update me
  password: 'Vmware1!',  //update me      
  options: {
    // If you are on Microsoft Azure, you need encryption:
    encrypt: true,
    database: 'ProvaTraffik'  //update me
  }
};

var pool = new ConnectionPool(poolConfig, connectionConfig);

pool.on('error', function (err) {
  console.error(err);
});


var TYPES = require('tedious').TYPES;



// Display the message content - telemetry and properties.
// - Telemetry is sent in the message body
// - The device can add arbitrary properties to the message
// - IoT Hub adds system properties, such as Device Id, to the message.
var printMessages = function (messages) {
  for (const message of messages) {
    var date = new Date();
    console.log("Telemetry received: " + new Date(new Date().toUTCString()));
    console.log(JSON.stringify(message.body.Sensore));
    console.log(JSON.stringify(message.body));

    let id_incrocio = message.body.id_incrocio;
    let Sensore = message.body.Sensore;
    let Strada = message.body.Strada;
    let Data_in = message.body.Data;
    let Fascia_Oraria = message.body.Fascia_Oraria;
    let Valore = message.body.Valore;

    let sem = -1;

    switch (Sensore) {
      case "Stato_Semaforo": {
        //console.log("dentro stato sem");
        if (message.body.Valore === 0) {
          Valore = "V";
        }
        if (message.body.Valore === 1) {
          Valore = "G";
        }
        if (message.body.Valore === 2) {
          Valore = "R";
        }
        if (Strada === 0) {
          //console.log("dentro strada");
          writeDataStato(id_incrocio, 0, 1, Valore);
          writeDataStato(id_incrocio, 0, 3, Valore);
        }
        if (Strada === 1) {
          writeDataStato(id_incrocio, 1, 2, Valore);
          writeDataStato(id_incrocio, 1, 4, Valore);
        }

      } break;
      case "Temperatura":
      case "Umidità":
      case "Pressione": {
        //console.log("dentro meteo");
        WriteMeteo(id_incrocio, Sensore, Valore);

      } break;
      case "Auto":
      case "Moto":
      case "Camion": {

        if (Strada === 1 || Strada === 3) {
          sem = 0;
        }

        if (Strada === 2 || Strada === 4) {
          sem = 1;
        }

        WriteContatore(id_incrocio, Sensore, Valore, Fascia_Oraria, Strada, sem)
        scriviTraffico(id_incrocio, sem, Strada, Fascia_Oraria, Data_in, Sensore, Valore);
      } break;
      default: {

      }
    }

    //writeData(message.body);   


    /*console.log("Properties (set by device): ");
    console.log(JSON.stringify(message.properties));
    console.log("System properties (set by IoT Hub): ");
    console.log(JSON.stringify(message.systemProperties));*/
    console.log("");
  }
};

async function main() {
  console.log("IoT Hub Quickstarts - Read device to cloud messages.");

  // If using websockets, uncomment the webSocketOptions below
  // If using proxy, then set `webSocketConstructorOptions` to { agent: proxyAgent }
  // You can also use the `retryOptions` in the client options to configure the retry policy
  const clientOptions = {
    // webSocketOptions: {
    //   webSocket: WebSocket,
    //   webSocketConstructorOptions: {}
    // }
  };

  // Create the client to connect to the default consumer group of the Event Hub
  const consumerClient = new EventHubConsumerClient("$Default", connectionString, clientOptions);

  // Subscribe to messages from all partitions as below
  // To subscribe to messages from a single partition, use the overload of the same method.
  consumerClient.subscribe({
    processEvents: printMessages,
    processError: printError,
  });
}

main().catch((error) => {
  console.error("Error running sample:", error);
});


/*let writeData = (dati) => {
    
    var id = dati.deviceId;
    var temp = dati.temperature;
    
  influx
    .writePoints(
      [
        {
          measurement: "device01",
          tags: { deviceId: id },
          fields: { temperature: temp.toString() }
        }
      ],
      {
        database: "provaHub",
        precision: "s"
      }
    )
    .catch(err => {
      console.error("Error writing data to Influx.");
    });
};*/

let writeDataStato = (id_inc, id_sem, id_strad, stat) => {
  //console.log("dentro write data");


  influx
    .writePoints(
      [
        {
          measurement: "stato_semafori",
          tags: { id_incrocio: id_inc, id_semaforo: id_sem, id_strada: id_strad },
          fields: { stato: stat }
        }
      ],
      {
        database: "Traffik",
        precision: "s"
      }
    )
    .catch(err => {
      console.error("Error writing data to Influx.");
    });
};

let WriteMeteo = (id_inc, Sensore, valore) => {
  /*console.log("dentro write data meteo " + Sensore + " " + valore);
  console.log("Sensore: " + Sensore );
  console.log("Valore: " + valore);*/

  influx
    .writePoints(
      [
        {
          measurement: "meteo",
          tags: { id_incrocio: id_inc },
          fields: { [Sensore]: valore }
        }
      ],
      {
        database: "Traffik",
        precision: "s"
      }
    )
    .catch(err => {
      console.error("Error writing data to Influx.");
    });
};


let WriteContatore = (id_inc, Sensore, valore, Fascia_Oraria, id_strad, sem) => {
  //console.log("dentro write data meteo " + Sensore + " " + valore);
  /*console.log("id_nc: " + id_inc );
  console.log("Sensore: " + Sensore);
  console.log("valore: " + valore );
  console.log("Fascia_Oraria: " + Fascia_Oraria);
  console.log("id_strad: " + id_strad );
  console.log("sem: " + sem);*/


  influx
    .writePoints(
      [
        {
          measurement: "traffico",
          tags: { id_incrocio: id_inc, id_semaforo: sem, id_strada: id_strad, fascia: Fascia_Oraria },
          fields: { [Sensore]: valore }
        }
      ],
      {
        database: "Traffik",
        precision: "s"
      }
    )
    .catch(err => {
      console.error("Error writing data to Influx.");
    });
};

function scriviTraffico(id_inc, id_sem, id_strad, fascia, data, tipo, conteggio) {

  /*

  request = new Request("INSERT INTO [dbo].[Traffico] ([Id_incrocio],[Id_semaforo]  ,[Id_strada]  ,[Fascia_oraria]  ,[Data]  ,[Tipologia_veicolo]  ,[Conteggio]) VALUES  (@id_inc,@id_sem,@id_strad,@fascia,@data,@tipo,@conteggio);", function (err) {
    if (err) {
      console.log(err);
    }
  });

  request.addParameter('id_inc', TYPES.Int, id_inc);
  request.addParameter('id_sem', TYPES.TinyInt, id_sem);
  request.addParameter('id_strad', TYPES.TinyInt, id_strad);
  request.addParameter('fascia', TYPES.TinyInt, fascia);
  request.addParameter('data', TYPES.Date, data);
  request.addParameter('tipo', TYPES.VarChar, tipo);
  request.addParameter('conteggio', TYPES.Int, conteggio);
  request.on('row', function (columns) {
    columns.forEach(function (column) {
      if (column.value === null) {
        console.log('NULL');
      } else {
        console.log("Product id of inserted item is " + column.value);
      }
    });
  });


  connection.execSql(request);*/

  pool.acquire(function (err, connection) {
    if (err) {
      console.error(err);
    }

    //use the connection as normal
    request = new Request('INSERT INTO [dbo].[Traffico] ([Id_incrocio],[Id_semaforo]  ,[Id_strada]  ,[Fascia_oraria]  ,[Data]  ,[Tipologia_veicolo]  ,[Conteggio]) VALUES  (@id_inc,@id_sem,@id_strad,@fascia,@data,@tipo,@conteggio);', function (err) {
      if (err) {
        console.error(err);
        return;
      }


      //release the connection back to the pool when finished
      connection.release();
    });

    request.addParameter('id_inc', TYPES.Int, id_inc);
    request.addParameter('id_sem', TYPES.TinyInt, id_sem);
    request.addParameter('id_strad', TYPES.TinyInt, id_strad);
    request.addParameter('fascia', TYPES.TinyInt, fascia);
    request.addParameter('data', TYPES.Date, data);
    request.addParameter('tipo', TYPES.VarChar, tipo);
    request.addParameter('conteggio', TYPES.Int, conteggio);

    request.on('row', function (columns) {
      console.log('value: ' + columns[0].value);
    });

    connection.execSql(request);
  });

}  