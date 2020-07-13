import { Component, OnInit } from '@angular/core';
import { SocketService } from '../services/socket.service';
import { Subscription } from 'rxjs';
import { CrossRoad } from '../models/semaphore';
import { ActivatedRoute } from '@angular/router';
import { isNumber } from 'util';

@Component({
  selector: 'app-semaphore-details',
  templateUrl: './semaphore-details.component.html',
  styleUrls: ['./semaphore-details.component.scss']
})
export class SemaphoreDetailsComponent implements OnInit {

  id: number = 3;
  details_sub: Subscription;
  crossroad: CrossRoad = new CrossRoad();
  constructor(private socket: SocketService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.id = parseInt(this.route.snapshot.paramMap.get('id'));
    this.crossroad.coordinates.latitude = Number(this.route.snapshot.paramMap.get('latitude'));
    this.crossroad.coordinates.longitude = Number(this.route.snapshot.paramMap.get('longitude'));
    this.details_sub = this.socket.subToDetails().subscribe((data) => {
      console.log(data);
      this.crossroad.semaphores.forEach((semaphore, i) => {
        if (semaphore.id === data[i].id_strada) {
          semaphore.car = data[i].Auto;
          semaphore.camion = data[i].Camion;
          semaphore.moto = data[i].Moto;
        }

      });
      /*id_incrocio: 3
        strade: Array(4)
          0:
          Auto: 0
          Camion: 0
          Moto: 0
          id_strada: 1
          1:
          Auto: 0
          Camion: 0
          Moto: 0
          id_strada: 2
          2:
          Auto: 0
          Camion: 0
          Moto: 0
          id_strada: 3
          3:
          Auto: 0
          Camion: 0
          Moto: 0
          id_strada: 4*/
    });
    this.socket.details(this.id);
  }

  ngOnDestroy() {
    this.details_sub.unsubscribe();
  }
}
