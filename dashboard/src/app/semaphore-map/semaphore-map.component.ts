import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { api_maps } from 'config/api.json';
import { SemaphoreMap } from '../models/semaphore-map';

@Component({
  selector: 'app-semaphore-map',
  templateUrl: './semaphore-map.component.html',
  styleUrls: ['./semaphore-map.component.scss']
})
export class SemaphoreMapComponent implements OnInit {
  image_url: string;
  semaphore_map: SemaphoreMap = new SemaphoreMap();
  
  constructor() {}

  ngOnInit(): void { 
    this.semaphore_map.coordinates.latitude = 45.95160;
    this.semaphore_map.coordinates.longitude = 12.68054;
    this.semaphore_map.size.height = 300;
    this.semaphore_map.size.width = 1000;
    this.semaphore_map.zoom = 18;

    this.image_url = api_maps.url + api_maps.key + "&size=" + this.semaphore_map.size.width + "," + this.semaphore_map.size.height + "&type=map&imagetype=jpg&zoom=" + this.semaphore_map.zoom + "&scalebar=false&traffic=false&center=" + this.semaphore_map.coordinates.latitude + "," + this.semaphore_map.coordinates.longitude + api_maps.end_url;
  
    // ritorno anche la v
  }

}
