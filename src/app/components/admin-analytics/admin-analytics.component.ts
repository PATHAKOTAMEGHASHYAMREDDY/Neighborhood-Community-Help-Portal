import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-admin-analytics',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule], // ✅ added
  templateUrl: './admin-analytics.component.html',
  styleUrls: ['./admin-analytics.component.css']
})
export class AdminAnalyticsComponent implements OnInit {
  isSidebarCollapsed: boolean = false;
  isLoading: boolean = true;

  categoryDistribution: any[] = [];
  dailyRequests: any[] = [];
  topHelpers: any[] = [];

  constructor(
    private router: Router,
    private authService: AuthService,
    private adminService: AdminService
  ) {}

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    if (!user || user.role !== 'Admin') {
      this.router.navigate(['/register']);
      return;
    }
    this.loadAnalytics();
  }

  loadAnalytics() {
    this.isLoading = true;
    this.adminService.getAnalytics().subscribe({
      next: (response) => {
        this.categoryDistribution = response.analytics.categoryDistribution;
        this.dailyRequests = response.analytics.dailyRequests;
        this.topHelpers = response.analytics.topHelpers;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading analytics:', error);
        this.isLoading = false;
      }
    });
  }

  getPercentage(count: number): number {
    const total = this.categoryDistribution.reduce((sum, item) => sum + item.count, 0);
    return total > 0 ? (count / total) * 100 : 0;
  }

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  logout() {
    this.authService.logout();
  }
}
