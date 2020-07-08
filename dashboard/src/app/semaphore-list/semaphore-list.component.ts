import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { MatAccordion } from '@angular/material/expansion';
import { api_maps } from 'config/api.json';
import { CrossRoad } from '../models/semaphore';
import { HttpClient } from '@angular/common/http';
import { Subscription, Observable } from 'rxjs';
import { SocketService } from '../services/socket.service';
import { Coordinates } from '../models/semaphore-map';

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


  constructor(private http: HttpClient, private socket: SocketService) { }

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

      let map_url = api_maps.reverse_url + api_maps.key + "&location=" + this.crossroads.coordinates.latitude + "%2C" + this.crossroads.coordinates.longitude + api_maps.end_reverse_url;

      // Http request
      this.http.get<MapsInfo>(map_url).subscribe(data => {
        let street = data.results[0].locations[0].street;
        let city = data.results[0].locations[0].adminArea5;

        // Formatto l'indirizzo
        this.address = street + " (" + city + ")";
      });
      //console.log(this.address);
    //}
  }
}

export interface MapsInfo {
  info: Object;
  results: Result;
}

interface Result {
  providedLocation: Object;
  locations: Location
}

interface Location {
  street: string;
  adminArea5: string
}