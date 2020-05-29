import { Component, OnInit } from '@angular/core';
//const configuration = require("config.json");
import {Google_maps_key} from 'config.json';

@Component({
  selector: 'app-semaphore-map',
  templateUrl: './semaphore-map.component.html',
  styleUrls: ['./semaphore-map.component.scss']
})
export class SemaphoreMapComponent implements OnInit {
  image_url;
  constructor() { }

  ngOnInit(): void {
    let latitude = 0;
    let longitude = 0;
    console.log(Google_maps_key);
    this.image_url = "https://maps.googleapis.com/maps/api/staticmap?center=" + latitude.toString() +
    ","+ longitude.toString() + "&zoom=1&size=100x100&key=" + Google_maps_key;
  }

}
