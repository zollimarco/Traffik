
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  clock:Date = new Date();
  
  ngOnInit() {
    setInterval(() => {
       this.clock = new Date();
    }, 30000);
  }
}
