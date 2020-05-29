import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-semaphore',
  templateUrl: './semaphore.component.html',
  styleUrls: ['./semaphore.component.scss']
})
export class SemaphoreComponent implements OnInit {

  constructor() { }

  // colore semaforo, gestione dello stato

  n_vehicle = null;
  humidity = null;
  temperature = null;
  atm_pressure = null;

  ngOnInit(): void {
    // ottengo i valori 
    // assegno i valori necessari
  }

}
