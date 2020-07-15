import { Component, OnInit } from '@angular/core';
import { Subscription, Observable } from 'rxjs';
import { SensorData } from '../models/sensor-data';
import { CrossRoad, Semaphore } from '../models/semaphore';
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
  crossroads: CrossRoad[] = [];

  constructor(private socket: SocketService) { }

  ngOnInit(): void {

    //-------------Sample per quando non ci sono dati----------------
    // var obj = new CrossRoad();
    // obj.id = 3;

    // for (let i = 0; i < 4; i++) {
    //   obj.semaphores[i] = {
    //     id: i + 1,
    //     state: 0,
    //     car: 0,
    //     moto: 0,
    //     camion: 0
    //   }
    // }

    // this.crossroads[0] = obj;
    //-------------------------------------------------------------------------------------------------
    //sottoiscrizione al flusso del socket
    this.semaphore_stream = this.socket.subToStream();
    this.semaphore_stream_sub = this.semaphore_stream.subscribe((data: SensorData) => {
      console.log("inzio callback");
      console.log(data);


      for (let crossroad of this.crossroads) {
        //in caso di piu incroci verra aggiunto un for 
        if (crossroad.id === data.id_incrocio) {         
          switch (data.Sensore) {
            case "Stato_Semaforo":
              console.log("crossroad:");
              console.log(crossroad);

              //controllo semafori
              if (crossroad.semaphores[data.Strada + 1] || crossroad.semaphores[data.Strada - 1]) {
                crossroad.semaphores[data.Strada - 1] = new Semaphore();
                 crossroad.semaphores[data.Strada - 1].id = data.Strada;
                 crossroad.semaphores[data.Strada + 1] = new Semaphore();
                 crossroad.semaphores[data.Strada + 1].id = data.Strada + 2;
               }
              crossroad.semaphores[data.Strada - 1].state = data.Valore;
              crossroad.semaphores[data.Strada + 1].state = data.Valore;

              console.log("crossroad:");
              console.log(crossroad);
              break;
            case "Auto":
              if (crossroad.semaphores[data.Strada - 1]) {
                crossroad.semaphores[data.Strada - 1] = new Semaphore();
                 crossroad.semaphores[data.Strada - 1].id = data.Strada;
               }
              crossroad.semaphores[data.Strada - 1].car = data.Valore;
              break;
            case "Camion":
              if (crossroad.semaphores[data.Strada - 1]) {
                crossroad.semaphores[data.Strada - 1] = new Semaphore();
                 crossroad.semaphores[data.Strada - 1].id = data.Strada;
               }
              crossroad.semaphores[data.Strada - 1].camion = data.Valore;
              break;
            case "Moto":
              if (crossroad.semaphores[data.Strada - 1]) {
                crossroad.semaphores[data.Strada - 1] = new Semaphore();
                 crossroad.semaphores[data.Strada - 1].id = data.Strada;
               }
              crossroad.semaphores[data.Strada - 1].moto = data.Valore;
              break;
            case "Umidità":
              if (crossroad.semaphores[data.Strada - 1]) {
                crossroad.semaphores[data.Strada - 1] = new Semaphore();
                 crossroad.semaphores[data.Strada - 1].id = data.Strada;
               }
              crossroad.humidity = data.Valore;
              break;
            case "Pressione":
              if (crossroad.semaphores[data.Strada - 1]) {
                crossroad.semaphores[data.Strada - 1] = new Semaphore();
                 crossroad.semaphores[data.Strada - 1].id = data.Strada;
               }
              crossroad.pressure = data.Valore;
              break;
            case "Temperatura":
              if (crossroad.semaphores[data.Strada - 1]) {
                crossroad.semaphores[data.Strada - 1] = new Semaphore();
                 crossroad.semaphores[data.Strada - 1].id = data.Strada;
               }
              crossroad.temperature = data.Valore;
              break;
            default:
              break;
          }
          crossroad.date = data.Data;
          console.log(crossroad);
          return;
        }
      }
    });
  }

  ngOnDestroy() {
    this.semaphore_stream_sub.unsubscribe();
  }
}
