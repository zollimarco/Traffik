import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { api_maps } from 'config/api.json';
import { SemaphoreMap } from '../models/semaphore-map';

@Component({
  selector: 'app-semaphore-map',
  templateUrl: './semaphore-map.component.html',
  styleUrls: ['./semaphore-map.component.scss']
})
export class SemaphoreMapComponent implements OnInit {
  image_url: string;
  address: string;
  semaphore_map: SemaphoreMap = new SemaphoreMap();

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.semaphore_map.coordinates.latitude = 45.95160;
    this.semaphore_map.coordinates.longitude = 12.68054;
    this.semaphore_map.size.height = 300;
    this.semaphore_map.size.width = 1000;
    this.semaphore_map.zoom = 18;

    let map_url = "https://www.mapquestapi.com/geocoding/v1/reverse?key=" + api_maps.key + "&location=" + this.semaphore_map.coordinates.latitude + "%2C" + this.semaphore_map.coordinates.longitude + "&outFormat=json&thumbMaps=true";

    interface MapsInfo {
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

    // Http request
    let obj = new Object;
    this.http.get<MapsInfo>(map_url).subscribe(data => {
      let street =  data.results[0].locations[0].street;
      let city =  data.results[0].locations[0].adminArea5;

      // Compongo l'indirizzo
      this.address = street + " " + city;
      console.log("address: " + this.address);
    });

    this.image_url = api_maps.url + api_maps.key + "&size=" + this.semaphore_map.size.width + "," + this.semaphore_map.size.height + "&type=map&imagetype=jpg&zoom=" + this.semaphore_map.zoom + "&scalebar=false&traffic=false&center=" + this.semaphore_map.coordinates.latitude + "," + this.semaphore_map.coordinates.longitude + api_maps.end_url;
  }

}
