import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { SensorData } from '../models/sensor-data';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  constructor(private socket: Socket) { }

  //connection status
  connect(){
    return this.socket.fromEvent<string>("connect");
  }
  connectError(){
    return this.socket.fromEvent<string>("connect_error");
  }
  connectTimeout(){
    return this.socket.fromEvent<string>("connect_timeout");
  }
  disconnect(){
    return this.socket.fromEvent<string>("disconnect");
  }

  //data streams
  subToStream(){
    return this.socket.fromEvent<SensorData>("Traffik");  
  }
  subToDetails(){
    return this.socket.fromEvent<any>("Dettagli");  
  }
  subToCoordinates(){
    return this.socket.fromEvent<any>("Coordinate");  
  }
  getCoordinates() {
    this.socket.emit('GetIncroci');
  }
  details(id: number){
    this.socket.emit("Dettagli", id);
  }
}
