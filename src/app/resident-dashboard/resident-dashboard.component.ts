import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-resident-dashboard',
  standalone: true,
  imports: [CommonModule, MatIconModule],
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

    if (user.role !== 'Resident') {
      this.router.navigate(['/register']);
      return;
    }

    this.userName = user.name;

    // Redirect to new request dashboard
    this.router.navigate(['/requests']);
  }

  logout() {
    this.authService.logout();
  }
}
