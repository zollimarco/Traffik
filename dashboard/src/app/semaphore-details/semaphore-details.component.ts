import { Component, OnInit } from '@angular/core';
import { SocketService } from '../services/socket.service';
import { Subscription } from 'rxjs';
import { CrossRoad, Semaphore } from '../models/semaphore';
import { ActivatedRoute } from '@angular/router';
import { SemaphoreMap } from '../models/semaphore-map';
import { MapquestService } from '../services/mapquest.service';
import { DomSanitizer } from '@angular/platform-browser';
@Component({
  selector: 'app-semaphore-details',
  templateUrl: './semaphore-details.component.html',
  styleUrls: ['./semaphore-details.component.scss']
})
export class SemaphoreDetailsComponent implements OnInit {

  details_sub: Subscription;
  crossroad: CrossRoad = new CrossRoad();

  //MapQuest
  semaphore_map: SemaphoreMap = new SemaphoreMap();

  //Grafana
  traffic_url: string;
  meteo_url: string;

  constructor(private socket: SocketService, private route: ActivatedRoute, private mapquest: MapquestService, public sanitizer: DomSanitizer ) { }

  ngOnInit(): void {
    this.crossroad.id = parseInt(this.route.snapshot.paramMap.get('id'));
    this.crossroad.humidity = parseInt(this.route.snapshot.paramMap.get('humidity'));
    this.crossroad.temperature = parseInt(this.route.snapshot.paramMap.get('temperature'));
    this.crossroad.pressure = parseInt(this.route.snapshot.paramMap.get('pressure'));
    this.crossroad.coordinates.latitude = Number(this.route.snapshot.paramMap.get('latitude'));
    this.crossroad.coordinates.longitude = Number(this.route.snapshot.paramMap.get('longitude'));

    //MAPQUEST__________________________________________________________________________
    //Image Map
    this.semaphore_map.coordinates.latitude = this.crossroad.coordinates.latitude;
    this.semaphore_map.coordinates.longitude = this.crossroad.coordinates.longitude;
    this.semaphore_map.size.height = 500;
    this.semaphore_map.size.width = 1000;
    this.semaphore_map.zoom = 18;

    this.crossroad.map_url = this.mapquest.getMapImage(this.semaphore_map);

    this.mapquest.getAddress(this.semaphore_map.coordinates, (data) => {
      let street = data.results[0].locations[0].street;
      let city = data.results[0].locations[0].adminArea5;

      // Formatto l'indirizzo
      this.crossroad.address = street + " (" + city + ")";
    });

    this.details_sub = this.socket.subToDetails().subscribe((data) => {
      data.strade.forEach((strada, i) => {
        this.crossroad.semaphores[i] = new Semaphore();
        this.crossroad.semaphores[i].id = strada.id_strada;
        this.crossroad.semaphores[i].car = strada.Auto;
        this.crossroad.semaphores[i].camion = strada.Camion;
        this.crossroad.semaphores[i].moto = strada.Moto;
      });
    });
    this.socket.details(this.crossroad.id);

    //Graphana
    this.traffic_url = "http://localhost:3000/d-solo/aaLTzm7Gz/traffik?orgId=1&from=1594648564857&to=1594821364857&var-id=" + this.crossroad.id + "&panelId=2";
    this.meteo_url = "http://localhost:3000/d-solo/aaLTzm7Gz/traffik?orgId=1&from=1594648541831&to=1594821341831&var-id=" + this.crossroad.id + "&panelId=4"
  }

  ngOnDestroy() {
    this.details_sub.unsubscribe();
  }
}
