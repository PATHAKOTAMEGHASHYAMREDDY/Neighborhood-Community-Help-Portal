import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService, User } from '../../services/auth.service';
import { HelpRequestService } from '../../services/help-request.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MatIconModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  isSidebarCollapsed: boolean = false;
  isEditing: boolean = false;
  isSaving: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';

  editForm = {
    name: '',
    contact_info: '',
    location: ''
  };

  totalRequests: number = 0;
  pendingRequests: number = 0;
  completedRequests: number = 0;
  showLogoutDialog: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private helpRequestService: HelpRequestService
  ) {}

  ngOnInit() {
    this.user = this.authService.getCurrentUser();

    if (!this.user) {
      this.router.navigate(['/register']);
      return;
    }

    // Always start with sidebar collapsed on mobile
    this.isSidebarCollapsed = window.innerWidth <= 768;

    if (this.user.role === 'Resident') {
      this.loadStatistics();
    }
  }

  loadStatistics() {
    this.helpRequestService.getMyRequests().subscribe({
      next: (response) => {
        const requests = response.requests || [];
        this.totalRequests = requests.length;
        // Pending includes both 'Pending' and 'Accepted' statuses (not yet in progress)
        this.pendingRequests = requests.filter(r => 
          r.status === 'Pending' || r.status === 'Accepted'
        ).length;
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
    return new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  }

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  closeSidebarOnMobile() {
    if (window.innerWidth <= 768) {
      this.isSidebarCollapsed = true;
    }
  }

  navigateToDashboard() {
    if (this.user?.role === 'Resident') {
      this.router.navigate(['/requests']);
    } else if (this.user?.role === 'Helper') {
      this.router.navigate(['/helper/requests']);
    }
  }

  navigateToNewRequest() {
    this.router.navigate(['/requests/new']);
  }

  startEditing() {
    if (this.user) {
      this.editForm = {
        name: this.user.name,
        contact_info: this.user.contact_info,
        location: this.user.location
      };
      this.isEditing = true;
      this.successMessage = '';
      this.errorMessage = '';
    }
  }

  cancelEditing() {
    this.isEditing = false;
    this.successMessage = '';
    this.errorMessage = '';
  }

  saveProfile() {
    if (
      !this.editForm.name.trim() ||
      !this.editForm.contact_info.trim() ||
      !this.editForm.location.trim()
    ) {
      this.errorMessage = 'All fields are required';
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.updateProfile(this.editForm).subscribe({
      next: (response) => {
        this.user = response.user;
        this.isEditing = false;
        this.isSaving = false;
        this.successMessage = 'Profile updated successfully!';

        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        this.errorMessage =
          error.error?.error || 'Failed to update profile. Please try again.';
        this.isSaving = false;
      }
    });
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
