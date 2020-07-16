import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { MatAccordion } from '@angular/material/expansion';
import { CrossRoad, Semaphore } from '../models/semaphore';
import { Subscription, Observable } from 'rxjs';
import { SocketService } from '../services/socket.service';
import { MapquestService } from '../services/mapquest.service';
import { SemaphoreMap } from '../models/semaphore-map';

@Component({
  selector: 'app-semaphore-list',
  templateUrl: './semaphore-list.component.html',
  styleUrls: ['./semaphore-list.component.scss']
})
export class SemaphoreListComponent implements OnInit {

  @ViewChild(MatAccordion) accordion: MatAccordion;

  @Input() crossroads: CrossRoad[] = [];

  //mapquest
  semaphore_map: SemaphoreMap = new SemaphoreMap();

  search: string = "";

  //coordinates data stream
  coordinates_stream_sub: Subscription;
  coordinates_stream: Observable<any>;
  //ho pensato di implementare le coordinate nella classe dell'incrocio affinche ci il passaggio delle variabili per direttissimaa


  constructor(private socket: SocketService, private mapquest: MapquestService) { }

  ngOnInit(): void {

    //------------------------------sottoiscrizione al flusso delle coordinate-------------------------
    this.coordinates_stream = this.socket.subToCoordinates();
    this.coordinates_stream_sub = this.coordinates_stream.subscribe((data: any) => {
      console.log(data);

      // Visualizzo la lista delle coordinate degli incroci
      data.Incroci.forEach((crossroad) => {
        let new_c = new CrossRoad();
        new_c.id = crossroad.id_incrocio;
        new_c.coordinates.latitude = crossroad.Latitudine;
        new_c.coordinates.longitude = crossroad.Longitudine;
        for (let i = 0; i < 4; i++) {
          new_c.semaphores[i] = new Semaphore();
          new_c.semaphores[i].id = i + 1;
        }
        this.crossroads.push(new_c);
      });

      //mapquest
      this.semaphore_map.size.height = 400;
      this.semaphore_map.size.width = 1000;
      this.semaphore_map.zoom = 18;

      this.crossroads.forEach(crossroad => {
        //image url
        this.semaphore_map.coordinates.latitude = crossroad.coordinates.latitude;
        this.semaphore_map.coordinates.longitude = crossroad.coordinates.longitude;

        crossroad.map_url = this.mapquest.getMapImage(this.semaphore_map);

        //address
        this.mapquest.getAddress(crossroad.coordinates, (data) => {
          let street = data.results[0].locations[0].street;
          let city = data.results[0].locations[0].adminArea5;

          // Formatto l'indirizzo
          crossroad.address = street + " (" + city + ")";
        });
      });
    });
    this.socket.getCoordinates();
  }
  onSearch($event){
    this.search = $event;
  }
}