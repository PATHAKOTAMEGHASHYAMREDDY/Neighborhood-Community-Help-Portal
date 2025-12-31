import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { HelpRequestService } from '../../services/help-request.service';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MatIconModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  adminName: string = '';
  
  totalUsers: number = 0;
  totalResidents: number = 0;
  totalHelpers: number = 0;
  totalRequests: number = 0;
  completedRequests: number = 0;
  pendingRequests: number = 0;
  acceptedRequests: number = 0;
  inProgressRequests: number = 0;
  
  recentRequests: any[] = [];
  recentUsers: any[] = [];
  
  isLoading: boolean = true;
  isSidebarCollapsed: boolean = false;

  // Download modal
  showDownloadModal: boolean = false;
  selectedReportType: 'daily' | 'weekly' = 'daily';
  isDownloading: boolean = false;
  downloadingType: 'users' | 'requests' | 'reports' | '' = '';
  requestsTimeFilter: 'all' | 'daily' | 'weekly' = 'all';
  reportsTimeFilter: 'all' | 'daily' | 'weekly' = 'all';

  constructor(
    private router: Router,
    private authService: AuthService,
    private helpRequestService: HelpRequestService,
    private adminService: AdminService
  ) {}

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    
    if (!user) {
      this.router.navigate(['/register']);
      return;
    }
    
    if (user.role !== 'Admin') {
      this.router.navigate(['/register']);
      return;
    }
    
    this.adminName = user.name;
    this.isSidebarCollapsed = window.innerWidth <= 768;
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.isLoading = true;
    
    this.adminService.getUserStats().subscribe({
      next: (response) => {
        this.totalUsers = response.stats.total_users;
        this.totalResidents = response.stats.total_residents;
        this.totalHelpers = response.stats.total_helpers;
      },
      error: (error) => {
        console.error('Error loading user stats:', error);
      }
    });
    
    this.helpRequestService.getAllHelpRequests().subscribe({
      next: (response) => {
        const requests = response.requests || [];
        this.totalRequests = requests.length;
        this.completedRequests = requests.filter((r: any) => r.status === 'Completed').length;
        this.pendingRequests = requests.filter((r: any) => r.status === 'Pending').length;
        this.acceptedRequests = requests.filter((r: any) => r.status === 'Accepted').length;
        this.inProgressRequests = requests.filter((r: any) => r.status === 'In-progress').length;
        
        this.recentRequests = requests.slice(0, 5);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.isLoading = false;
      }
    });
  }

  getStatusClass(status: string): string {
    return 'status-' + status.toLowerCase();
  }

  openDownloadModal() {
    this.showDownloadModal = true;
    this.requestsTimeFilter = 'all';
    this.reportsTimeFilter = 'all';
  }

  closeDownloadModal() {
    this.showDownloadModal = false;
    this.downloadingType = '';
  }

  downloadUsersReport() {
    this.isDownloading = true;
    this.downloadingType = 'users';

    this.adminService.getAllUsers().subscribe({
      next: (response) => {
        if (response.success && response.users.length > 0) {
          this.generateUsersCSV(response.users);
        } else {
          alert('No users data found.');
        }
        this.isDownloading = false;
        this.downloadingType = '';
      },
      error: (error) => {
        console.error('Error downloading users report:', error);
        alert('Failed to download users report. Please try again.');
        this.isDownloading = false;
        this.downloadingType = '';
      }
    });
  }

  downloadRequestsReport() {
    this.isDownloading = true;
    this.downloadingType = 'requests';

    this.helpRequestService.getAllHelpRequests().subscribe({
      next: (response) => {
        let requests = response.requests || [];
        
        // Filter by time
        if (this.requestsTimeFilter === 'daily') {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          requests = requests.filter((r: any) => new Date(r.created_at) >= today);
        } else if (this.requestsTimeFilter === 'weekly') {
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          requests = requests.filter((r: any) => new Date(r.created_at) >= weekAgo);
        }

        if (requests.length > 0) {
          this.generateRequestsCSV(requests, this.requestsTimeFilter);
        } else {
          alert('No requests data found for the selected time period.');
        }
        this.isDownloading = false;
        this.downloadingType = '';
      },
      error: (error) => {
        console.error('Error downloading requests report:', error);
        alert('Failed to download requests report. Please try again.');
        this.isDownloading = false;
        this.downloadingType = '';
      }
    });
  }

  downloadUserReports() {
    this.isDownloading = true;
    this.downloadingType = 'reports';

    this.adminService.getAllReports(this.reportsTimeFilter).subscribe({
      next: (response) => {
        if (response.success && response.reports.length > 0) {
          this.generateUserReportsCSV(response.reports, this.reportsTimeFilter);
        } else {
          alert('No user reports data found for the selected time period.');
        }
        this.isDownloading = false;
        this.downloadingType = '';
      },
      error: (error) => {
        console.error('Error downloading user reports:', error);
        alert('Failed to download user reports. Please try again.');
        this.isDownloading = false;
        this.downloadingType = '';
      }
    });
  }

  generateUsersCSV(users: any[]) {
    const headers = ['ID', 'Name', 'Email/Phone', 'Location', 'Role', 'Status', 'Joined Date'];
    const rows = users.map(user => [
      user.id,
      `"${user.name}"`,
      `"${user.contact_info}"`,
      `"${user.location}"`,
      user.role,
      user.is_blocked ? 'Blocked' : 'Active',
      new Date(user.created_at).toLocaleString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `users-report-${timestamp}.csv`;

    this.downloadCSV(csvContent, filename);
  }

  generateRequestsCSV(requests: any[], timeFilter: string) {
    const headers = ['ID', 'Title', 'Description', 'Category', 'Status', 'Resident Name', 'Helper Name', 'Created Date', 'Updated Date'];
    const rows = requests.map((req: any) => [
      req.id,
      `"${req.title}"`,
      `"${(req.description || '').replace(/"/g, '""')}"`,
      req.category,
      req.status,
      req.resident_name || 'N/A',
      req.helper_name || 'Unassigned',
      new Date(req.created_at).toLocaleString(),
      new Date(req.updated_at).toLocaleString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `requests-${timeFilter}-${timestamp}.csv`;

    this.downloadCSV(csvContent, filename);
  }

  generateUserReportsCSV(reports: any[], timeFilter: string) {
    const headers = ['ID', 'Reporter Name', 'Reported User', 'Issue Type', 'Description', 'Status', 'Admin Notes', 'Created Date'];
    const rows = reports.map((report: any) => [
      report.id,
      `"${report.reporter_name}"`,
      `"${report.reported_user_name}"`,
      report.issue_type,
      `"${(report.description || '').replace(/"/g, '""')}"`,
      report.status,
      `"${(report.admin_notes || 'N/A').replace(/"/g, '""')}"`,
      new Date(report.created_at).toLocaleString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `user-reports-${timeFilter}-${timestamp}.csv`;

    this.downloadCSV(csvContent, filename);
  }

  downloadCSV(csvContent: string, filename: string) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  closeSidebarOnMobile() {
    if (window.innerWidth <= 768) {
      setTimeout(() => {
        this.isSidebarCollapsed = true;
      }, 0);
    }
  }

  logout() {
    this.authService.logout();
  }
}
