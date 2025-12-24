import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ReportService, Report } from '../../services/report.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-my-reports',
  imports: [CommonModule, RouterModule],
  templateUrl: './my-reports.component.html',
  styleUrl: './my-reports.component.css'
})
export class MyReportsComponent implements OnInit {
  reports: Report[] = [];
  filteredReports: Report[] = [];
  loading = false;
  selectedStatus = 'All';
  userRole: string = '';
  isSidebarCollapsed: boolean = false;
  showLogoutDialog: boolean = false;

  constructor(
    private reportService: ReportService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    this.userRole = user?.role || '';
    this.loadMyReports();
  }

  loadMyReports() {
    this.loading = true;
    this.reportService.getMyReports().subscribe({
      next: (response) => {
        if (response.success) {
          this.reports = response.reports;
          this.filterReports();
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading reports:', error);
        this.loading = false;
      }
    });
  }

  filterReports() {
    if (this.selectedStatus === 'All') {
      this.filteredReports = this.reports;
    } else {
      this.filteredReports = this.reports.filter(r => r.status === this.selectedStatus);
    }
  }

  onStatusFilterChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.selectedStatus = target.value;
    this.filterReports();
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Pending': return 'status-pending';
      case 'Under Review': return 'status-review';
      case 'Resolved': return 'status-resolved';
      case 'Dismissed': return 'status-dismissed';
      default: return '';
    }
  }

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  logout() {
    this.showLogoutDialog = true;
  }

  confirmLogout() {
    this.showLogoutDialog = false;
    this.authService.logout();
    this.router.navigate(['/']);
  }

  cancelLogout() {
    this.showLogoutDialog = false;
  }
}
