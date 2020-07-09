import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-semaphore-details',
  templateUrl: './semaphore-details.component.html',
  styleUrls: ['./semaphore-details.component.scss']
})
export class SemaphoreDetailsComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    console.log(history.state.data)
  }

}
