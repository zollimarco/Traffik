import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SemaphoreComponent } from './semaphore/semaphore.component';
import { SemaphoreListComponent } from './semaphore-list/semaphore-list.component';
import { SearchBarComponent } from './search-bar/search-bar.component';
import { SemaphoreDetailsComponent } from './semaphore-details/semaphore-details.component';
import { HomeComponent } from './home/home.component'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
//Material Design
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { SemaphoreMapComponent } from './semaphore-map/semaphore-map.component';
import { MatInputModule } from '@angular/material/input';
import { MatGridListModule } from '@angular/material/grid-list';
//API
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { url } from 'config/backend.json';
const config: SocketIoConfig = { url: url.protocol + url.ip + url.port, options: {} };
//Plugins
import { SafePipeModule } from 'safe-pipe';

@NgModule({
  declarations: [
    AppComponent,
    SemaphoreComponent,
    SemaphoreListComponent,
    SearchBarComponent,
    SemaphoreMapComponent,
    SemaphoreDetailsComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    SocketIoModule.forRoot(config),
    SafePipeModule,
    MatExpansionModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatDividerModule,
    MatInputModule,
    MatGridListModule,
    MatCardModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
