import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';
import { HelpRequestService, HelpRequest } from '../../services/help-request.service';

@Component({
  selector: 'app-request-list',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, FormsModule],
  templateUrl: './request-list.component.html',
  styleUrl: './request-list.component.css'
})
export class RequestListComponent implements OnInit {
  requests: HelpRequest[] = [];
  filteredRequests: HelpRequest[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';
  isSidebarCollapsed: boolean = false;
  showLogoutDialog: boolean = false;

  showCompleted: boolean = false;

  totalRequests: number = 0;
  pendingCount: number = 0;
  inProgressCount: number = 0;
  completedCount: number = 0;

  constructor(
    private router: Router,
    private authService: AuthService,
    private helpRequestService: HelpRequestService
  ) {}

  ngOnInit() {
    if (!this.authService.isResident()) {
      this.router.navigate(['/register']);
      return;
    }

    this.loadRequests();
  }

  loadRequests() {
    this.isLoading = true;
    this.errorMessage = '';

    this.helpRequestService.getMyRequests().subscribe({
      next: (response) => {
        this.requests = response.requests || [];
        this.calculateSummary();
        this.applyFilter();
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load requests. Please try again.';
        this.isLoading = false;
        console.error('Error loading requests:', error);
      }
    });
  }

  calculateSummary() {
    this.totalRequests = this.requests.length;
    this.pendingCount = this.requests.filter(r => r.status === 'Pending').length;
    this.inProgressCount = this.requests.filter(r => r.status === 'In-progress').length;
    this.completedCount = this.requests.filter(r => r.status === 'Completed').length;
  }

  applyFilter() {
    console.log('Applying filter. showCompleted:', this.showCompleted);
    console.log('Total requests:', this.requests.length);
    
    if (this.showCompleted) {
      // Show ONLY completed requests
      this.filteredRequests = this.requests.filter(r => {
        const status = r.status?.toLowerCase();
        return status === 'completed';
      });
    } else {
      // Show ONLY not completed requests (Pending, Accepted, In-progress)
      this.filteredRequests = this.requests.filter(r => {
        const status = r.status?.toLowerCase();
        return status !== 'completed';
      });
    }
    
    console.log('Filtered requests:', this.filteredRequests.length);
  }

  toggleCompletedFilter() {
    console.log('Checkbox toggled. New value:', this.showCompleted);
    this.applyFilter();
  }

  isStepCompleted(currentStatus: string | undefined, stepStatus: string): boolean {
    const statusOrder = ['Pending', 'Accepted', 'In-progress', 'Completed'];
    const currentIndex = statusOrder.indexOf(currentStatus || 'Pending');
    const stepIndex = statusOrder.indexOf(stepStatus);
    return currentIndex >= stepIndex;
  }

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  navigateToNewRequest() {
    this.router.navigate(['/requests/new']);
  }

  viewRequestStatus(requestId: number | undefined) {
    if (requestId) {
      this.router.navigate(['/requests', requestId, 'status']);
    }
  }

  openChat(requestId: number | undefined) {
    if (requestId) {
      this.router.navigate(['/chat', requestId]);
    }
  }

  logout() {
    this.showLogoutDialog = true;
  }

  confirmLogout() {
    this.showLogoutDialog = false;
    this.authService.logout();
  }

  cancelLogout() {
    this.showLogoutDialog = false;
  }
}
