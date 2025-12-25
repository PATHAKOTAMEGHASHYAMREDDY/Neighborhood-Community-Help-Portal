import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { HelpRequestService } from '../../services/help-request.service';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  adminName: string = '';
  isSidebarCollapsed: boolean = false;
  
  // Analytics Data
  totalUsers: number = 0;
  totalResidents: number = 0;
  totalHelpers: number = 0;
  totalRequests: number = 0;
  completedRequests: number = 0;
  pendingRequests: number = 0;
  acceptedRequests: number = 0;
  inProgressRequests: number = 0;
  
  // Recent data
  recentRequests: any[] = [];
  recentUsers: any[] = [];
  
  isLoading: boolean = true;

  // Download modal
  showDownloadModal: boolean = false;
  selectedReportType: 'daily' | 'weekly' = 'daily';
  isDownloading: boolean = false;

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
    
    // Verify user is an admin
    if (user.role !== 'Admin') {
      this.router.navigate(['/register']);
      return;
    }
    
    this.adminName = user.name;
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.isLoading = true;
    
    // Load user stats from admin service
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
    
    // Load all help requests for analytics
    this.helpRequestService.getAllHelpRequests().subscribe({
      next: (response) => {
        const requests = response.requests || [];
        this.totalRequests = requests.length;
        this.completedRequests = requests.filter((r: any) => r.status === 'Completed').length;
        this.pendingRequests = requests.filter((r: any) => r.status === 'Pending').length;
        this.acceptedRequests = requests.filter((r: any) => r.status === 'Accepted').length;
        this.inProgressRequests = requests.filter((r: any) => r.status === 'In-progress').length;
        
        // Get recent requests (last 5)
        this.recentRequests = requests.slice(0, 5);
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.isLoading = false;
      }
    });
  }

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  getStatusClass(status: string): string {
    return 'status-' + status.toLowerCase();
  }

  openDownloadModal() {
    this.showDownloadModal = true;
    this.selectedReportType = 'daily';
  }

  closeDownloadModal() {
    this.showDownloadModal = false;
  }

  downloadReport() {
    this.isDownloading = true;

    this.adminService.getReportsData(this.selectedReportType).subscribe({
      next: (response) => {
        if (response.success && response.data.length > 0) {
          this.generateAndDownloadCSV(response.data, this.selectedReportType);
          this.closeDownloadModal();
        } else if (response.data.length === 0) {
          alert('No data found for the selected report type.');
          this.isDownloading = false;
        }
      },
      error: (error) => {
        console.error('Error downloading report:', error);
        alert('Failed to download report. Please try again.');
        this.isDownloading = false;
      }
    });
  }

  generateAndDownloadCSV(data: any[], reportType: string) {
    if (!data || data.length === 0) {
      alert('No data available to download');
      this.isDownloading = false;
      return;
    }

    const headers = ['ID', 'Title', 'Description', 'Category', 'Status', 'Resident Name', 'Helper Name', 'Date'];
    const rows = data.map(item => [
      item.id,
      item.title,
      `"${(item.description || '').replace(/"/g, '""')}"`,
      item.category,
      item.status,
      item.resident_name || 'N/A',
      item.helper_name || 'N/A',
      new Date(item.created_at).toLocaleString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${reportType}-report-${timestamp}.csv`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.isDownloading = false;
  }

  logout() {
    this.authService.logout();
  }
}
