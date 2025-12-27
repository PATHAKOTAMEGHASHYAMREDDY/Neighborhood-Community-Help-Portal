import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';
import { HelpRequestService, HelpRequest } from '../../services/help-request.service';

@Component({
  selector: 'app-helper-tasks',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './helper-tasks.component.html',
  styleUrl: './helper-tasks.component.css'
})
export class HelperTasksComponent implements OnInit {
  myTasks: HelpRequest[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  isSidebarCollapsed: boolean = false;
  updatingId: number | null = null;
  showLogoutDialog: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private helpRequestService: HelpRequestService
  ) {}

  ngOnInit() {
    if (!this.authService.isHelper()) {
      this.router.navigate(['/register']);
      return;
    }

    this.loadMyTasks();
  }

  loadMyTasks() {
    this.isLoading = true;
    this.errorMessage = '';

    this.helpRequestService.getMyRequests().subscribe({
      next: (response) => {
        this.myTasks = response.requests || [];
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load your tasks. Please try again.';
        this.isLoading = false;
        console.error('Error loading tasks:', error);
      }
    });
  }

  updateStatus(requestId: number | undefined, newStatus: string) {
    if (!requestId) return;

    this.updatingId = requestId;
    this.errorMessage = '';
    this.successMessage = '';

    this.helpRequestService.updateRequestStatus(requestId, newStatus).subscribe({
      next: () => {
        this.successMessage = `Status updated to ${newStatus}!`;
        this.updatingId = null;

        const task = this.myTasks.find(t => t.id === requestId);
        if (task) {
          task.status = newStatus as any;
        }

        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        this.errorMessage = 'Failed to update status. Please try again.';
        this.updatingId = null;
        console.error('Error updating status:', error);
      }
    });
  }

  getStatusClass(status: string | undefined): string {
    if (!status) return 'status-pending';
    return 'status-' + status.toLowerCase();
  }

  canStartProgress(status: string | undefined): boolean {
    return status === 'Accepted';
  }

  canComplete(status: string | undefined): boolean {
    return status === 'In-progress';
  }

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
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
