const { EventHubConsumerClient } = require("@azure/event-hubs");
const Influx = require('influx');
const influx = new Influx.InfluxDB({
  host: "40.119.129.35",
  database: "Traffik",
  port: 8086
});
const connectionString = "Endpoint=sb://ihsuprodamres044dednamespace.servicebus.windows.net/;SharedAccessKeyName=iothubowner;SharedAccessKey=bNfWqzIU43AT2kk0IumPG9mXhVVPfDdAiPzrzFpgHL4=;EntityPath=iothub-ehub-hubforapi-3522311-cda7ebab0f";
var ConnectionPool = require('tedious-connection-pool');
var Request = require('tedious').Request
var iothub = require('azure-iothub');
var connectionString1 = 'HostName=HubForApi.azure-devices.net;SharedAccessKeyName=iothubowner;SharedAccessKey=bNfWqzIU43AT2kk0IumPG9mXhVVPfDdAiPzrzFpgHL4=';
var registry = iothub.Registry.fromConnectionString(connectionString1);


var printError = function (err) {
  console.log(err.message);
};

var connectionConfig = {
  server: 'itszolli.database.windows.net',
  userName: 'ZolliMarco',
  password: 'Vmware1!',
  options: {
    // If you are on Microsoft Azure, you need encryption:
    encrypt: true,
    database: 'ProvaTraffik'
  }
};
var TYPES = require('tedious').TYPES;

const
  http = require("http"),
  express = require("express"),
  socketio = require("socket.io");

const SERVER_PORT = 8080;

// create a new express app
const app = express();
// create http server and wrap the express app
const server = http.createServer(app);
// bind socket.io to that server
const io = socketio(server);


var poolConfig = {
  min: 2,
  max: 10,
  log: true
};


var pool = new ConnectionPool(poolConfig, connectionConfig);

pool.on('error', function (err) {
  console.error(err);
});

let onlineClients = new Set();


function onNewWebsocketConnection(socket) {
  console.info(`Socket ${socket.id} has connected.`);
  onlineClients.add(socket.id);

  socket.on("disconnect", () => {
    onlineClients.delete(socket.id);
    console.info(`Socket ${socket.id} has disconnected.`);
  });
  socket.on("GetIncroci", GetCoordinate => {
    vett = {
      "Incroci": []
    }
    inviaCoordinate();
    
  });
}


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

    io.emit("Traffik", message.body);



    let sem = -1;

    switch (Sensore) {
      case "Stato_Semaforo": {
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
        //COMMENTOOOOOOOOOOOOOOOOOOOOOOOO
        //scriviTraffico(id_incrocio, sem, Strada, Fascia_Oraria, Data_in, Sensore, Valore);
      } break;
      default: {

      }
    }
    console.log("");
  }
};



async function main() {
  console.log("IoT Hub Quickstarts - Read device to cloud messages.");

  const clientOptions = {
    // webSocketOptions: {
    //   webSocket: WebSocket,
    //   webSocketConstructorOptions: {}
    // }
  }

  // Create the client to connect to the default consumer group of the Event Hub
  const consumerClient = new EventHubConsumerClient("$Default", connectionString);

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


let writeDataStato = (id_inc, id_sem, id_strad, stat) => {



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

let vett = {
  "Incroci": []
}


function inviaCoordinate() {

  var query = registry.createQuery('SELECT * FROM devices', 100);
  var onResults = function (err, results) {
    if (err) {
      console.error('Failed to fetch the results: ' + err.message);
    } else {
      // Do something with the results
      results.forEach(function (twin) {
        if(twin.properties.desired.Config){    
       
          let id_inc = twin.properties.desired.Config.IdIncrocio;        
          let latitudine = twin.properties.desired.Config.Coordinate.latitudine;
          let longitudine =  twin.properties.desired.Config.Coordinate.longitudine;
       
          let json_obj = {
            "id_incrocio" : id_inc,
            "Latitudine" : latitudine,
            "Longitudine" : longitudine
          }
   
          vett.Incroci.push(json_obj);
          io.emit("Coordinate", vett);
          console.log(vett);
      }});

      if (query.hasMoreResults) {
        query.nextAsTwin(onResults);
      }
    }
  };

  query.nextAsTwin(onResults);

}



function startServer() {


  // example on how to serve a simple API
  app.get("/random", (req, res) => res.send(generateRandomNumber()));

  // example on how to serve static files from a given folder
  app.use(express.static("public"));

  // will fire for every new websocket connection
  io.on("connection", onNewWebsocketConnection);

  // important! must listen from `server`, not `app`, otherwise socket.io won't function correctly
  server.listen(SERVER_PORT, '0.0.0.0', () => console.info(`Listening on port ${SERVER_PORT}.`));

  // will send one message per second to all its clients
  let secondsSinceServerStarted = 0;
}

startServer();