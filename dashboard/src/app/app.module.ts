import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SemaphoreComponent } from './semaphore/semaphore.component';
import { SemaphoreListComponent } from './semaphore-list/semaphore-list.component';
import { SearchBarComponent } from './search-bar/search-bar.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { SemaphoreMapComponent } from './semaphore-map/semaphore-map.component';
import { MatInputModule } from '@angular/material/input';
import { MatGridListModule } from '@angular/material/grid-list';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { url } from 'config/backend.json'
const config: SocketIoConfig = { url: url.protocol + url.ip + url.port, options: {} };

@NgModule({
  declarations: [
    AppComponent,
    SemaphoreComponent,
    SemaphoreListComponent,
    SearchBarComponent,
    SemaphoreMapComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    SocketIoModule.forRoot(config),
    MatExpansionModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatDividerModule,
    MatInputModule,
    MatGridListModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
