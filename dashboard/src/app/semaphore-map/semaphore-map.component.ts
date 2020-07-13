import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { api_maps } from 'config/api.json';
import { SemaphoreMap, Coordinates } from '../models/semaphore-map';
import { MapquestService } from '../services/mapquest.service';

@Component({
  selector: 'app-semaphore-map',
  templateUrl: './semaphore-map.component.html',
  styleUrls: ['./semaphore-map.component.scss']
})
export class SemaphoreMapComponent implements OnInit {

  image_url: string;
  semaphore_map: SemaphoreMap = new SemaphoreMap();

  //coordinates
  @Input() coordinates: Coordinates;

  
  constructor(private mapquest: MapquestService) {}

  ngOnInit(): void { 
    this.semaphore_map.coordinates.latitude = this.coordinates.latitude;
    this.semaphore_map.coordinates.longitude = this.coordinates.longitude;
    this.semaphore_map.size.height = 400;
    this.semaphore_map.size.width = 1000;
    this.semaphore_map.zoom = 18;

    this.image_url = this.mapquest.getMapImage(this.semaphore_map);
  
    // ritorno anche la v
  }

}
