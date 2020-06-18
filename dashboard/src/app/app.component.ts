import { Component } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  clock:Date = new Date();

  private sub: Subscription;

  obj = this.socket.fromEvent<any>("yo");

  constructor(private socket: Socket) { }

  ngOnInit() {
    this.sub = this.obj.subscribe(obj => console.log(obj));
    
    setInterval(() => {
       this.clock = new Date();
    }, 30000);
  }
}
