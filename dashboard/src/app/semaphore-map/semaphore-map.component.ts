import { Component, OnInit } from '@angular/core';
const configuration = require("config.json");

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
    this.image_url = "https://maps.googleapis.com/maps/api/staticmap?center={0},{1}&zoom=1&size=100x100&key={2}", latitude, longitude, configuration.Google_maps_key;
  }

}
