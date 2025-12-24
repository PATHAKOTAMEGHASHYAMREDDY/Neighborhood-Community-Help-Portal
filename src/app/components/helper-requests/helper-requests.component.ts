import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HelpRequestService, HelpRequest } from '../../services/help-request.service';

@Component({
  selector: 'app-helper-requests',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './helper-requests.component.html',
  styleUrl: './helper-requests.component.css'
})
export class HelperRequestsComponent implements OnInit {
  availableRequests: HelpRequest[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  isSidebarCollapsed: boolean = false;
  processingId: number | null = null;
  showLogoutDialog: boolean = false;

  // Summary counts
  availableCount: number = 0;
  acceptedCount: number = 0;
  inProgressCount: number = 0;
  completedCount: number = 0;

  constructor(
    private router: Router,
    private authService: AuthService,
    private helpRequestService: HelpRequestService
  ) {}

  ngOnInit() {
    // Verify user is a helper
    if (!this.authService.isHelper()) {
      this.router.navigate(['/register']);
      return;
    }

    this.loadAvailableRequests();
    this.loadMySummary();
  }

  loadAvailableRequests() {
    this.isLoading = true;
    this.errorMessage = '';

    this.helpRequestService.getAvailableRequests().subscribe({
      next: (response) => {
        this.availableRequests = response.requests || [];
        this.availableCount = this.availableRequests.length;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load available requests. Please try again.';
        this.isLoading = false;
        console.error('Error loading available requests:', error);
      }
    });
  }

  loadMySummary() {
    // Load helper's accepted tasks for summary
    this.helpRequestService.getMyRequests().subscribe({
      next: (response) => {
        const myTasks = response.requests || [];
        this.acceptedCount = myTasks.filter(r => r.status === 'Accepted').length;
        this.inProgressCount = myTasks.filter(r => r.status === 'In-progress').length;
        this.completedCount = myTasks.filter(r => r.status === 'Completed').length;
      },
      error: (error) => {
        console.error('Error loading summary:', error);
      }
    });
  }

  acceptRequest(requestId: number | undefined) {
    if (!requestId) return;

    this.processingId = requestId;
    this.errorMessage = '';
    this.successMessage = '';

    this.helpRequestService.acceptHelpRequest(requestId).subscribe({
      next: (response) => {
        this.successMessage = 'Request accepted successfully!';
        this.processingId = null;
        
        // Remove from available requests
        this.availableRequests = this.availableRequests.filter(r => r.id !== requestId);
        this.availableCount = this.availableRequests.length;
        
        // Update summary
        this.acceptedCount++;
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        this.errorMessage = 'Failed to accept request. Please try again.';
        this.processingId = null;
        console.error('Error accepting request:', error);
      }
    });
  }

  declineRequest(requestId: number | undefined) {
    if (!requestId) return;
    
    // For now, just remove from view (no backend endpoint for decline)
    this.availableRequests = this.availableRequests.filter(r => r.id !== requestId);
    this.availableCount = this.availableRequests.length;
    this.successMessage = 'Request declined.';
    
    setTimeout(() => {
      this.successMessage = '';
    }, 3000);
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
  }

  cancelLogout() {
    this.showLogoutDialog = false;
  }
}
