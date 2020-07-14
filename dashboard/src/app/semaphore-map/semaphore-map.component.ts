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

  @Input() image_url: string;
  
  constructor() {}

  ngOnInit(): void { }

}
