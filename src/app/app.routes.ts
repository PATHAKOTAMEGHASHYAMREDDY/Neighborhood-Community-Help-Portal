import { Routes } from '@angular/router';
import { LandingComponent } from './landing/landing.component';
import { RegistrationComponent } from './registration/registration.component';
import { ResidentDashboardComponent } from './resident-dashboard/resident-dashboard.component';
import { HelperDashboardComponent } from './helper-dashboard/helper-dashboard.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'register', component: RegistrationComponent },
  { path: 'resident-dashboard', component: ResidentDashboardComponent },
  { path: 'helper-dashboard', component: HelperDashboardComponent },
  { path: '**', redirectTo: '' }
];
