'use strict';

var iothub = require('azure-iothub');
var connectionString = 'HostName=HubForApi.azure-devices.net;SharedAccessKeyName=iothubowner;SharedAccessKey=bNfWqzIU43AT2kk0IumPG9mXhVVPfDdAiPzrzFpgHL4=';
var registry = iothub.Registry.fromConnectionString(connectionString);
var schedule = require('node-schedule');

var j = schedule.scheduleJob('*/1 * * * *', function () {
var Connection = require('tedious').Connection;
var config = {
  server: 'pwsmartcross.database.windows.net',  //update me
  authentication: {
    type: 'default',
    options: {
      userName: 'its2020', //update me
      password: 'Projectwork2020'  //update me
    }
  },
  options: {
    // If you are on Microsoft Azure, you need encryption:
    encrypt: true,
    database: 'smartcross'  //update me
  }
};
var connection = new Connection(config);
connection.on('connect', function (err) {
  // If no error, then good to proceed.  
  console.log("Connected");
  executeStatement();
});

var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;

function executeStatement() {
  var request = new Request("SELECT Id_semaforo,Fascia_oraria,Valore_tempo FROM [dbo].[Temporizzazione] WHERE Id_incrocio = 3;", function (err) {
    if (err) {
      console.log(err);
    }
  });
  var i = -1;
  var idSemaforo = null;
  var fasciaOraria = null;
  var valore = null;
  var result = "";
  request.on('row', function (columns) {
    columns.forEach(function (column) {
      i += 1;
      if (column.value === null) {
        console.log('NULL');
      } else {
        result += column.metadata.colName + ": " + column.value + ",";
        if (i === 0) {
          idSemaforo = column.value;
        }
        if (i === 1) {
          fasciaOraria = column.value;
        }
        if (i === 2) {
          valore = column.value;
          addTempo(idSemaforo, fasciaOraria, valore);
          i = -1;
        }
      }
    });
    result = "";
  });

  request.on('done', function (rowCount, more) {
    console.log(rowCount + ' rows returned');
  });
  connection.execSql(request);

  registry.getTwin('incrocio3', function (err, twin) {
    if (err) {
      console.error(err.constructor.name + ': ' + err.message);
    } else {
      var patch = {
        properties: {
          desired: {
            Config: {
              coppia0: {
                verde1: temporizzazioni[0].valore_tempo,
                verde2: temporizzazioni[2].valore_tempo,
                verde3: temporizzazioni[4].valore_tempo,
                verde4: temporizzazioni[6].valore_tempo,
                verde5: temporizzazioni[8].valore_tempo,
                verde6: temporizzazioni[10].valore_tempo,
                verde7: temporizzazioni[12].valore_tempo,
                verde8: temporizzazioni[14].valore_tempo,
                verde9: temporizzazioni[16].valore_tempo,
                verde10: temporizzazioni[18].valore_tempo,
                verde11: temporizzazioni[20].valore_tempo,
                verde12: temporizzazioni[22].valore_tempo,
                verde13: temporizzazioni[24].valore_tempo,
                verde14: temporizzazioni[26].valore_tempo,
                verde15: temporizzazioni[28].valore_tempo,
                verde16: temporizzazioni[30].valore_tempo,
                verde17: temporizzazioni[32].valore_tempo,
                verde18: temporizzazioni[34].valore_tempo,
                verde19: temporizzazioni[36].valore_tempo,
                verde20: temporizzazioni[38].valore_tempo,
                verde21: temporizzazioni[40].valore_tempo,
                verde22: temporizzazioni[42].valore_tempo,
                verde23: temporizzazioni[44].valore_tempo,
                verde24: temporizzazioni[46].valore_tempo
              },
              coppia1: {
                verde1: temporizzazioni[1].valore_tempo,
                verde2: temporizzazioni[3].valore_tempo,
                verde3: temporizzazioni[5].valore_tempo,
                verde4: temporizzazioni[7].valore_tempo,
                verde5: temporizzazioni[9].valore_tempo,
                verde6: temporizzazioni[11].valore_tempo,
                verde7: temporizzazioni[13].valore_tempo,
                verde8: temporizzazioni[15].valore_tempo,
                verde9: temporizzazioni[17].valore_tempo,
                verde10: temporizzazioni[19].valore_tempo,
                verde11: temporizzazioni[21].valore_tempo,
                verde12: temporizzazioni[23].valore_tempo,
                verde13: temporizzazioni[25].valore_tempo,
                verde14: temporizzazioni[27].valore_tempo,
                verde15: temporizzazioni[29].valore_tempo,
                verde16: temporizzazioni[31].valore_tempo,
                verde17: temporizzazioni[33].valore_tempo,
                verde18: temporizzazioni[35].valore_tempo,
                verde19: temporizzazioni[37].valore_tempo,
                verde20: temporizzazioni[39].valore_tempo,
                verde21: temporizzazioni[41].valore_tempo,
                verde22: temporizzazioni[43].valore_tempo,
                verde23: temporizzazioni[45].valore_tempo,
                verde24: temporizzazioni[47].valore_tempo
  
              }
            }
          }
        }
      };
  
      twin.update(patch, function (err) {
        if (err) {
          console.error('Could not update twin: ' + err.constructor.name + ': ' + err.message);
        } else {
          console.log(twin.deviceId + ' twin updated successfully');
  
        }
      });
  
  
  
    }
  });
}






var temporizzazioni = [];

class Tempo {
  constructor(id_sem, fascia, valore) {
    this.id_semaforo = id_sem;
    this.fascia_oraria = fascia;
    this.valore_tempo = valore;
  }
};

// function Tempo(id_sem, fascia, valore) {  // Function constructor
//   this.id_semaforo = id_sem;
//   this.fascia_oraria = fascia;
//   this.valore_tempo = valore;
// }

function addTempo(id_sem, fascia, valore) {
  let t = new Tempo(id_sem, fascia, valore); // here we create instance
  temporizzazioni.push(t);
  console.log(t);

  console.log(temporizzazioni.length);

}






});