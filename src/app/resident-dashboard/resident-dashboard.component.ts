import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-resident-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './resident-dashboard.component.html',
  styleUrl: './resident-dashboard.component.css'
})
export class ResidentDashboardComponent implements OnInit {
  userName: string = '';

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    
    if (!user) {
      this.router.navigate(['/register']);
      return;
    }
    
    // Verify user is a resident
    if (user.role !== 'Resident') {
      this.router.navigate(['/register']);
      return;
    }
    
    // Redirect to new request dashboard
    this.router.navigate(['/requests']);
  }

  logout() {
    this.authService.logout();
  }
}
