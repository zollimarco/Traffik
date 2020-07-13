import { Component, OnInit } from '@angular/core';
import { Subscription, Observable } from 'rxjs';
import { SensorData } from '../models/sensor-data';
import { CrossRoad } from '../models/semaphore';
import { Coordinates } from '../models/semaphore-map';
import { SocketService } from '../services/socket.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  //semaphore data stream
  semaphore_stream_sub: Subscription;
  semaphore_stream: Observable<SensorData>;
  crossroad: CrossRoad = new CrossRoad();
  
  constructor(private socket: SocketService) { }

  ngOnInit(): void {
    
    //-------------Sample per quando non ci sono dati----------------
    var obj = {
      id: 1,
      date: new Date(),
      humidity: 0,
      pressure: 0,
      temperature: 0,
      coordinates: new Coordinates(),
      semaphores: []
    }
    for (let i = 0; i < 4; i++) {
      obj.semaphores[i] = {
        id: i,
        state: Math.random() * (3 - 0) + 0,
        car: 0,
        moto: 0,
        camion: 0
      }
    }

    this.crossroad = obj;
    //-------------------------------------------------------------------------------------------------
     //sottoiscrizione al flusso del socket
     this.semaphore_stream = this.socket.subToStream();
     this.semaphore_stream_sub = this.semaphore_stream.subscribe((data: SensorData) => {
       console.log("inzio callback" + data);
 
       //in caso di piu incroci verra aggiunto un for 
       if (this.crossroad.id === data.id_incrocio) {
         switch (data.Sensore) {
           case "Stato_Semaforo":
             if (!this.crossroad.semaphores[data.Strada + 1]) {
               this.crossroad.semaphores[data.Strada - 1] = {
                 id: data.Strada - 1,
                 state: 0,
                 car: 0,
                 moto: 0,
                 camion: 0
               }
               this.crossroad.semaphores[data.Strada + 1] = {
                 id: data.Strada + 1,
                 state: 0,
                 car: 0,
                 moto: 0,
                 camion: 0
               }
             }
             console.log("crossroad:");
             console.log(this.crossroad);
 
             this.crossroad.semaphores[data.Strada - 1].state = data.Valore;
             this.crossroad.semaphores[data.Strada + 1].state = data.Valore;
             break;
           case "Auto":
             this.crossroad.semaphores[data.Strada - 1].car = data.Valore;
             break;
           case "Camion":
             this.crossroad.semaphores[data.Strada - 1].camion = data.Valore;
             break;
           case "Moto":
             this.crossroad.semaphores[data.Strada - 1].moto = data.Valore;
             break;
           case "Umidità":
             this.crossroad.humidity = data.Valore;
             break;
           case "Pressione":
             this.crossroad.pressure = data.Valore;
             break;
           case "Temperatura":
             this.crossroad.temperature = data.Valore;
             break;
           default:
             break;
         }
         this.crossroad.date = data.Data;
         console.log(this.crossroad);
         return;
       }
 
       //nuovo semaforo
 
       var obj = {
         id: data.id_incrocio,
         date: data.Data,
         humidity: 0,
         pressure: 0,
         temperature: 0,
         coordinates: new Coordinates(),
         semaphores: []
       }
       obj.semaphores[data.Strada - 1] = {
         id: data.Strada - 1,
         state: 0,
         car: 0,
         moto: 0,
         camion: 0
       }
       switch (data.Sensore) {
         case "Stato_Semaforo":
           obj.semaphores[data.Strada + 1] = {
             id: data.Strada + 1,
             state: 0,
             car: 0,
             moto: 0,
             camion: 0
           }
           obj.semaphores[data.Strada - 1].state = data.Valore;
           obj.semaphores[data.Strada + 1].state = data.Valore;
           break;
         case "Auto":
           obj.semaphores[data.Strada - 1].car = data.Valore;
           break;
         case "Camion":
           obj.semaphores[data.Strada - 1].camion = data.Valore;
           break;
         case "Moto":
           obj.semaphores[data.Strada - 1].moto = data.Valore;
           break;
         case "Umidità":
           obj.humidity = data.Valore;
           break;
         case "Pressione":
           obj.pressure = data.Valore;
         case "Temperatura":
           obj.temperature = data.Valore;
           break;
         default:
           break;
       }
       this.crossroad = obj;
       console.log(this.crossroad);
     });
  }

  ngOnDestroy() {
    this.semaphore_stream_sub.unsubscribe();
  }
}
