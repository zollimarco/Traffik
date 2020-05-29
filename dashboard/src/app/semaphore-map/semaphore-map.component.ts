import { Component, OnInit } from '@angular/core';
const configuration = require("config.json");

@Component({
  selector: 'app-semaphore-map',
  templateUrl: './semaphore-map.component.html',
  styleUrls: ['./semaphore-map.component.scss']
})
export class SemaphoreMapComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    let image_url = "https://maps.googleapis.com/maps/api/staticmap?center=0,0&zoom=1&size=100x100&key=" + configuration.Google_maps_key;
  }

}
