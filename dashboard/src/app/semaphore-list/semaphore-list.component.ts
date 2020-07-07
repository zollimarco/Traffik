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
  coordinates: Coordinates;
  //fare una classe??? decidi tu fra

  coordinates_list: any = [];
  constructor(private http: HttpClient, private socket: SocketService) { }

  ngOnInit(): void {
    let arrayIsNotEmpty: boolean = false;

    //------------------------------sottoiscrizione al flusso delle coordinate-------------------------
    this.coordinates_stream = this.socket.subToCoordinates();
    this.coordinates_stream_sub = this.coordinates_stream.subscribe((data: any) => {
      // Visualizzo la lista delle coordinate degli incroci
      console.log(data.Incroci);

      // Ottengo il contenuto di data
      this.coordinates_list = data.Incroci;

      if (this.coordinates_list.length != 0) {
        arrayIsNotEmpty = true;
      }
      console.log("check: " + arrayIsNotEmpty);
    });

    this.socket.getCoordinates();

    //aggiungere un controllo per vedere che la variabile sia carica
    if (arrayIsNotEmpty) {
      this.coordinates.latitude = this.coordinates_list[0].Latitudine;
      this.coordinates.longitude = this.coordinates_list[0].Longitudine;

      let map_url = api_maps.reverse_url + api_maps.key + "&location=" + this.coordinates.latitude + "%2C" + this.coordinates.longitude + api_maps.end_reverse_url;

      // Http request
      let obj = new Object;
      this.http.get<MapsInfo>(map_url).subscribe(data => {
        let street = data.results[0].locations[0].street;
        let city = data.results[0].locations[0].adminArea5;

        // Formatto l'indirizzo
        this.address = street + " (" + city + ")";
      });

      console.log("lat: " + this.coordinates.latitude);
      console.log("lon: " + this.coordinates.longitude);
      console.log(this.address);
    }
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