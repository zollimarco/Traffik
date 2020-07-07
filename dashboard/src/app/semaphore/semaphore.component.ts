import { Component, OnInit, Input } from '@angular/core';
import { CrossRoad } from '../models/semaphore';

@Component({
  selector: 'app-semaphore',
  templateUrl: './semaphore.component.html',
  styleUrls: ['./semaphore.component.scss']
})
export class SemaphoreComponent implements OnInit {

  @Input() crossroad: CrossRoad = new CrossRoad();
  @Input() address: string;

  constructor() { }
  
  ngOnInit(): void {

    // ottengo i valori 
    // assegno i valori necessari

  }

  details() {
    // ToDo
    console.log("Dettagli");
    console.log(this.crossroad);
  }
}


