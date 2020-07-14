import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SemaphoreDetailsComponent } from './semaphore-details/semaphore-details.component';
import { HomeComponent } from './home/home.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent},
  //{ path: 'details', component: SemaphoreDetailsComponent}
  { path: 'details/:id/:humidity/:temperature/:pressure/:latitude/:longitude', component: SemaphoreDetailsComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
