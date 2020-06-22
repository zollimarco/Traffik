import { Component } from '@angular/core';
import { SocketService } from './services/socket.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  clock:Date = new Date();
  socket: SocketService;

  constructor() { }

  ngOnInit() { 
    this.socket.subToStream();
    setInterval(() => {
       this.clock = new Date();
    }, 30000);
  }
}
