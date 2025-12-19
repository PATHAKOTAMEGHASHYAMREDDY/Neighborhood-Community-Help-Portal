import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HelpRequestService } from '../../services/help-request.service';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
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

  logout() {
    this.authService.logout();
  }
}
