import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { MatAccordion } from '@angular/material/expansion';
import { api_maps } from 'config/api.json';
import { CrossRoad } from '../models/semaphore';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-semaphore-list',
  templateUrl: './semaphore-list.component.html',
  styleUrls: ['./semaphore-list.component.scss']
})
export class SemaphoreListComponent implements OnInit {


  @ViewChild(MatAccordion) accordion: MatAccordion;

  @Input() crossroads: CrossRoad[];
  
  address: string;
  
  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    let latitude = 45.95160;
    let longitude = 12.68054;
    
    let map_url = "https://www.mapquestapi.com/geocoding/v1/reverse?key=" + api_maps.key + "&location=" + latitude + "%2C" + longitude + "&outFormat=json&thumbMaps=true";


    // Http request
    let obj = new Object;
    this.http.get<MapsInfo>(map_url).subscribe(data => {
      let street =  data.results[0].locations[0].street;
      let city =  data.results[0].locations[0].adminArea5;

      // Compongo l'indirizzo
      this.address = street + " (" + city + ")";
      console.log(this.address);
      
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