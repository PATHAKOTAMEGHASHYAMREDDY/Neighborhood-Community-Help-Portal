import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';
import { HelpRequestService } from '../../services/help-request.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  isSidebarCollapsed: boolean = false;
  
  // Statistics
  totalRequests: number = 0;
  pendingRequests: number = 0;
  completedRequests: number = 0;

  constructor(
    private router: Router,
    private authService: AuthService,
    private helpRequestService: HelpRequestService
  ) {}

  ngOnInit() {
    // Get current user
    this.user = this.authService.getCurrentUser();
    
    if (!this.user) {
      this.router.navigate(['/register']);
      return;
    }

    // Load statistics if resident
    if (this.user.role === 'Resident') {
      this.loadStatistics();
    }
  }

  loadStatistics() {
    this.helpRequestService.getMyRequests().subscribe({
      next: (response) => {
        const requests = response.requests || [];
        this.totalRequests = requests.length;
        this.pendingRequests = requests.filter(r => r.status === 'Pending').length;
        this.completedRequests = requests.filter(r => r.status === 'Completed').length;
      },
      error: (error) => {
        console.error('Error loading statistics:', error);
      }
    });
  }

  getInitials(): string {
    if (!this.user || !this.user.name) return '?';
    const names = this.user.name.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return this.user.name.substring(0, 2).toUpperCase();
  }

  getMemberSince(): string {
    // Since we don't have created_at in the user object from auth,
    // we'll show a generic message or current date
    return new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });
  }

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  navigateToDashboard() {
    if (this.user?.role === 'Resident') {
      this.router.navigate(['/requests']);
    } else {
      this.router.navigate(['/helper-dashboard']);
    }
  }

  navigateToNewRequest() {
    this.router.navigate(['/requests/new']);
  }

  logout() {
    this.authService.logout();
  }
}
