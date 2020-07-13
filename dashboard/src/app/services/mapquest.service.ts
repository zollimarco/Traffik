import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { api_maps } from 'config/api.json';
import { Coordinates, SemaphoreMap } from '../models/semaphore-map';

@Injectable({
  providedIn: 'root'
})
export class MapquestService {

  constructor(private http: HttpClient) { }

  //reverse address
  getAddress(coordinates: Coordinates, result: any) {
    let map_url = api_maps.reverse_url + api_maps.key + "&location=" + coordinates.latitude + "%2C" + coordinates.longitude + api_maps.end_reverse_url;
    // Http request
    return this.http.get<MapsInfo>(map_url).subscribe(result);
  }
  
  getMapImage(map: SemaphoreMap){
    return api_maps.url + api_maps.key + "&size=" + map.size.width + "," + map.size.height + "&type=map&imagetype=jpg&zoom=" + map.zoom + "&scalebar=false&traffic=false&center=" + map.coordinates.latitude + "," + map.coordinates.longitude + api_maps.end_url;
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

