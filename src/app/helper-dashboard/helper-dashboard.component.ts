import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-helper-dashboard',
  standalone: true,
  imports: [CommonModule, MatIconModule],
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

    if (user.role !== 'Helper') {
      this.router.navigate(['/register']);
      return;
    }

    this.userName = user.name;

    // Redirect to helper requests page
    this.router.navigate(['/helper/requests']);
  }

  logout() {
    this.authService.logout();
  }
}
