import { Routes } from '@angular/router';
import { LandingComponent } from './landing/landing.component';
import { RegistrationComponent } from './registration/registration.component';
import { ResidentDashboardComponent } from './resident-dashboard/resident-dashboard.component';
import { HelperDashboardComponent } from './helper-dashboard/helper-dashboard.component';
import { RequestListComponent } from './components/request-list/request-list.component';
import { HelpRequestComponent } from './components/help-request/help-request.component';
import { RequestStatusComponent } from './components/request-status/request-status.component';
import { ProfileComponent } from './components/profile/profile.component';
import { HelperRequestsComponent } from './components/helper-requests/helper-requests.component';
import { HelperTasksComponent } from './components/helper-tasks/helper-tasks.component';
import { ChatComponent } from './components/chat/chat.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'register', component: RegistrationComponent },
  { path: 'resident-dashboard', component: ResidentDashboardComponent },
  { path: 'helper-dashboard', component: HelperDashboardComponent },
  { path: 'requests', component: RequestListComponent },
  { path: 'requests/new', component: HelpRequestComponent },
  { path: 'requests/:id/status', component: RequestStatusComponent },
  { path: 'helper/requests', component: HelperRequestsComponent },
  { path: 'helper/tasks', component: HelperTasksComponent },
  { path: 'chat/:id', component: ChatComponent },
  { path: 'profile', component: ProfileComponent },
  { path: '**', redirectTo: '' }
];
