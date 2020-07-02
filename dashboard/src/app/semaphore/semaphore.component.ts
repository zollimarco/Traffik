import { Component, OnInit, Input } from '@angular/core';
import { CrossRoad } from '../models/semaphore';

@Component({
  selector: 'app-semaphore',
  templateUrl: './semaphore.component.html',
  styleUrls: ['./semaphore.component.scss']
})
export class SemaphoreComponent implements OnInit {

  @Input() crossroad: CrossRoad = new CrossRoad();

  constructor() { }

  // colore semaforo, gestione dello stato
  n_vehicle = null;
  humidity = null;
  temperature = null;
  atm_pressure = null;

  ngOnInit(): void {
    console.log(this.crossroad);
    
    // ottengo i valori 
    // assegno i valori necessari
    
  }

  edit() {
    // ToDo
    console.log("Modifica del semaforo");
    
  };
  
  details() {
      // ToDo
      console.log("Dettagli");
      console.log(this.crossroad);
  }
}


