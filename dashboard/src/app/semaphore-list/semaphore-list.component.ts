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
  
  constructor(private http: HttpClient, private socket: SocketService) { }

  ngOnInit(): void {
    
    //------------------------------sottoiscrizione al flusso delle coordinate-------------------------
    this.coordinates_stream = this.socket.subToCoordinates();
    this.coordinates_stream_sub =  this.coordinates_stream.subscribe((data: any) => console.log(data));
    this.socket.getCoordinates();

    
    let latitude = 45.95160;
    let longitude = 12.68054;
    //aggiungere un controllo per vedere che la variabile sia carica
    
    let map_url = api_maps.reverse_url + api_maps.key + "&location=" + latitude + "%2C" + longitude + api_maps.end_reverse_url;


    // Http request
    let obj = new Object;
    this.http.get<MapsInfo>(map_url).subscribe(data => {
      let street =  data.results[0].locations[0].street;
      let city =  data.results[0].locations[0].adminArea5;

      // Formatto l'indirizzo
      this.address = street + " (" + city + ")";
    });
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