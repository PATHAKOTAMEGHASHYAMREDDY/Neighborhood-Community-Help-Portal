import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-helper-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './helper-dashboard.component.html',
  styleUrl: './helper-dashboard.component.css'
})
export class HelperDashboardComponent implements OnInit {
  userName: string = '';

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    
    if (!user) {
      this.router.navigate(['/register']);
      return;
    }
    
    // Verify user is a helper
    if (user.role !== 'Helper') {
      this.router.navigate(['/register']);
      return;
    }
    
    // Redirect to helper requests page
    this.router.navigate(['/helper/requests']);
  }

  logout() {
    this.authService.logout();
  }
}
