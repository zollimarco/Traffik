import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { MatAccordion } from '@angular/material/expansion';
import { CrossRoad } from '../models/semaphore';

@Component({
  selector: 'app-semaphore-list',
  templateUrl: './semaphore-list.component.html',
  styleUrls: ['./semaphore-list.component.scss']
})
export class SemaphoreListComponent implements OnInit {

  
  @ViewChild(MatAccordion) accordion: MatAccordion;

  @Input() crossroads: CrossRoad[];
  
  constructor() { }

  ngOnInit(): void {
  }
}
