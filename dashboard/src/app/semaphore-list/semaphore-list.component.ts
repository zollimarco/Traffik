import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { MatAccordion } from '@angular/material/expansion';
import { CrossRoad } from '../models/semaphore';
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
  image_url: string;
  address: string;

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
      this.crossroads.forEach((crossroad, i) => {
        if (data.Incroci[i].id_incrocio === crossroad.id) {
          crossroad.coordinates.latitude = data.Incroci[i].Latitudine;
          crossroad.coordinates.longitude = data.Incroci[i].Longitudine;
        }
      });

      this.mapquest.getAddress(this.crossroads[0].coordinates, (data) => {
        let street = data.results[0].locations[0].street;
        let city = data.results[0].locations[0].adminArea5;

        // Formatto l'indirizzo
        this.address = street + " (" + city + ")";
      });

      this.semaphore_map.coordinates.latitude = this.crossroads[0].coordinates.latitude;
      this.semaphore_map.coordinates.longitude = this.crossroads[0].coordinates.longitude;
      this.semaphore_map.size.height = 400;
      this.semaphore_map.size.width = 1000;
      this.semaphore_map.zoom = 18;

      this.image_url = this.mapquest.getMapImage(this.semaphore_map);
      // Ottengo il contenuto di data (se piu semafori verifico l'id attraverso un loop)
      //this.coordinates_list = data.Incroci;
    });

    this.socket.getCoordinates();
    //aggiungere un controllo per vedere che la variabile sia carica
    //if (this.coordinates_list.length) {
    // this.coordinates.latitude = this.coordinates_list[0].Latitudine;
    // this.coordinates.longitude = this.coordinates_list[0].Longitudine;
    //console.log(this.address);
    //}
  }
}