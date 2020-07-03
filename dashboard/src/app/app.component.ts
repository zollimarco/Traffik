import { Component } from '@angular/core';
import { SocketService } from './services/socket.service';
import { Subscription, Observable } from 'rxjs';
import { SensorData } from './models/sensor-data';
import { CrossRoad } from './models/semaphore';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  clock: Date = new Date();
  sub: Subscription;
  semaphore_stream: Observable<SensorData>;
  crossroad_list: CrossRoad[] = [];

  constructor(private socket: SocketService) { }

  ngOnInit() {

    this.semaphore_stream = this.socket.subToStream();
    this.sub = this.semaphore_stream.subscribe((data: SensorData) => {
      console.log(data);

      for (var crossroad of this.crossroad_list) {
        if (data.id_incrocio && data.id_incrocio === crossroad.id) {
          switch (data.Sensore) {
            case "Stato_Semaforo":
              if (!crossroad.semaphores[data.Strada + 1]) {
                console.log("stato semaforo");

                crossroad.semaphores[data.Strada - 1] = {
                  id: data.Strada - 1,
                  state: 0,
                  car: 0,
                  moto: 0,
                  camion: 0
                }
                crossroad.semaphores[data.Strada + 1] = {
                  id: data.Strada + 1,
                  state: 0,
                  car: 0,
                  moto: 0,
                  camion: 0
                }
              }
              console.log(crossroad);

              crossroad.semaphores[data.Strada - 1].state = data.Valore;
              crossroad.semaphores[data.Strada + 1].state = data.Valore;
              break;
            case "Auto":
              crossroad.semaphores[data.Strada - 1].car = data.Valore;
              break;
            case "Camion":
              crossroad.semaphores[data.Strada - 1].camion = data.Valore;
              break;
            case "Moto":
              crossroad.semaphores[data.Strada - 1].moto = data.Valore;
              break;
            case "Umidità":
              crossroad.humidity = data.Valore;
              break;
            case "Pressione":
              crossroad.pressure = data.Valore;
              break;
            case "Temperatura":
              crossroad.temperature = data.Valore;
              break;
            default:
              break;
          }
          crossroad.date = data.Data;
          console.log(this.crossroad_list);
          return;
        }
      }

      //new semaphpore

      console.log("nuovo");
      var obj = {
        id: data.id_incrocio,
        date: data.Data,
        humidity: 0,
        pressure: 0,
        temperature: 0,
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
      this.crossroad_list.push(obj);
      console.log(this.crossroad_list);
    });
    setInterval(() => {
      this.clock = new Date();
    }, 30000);
  }
}
