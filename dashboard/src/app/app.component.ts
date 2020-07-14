import { Component } from '@angular/core';
import { SocketService } from './services/socket.service';
import { Subscription, Observable } from 'rxjs';
import { SensorData } from './models/sensor-data';
import { CrossRoad } from './models/semaphore';
import { Coordinates } from './models/semaphore-map';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  clock: Date = new Date();

  //connection status subscriptions
  connect_sub: Subscription;
  connect_error_sub: Subscription;
  connect_timeout_sub: Subscription;
  disconnect_sub: Subscription;

  connection_status: string = 'connect';
  connection_status_bar: boolean = false;

  constructor(
    private socket: SocketService,
    private router: Router) { }

  ngOnInit() {
    //connection status handlers
    //connect
    this.connect_sub = this.socket.connect().subscribe(() => {
      if (this.connection_status !== 'connect') {
        this.connection_status = 'connect';
        setTimeout(() => {
          this.connection_status_bar = false;
          console.log(this.connection_status_bar);
        }, 5000);
      }
      else {
        this.connection_status = 'connect';
      }
      console.log('connesso');
      
    });
    //connection error
    this.connect_error_sub = this.socket.connectError().subscribe(() => {
      this.connection_status = 'connect_error';
      this.connection_status_bar = true;
    });
    //timeout
    this.connect_timeout_sub = this.socket.connectTimeout().subscribe(() => {
      this.connection_status = 'connect_timeout';
      this.connection_status_bar = true;
    });
    //disconnection
    this.disconnect_sub = this.socket.disconnect().subscribe(() => {
      this.connection_status = 'disconnect';
      this.connection_status_bar = true;
    });

    //orologio
    setInterval(() => {
      this.clock = new Date();
    }, 30000);
    //inizializzo a home
    this.router.navigateByUrl('home');
  }
}
