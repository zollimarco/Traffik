import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { MatAccordion } from '@angular/material/expansion';
import { CrossRoad } from '../models/semaphore';
import { HttpClient } from '@angular/common/http';
import { Subscription, Observable } from 'rxjs';
import { SocketService } from '../services/socket.service';
import { MapquestService } from '../services/mapquest.service';

@Component({
  selector: 'app-semaphore-list',
  templateUrl: './semaphore-list.component.html',
  styleUrls: ['./semaphore-list.component.scss']
})
export class SemaphoreListComponent implements OnInit {


  @ViewChild(MatAccordion) accordion: MatAccordion;

  @Input() crossroads: CrossRoad = new CrossRoad();

  //coordinates data stream
  coordinates_stream_sub: Subscription;
  coordinates_stream: Observable<any>;

  address: string;
  //ho pensato di implementare le coordinate nella classe dell'incrocio affinche ci il passaggio delle variabili per direttissimaa


  constructor(private socket: SocketService, private mapquest: MapquestService) { }

  ngOnInit(): void {

    //per quando non c'è l'invio dati
    
    this.crossroads.coordinates.latitude = 45.95160;
    this.crossroads.coordinates.longitude = 12.68054;
    //------------------------------sottoiscrizione al flusso delle coordinate-------------------------
    this.coordinates_stream = this.socket.subToCoordinates();
    this.coordinates_stream_sub = this.coordinates_stream.subscribe((data: any) => {
      // Visualizzo la lista delle coordinate degli incroci

      console.log(data.Incroci);
      this.crossroads.coordinates.latitude = data.Incroci[0].Latitudine;
      this.crossroads.coordinates.longitude = data.Incroci[0].Longitudine;

      // Ottengo il contenuto di data (se piu semafori verifico l'id attraverso un loop)
      //this.coordinates_list = data.Incroci;
    });

    this.socket.getCoordinates();

    //aggiungere un controllo per vedere che la variabile sia carica
    //if (this.coordinates_list.length) {
    // this.coordinates.latitude = this.coordinates_list[0].Latitudine;
    // this.coordinates.longitude = this.coordinates_list[0].Longitudine;

    this.mapquest.getAddress(this.crossroads.coordinates, (data) => {
      let street = data.results[0].locations[0].street;
      let city = data.results[0].locations[0].adminArea5;

      // Formatto l'indirizzo
      this.address = street + " (" + city + ")";
    });
      //console.log(this.address);
    //}
  }
}