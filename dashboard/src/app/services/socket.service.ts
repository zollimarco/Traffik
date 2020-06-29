import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Subscription } from 'rxjs';
import { SensorData } from '../models/sensor-data';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  constructor(private socket: Socket) { }
  
  subToStream(){
    return this.socket.fromEvent<SensorData>("Traffik");  
  }
}
