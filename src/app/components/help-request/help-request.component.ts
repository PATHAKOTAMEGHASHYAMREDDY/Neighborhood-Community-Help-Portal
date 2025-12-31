import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';
import { HelpRequestService } from '../../services/help-request.service';

@Component({
  selector: 'app-help-request',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatIconModule],
  templateUrl: './help-request.component.html',
  styleUrl: './help-request.component.css'
})
export class HelpRequestComponent implements OnInit {

  requestData = {
    title: '',
    description: '',
    category: '',
    attachments: ''
  };

  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  isSidebarCollapsed: boolean = false;
  showLogoutDialog: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private helpRequestService: HelpRequestService
  ) {}

  ngOnInit(): void {
    if (!this.authService.isResident()) {
      this.router.navigate(['/register']);
      return;
    }
    
    // Initialize sidebar as collapsed on mobile
    this.isSidebarCollapsed = window.innerWidth <= 768;
  }

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  closeSidebarOnMobile() {
    if (window.innerWidth <= 768) {
      this.isSidebarCollapsed = true;
    }
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (
      !this.requestData.title ||
      !this.requestData.description ||
      !this.requestData.category
    ) {
      this.errorMessage = 'Please fill in all required fields.';
      return;
    }

    this.isLoading = true;

    this.helpRequestService.createHelpRequest({
      title: this.requestData.title,
      description: this.requestData.description,
      category: this.requestData.category,
      attachments: this.requestData.attachments || null
    }).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Request created successfully! Redirecting...';

        setTimeout(() => {
          this.router.navigate(['/requests']);
        }, 1500);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage =
          error.error?.error || 'Failed to create request. Please try again.';
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/requests']);
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
