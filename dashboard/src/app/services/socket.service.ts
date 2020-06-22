import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  
  private sub: Subscription;
  constructor(private socket: Socket) { }
  
  subToStream(){
    let obj = this.socket.fromEvent<any>("yo");  
    this.sub = obj.subscribe(obj => console.log(obj));
  }
}
