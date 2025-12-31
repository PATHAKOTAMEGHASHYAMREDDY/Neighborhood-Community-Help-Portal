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
  isLoading: boolean = true;

  categoryDistribution: any[] = [];
  dailyRequests: any[] = [];
  topHelpers: any[] = [];
  pieSegments: any[] = [];
  hoveredSegment: number | null = null;

  categoryColors: string[] = [
    '#667eea',
    '#764ba2',
    '#f093fb',
    '#4facfe',
    '#43e97b',
    '#fa709a',
    '#fee140',
    '#30cfd0'
  ];

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
        this.generatePieChart();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading analytics:', error);
        this.isLoading = false;
      }
    });
  }

  generatePieChart() {
    if (this.categoryDistribution.length === 0) return;

    const total = this.categoryDistribution.reduce((sum, item) => sum + item.count, 0);
    let currentAngle = -90; // Start from top

    this.pieSegments = this.categoryDistribution.map((item, index) => {
      const percentage = (item.count / total) * 100;
      const angle = (percentage / 100) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;

      const path = this.createArc(startAngle, endAngle, 80);
      currentAngle = endAngle;

      return {
        path,
        color: this.categoryColors[index % this.categoryColors.length],
        percentage,
        category: item.category,
        count: item.count
      };
    });
  }

  onSegmentHover(index: number) {
    this.hoveredSegment = index;
  }

  onSegmentLeave() {
    this.hoveredSegment = null;
  }

  createArc(startAngle: number, endAngle: number, radius: number): string {
    const start = this.polarToCartesian(0, 0, radius, endAngle);
    const end = this.polarToCartesian(0, 0, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

    return [
      'M', start.x, start.y,
      'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y,
      'L', 0, 0,
      'Z'
    ].join(' ');
  }

  polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
    const angleInRadians = (angleInDegrees * Math.PI) / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  }

  getCategoryColor(index: number): string {
    return this.categoryColors[index % this.categoryColors.length];
  }

  getPercentage(count: number): number {
    const total = this.categoryDistribution.reduce((sum, item) => sum + item.count, 0);
    return total > 0 ? (count / total) * 100 : 0;
  }

  logout() {
    this.authService.logout();
  }
}
