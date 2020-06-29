import { Component } from '@angular/core';
import { SocketService } from './services/socket.service';
import { Subscription, Observable } from 'rxjs';
import { SensorData } from './models/sensor-data';
import { Semaphore } from './models/semaphore';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  clock: Date = new Date();
  sub: Subscription;
  main_stream: Observable<SensorData>;
  semaphore_list: Semaphore[] = [];

  constructor(private socket: SocketService) { }

  ngOnInit() {
    this.main_stream = this.socket.subToStream();
    this.sub = this.main_stream.subscribe((data: SensorData) => {
      console.log(data);
      
      for (var semaphore of this.semaphore_list) {
        if (data.id_incrocio === semaphore.id) {
          switch (data.Sensore) {
            case "Stato_Semaforo":
              semaphore.strade[data.Strada - 1].stato = data.Valore;
              break;
            case "Auto":
              semaphore.strade[data.Strada - 1].auto = data.Valore;
              break;
            case "Camion":
              semaphore.strade[data.Strada - 1].camion = data.Valore;
              break;
            case "Moto":
              semaphore.strade[data.Strada - 1].moto = data.Valore;
              break;
            case "Umidità":
              semaphore.umidita = data.Valore;
              break;
            case "Pressione":
              semaphore.pressione = data.Valore;
              break;
            default:
              break;
          }
          console.log(this.semaphore_list);
          return;
        }
      }

      var obj = {
        id: data.id_incrocio,
        data: data.Data,
        umidita: 0,
        pressione: 0,
        strade: [{
          id: 1,
          stato: 0,
          auto: 0,
          moto: 0,
          camion: 0
        },
        {
          id: 2,
          stato: 0,
          auto: 0,
          moto: 0,
          camion: 0
        }]
      }
      switch (data.Sensore) {
        case "Stato_Semaforo":
          obj.strade[data.Strada - 1].stato = data.Valore;
          break;
        case "Auto":
          obj.strade[data.Strada - 1].auto = data.Valore;
          break;
        case "Camion":
          obj.strade[data.Strada - 1].camion = data.Valore;
          break;
        case "Moto":
          obj.strade[data.Strada - 1].moto = data.Valore;
          break;
        case "Umidità":
          obj.umidita = data.Valore;
          break;
        case "Pressione":
          obj.pressione = data.Valore;
          break;
        default:
          break;
      }
      this.semaphore_list.push(obj);
      console.log(this.semaphore_list);
      
    });
    setInterval(() => {
      this.clock = new Date();
    }, 30000);
  }
}
