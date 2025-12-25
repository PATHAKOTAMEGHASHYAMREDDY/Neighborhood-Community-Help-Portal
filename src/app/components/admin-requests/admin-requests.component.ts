import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';
import { HelpRequestService } from '../../services/help-request.service';

@Component({
  selector: 'app-admin-requests',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './admin-requests.component.html',
  styleUrls: ['./admin-requests.component.css']
})
export class AdminRequestsComponent implements OnInit {
  isSidebarCollapsed: boolean = false;
  requests: any[] = [];
  filteredRequests: any[] = [];
  isLoading: boolean = true;
  searchTerm: string = '';
  filterStatus: string = 'All';

  totalRequests: number = 0;
  pendingRequests: number = 0;
  acceptedRequests: number = 0;
  inProgressRequests: number = 0;
  completedRequests: number = 0;

  constructor(
    private router: Router,
    private authService: AuthService,
    private helpRequestService: HelpRequestService
  ) {}

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    if (!user || user.role !== 'Admin') {
      this.router.navigate(['/register']);
      return;
    }
    this.loadRequests();
  }

  loadRequests() {
    this.isLoading = true;
    this.helpRequestService.getAllHelpRequests().subscribe({
      next: (response) => {
        this.requests = response.requests || [];
        this.filteredRequests = this.requests;
        this.calculateStats();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading requests:', error);
        this.isLoading = false;
      }
    });
  }

  calculateStats() {
    this.totalRequests = this.requests.length;
    this.pendingRequests = this.requests.filter(r => r.status === 'Pending').length;
    this.acceptedRequests = this.requests.filter(r => r.status === 'Accepted').length;
    this.inProgressRequests = this.requests.filter(r => r.status === 'In-progress').length;
    this.completedRequests = this.requests.filter(r => r.status === 'Completed').length;
  }

  filterRequests() {
    this.filteredRequests = this.requests.filter(request => {
      const matchesSearch =
        request.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        request.category.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (request.resident_name &&
          request.resident_name.toLowerCase().includes(this.searchTerm.toLowerCase()));
      const matchesStatus = this.filterStatus === 'All' || request.status === this.filterStatus;
      return matchesSearch && matchesStatus;
    });
  }

  onSearchChange(event: any) {
    this.searchTerm = event.target.value;
    this.filterRequests();
  }

  onStatusFilterChange(status: string) {
    this.filterStatus = status;
    this.filterRequests();
  }

  getStatusClass(status: string): string {
    return 'status-' + status.toLowerCase();
  }

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  logout() {
    this.authService.logout();
  }
}
