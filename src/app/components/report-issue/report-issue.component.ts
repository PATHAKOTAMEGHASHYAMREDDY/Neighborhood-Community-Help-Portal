import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';
import { ReportService } from '../../services/report.service';
import { HelpRequestService } from '../../services/help-request.service';

@Component({
  selector: 'app-report-issue',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatIconModule],
  templateUrl: './report-issue.component.html',
  styleUrls: ['./report-issue.component.css']
})
export class ReportIssueComponent implements OnInit {
  isSidebarCollapsed: boolean = false;
  isLoading: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';
  showLogoutDialog: boolean = false;

  userRole: string = '';
  myRequests: any[] = [];

  reportData = {
    reported_user_id: 0,
    request_id: 0,
    issue_type: '',
    description: ''
  };

  issueTypes = [
    'Inappropriate Behavior',
    'Harassment',
    'Spam',
    'Fraud',
    'Other'
  ];

  constructor(
    public router: Router,
    private authService: AuthService,
    private reportService: ReportService,
    private helpRequestService: HelpRequestService
  ) {}

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    if (!user) {
      this.router.navigate(['/register']);
      return;
    }

    this.userRole = user.role;
    
    // Initialize sidebar as collapsed on mobile
    this.isSidebarCollapsed = window.innerWidth <= 768;
    
    this.loadMyRequests();
  }

  loadMyRequests() {
    this.helpRequestService.getMyRequests().subscribe({
      next: (response) => {
        this.myRequests = response.requests || [];
      },
      error: (error) => {
        console.error('Error loading requests:', error);
      }
    });
  }

  onRequestChange() {
    const selectedRequest = this.myRequests.find(
      r => r.id === Number(this.reportData.request_id)
    );
    if (selectedRequest) {
      if (this.userRole === 'Resident') {
        this.reportData.reported_user_id = selectedRequest.helper_id;
      } else {
        this.reportData.reported_user_id = selectedRequest.resident_id;
      }
    }
  }

  submitReport() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.reportData.request_id || this.reportData.request_id === 0) {
      this.errorMessage = 'Please select a request';
      return;
    }

    if (
      !this.reportData.reported_user_id ||
      !this.reportData.issue_type ||
      !this.reportData.description
    ) {
      this.errorMessage = 'Please fill in all required fields';
      return;
    }

    this.isLoading = true;

    this.reportService.submitReport(this.reportData).subscribe({
      next: (response) => {
        this.successMessage = response.message;
        this.isLoading = false;

        this.reportData = {
          reported_user_id: 0,
          request_id: 0,
          issue_type: '',
          description: ''
        };

        setTimeout(() => {
          if (this.userRole === 'Resident') {
            this.router.navigate(['/resident-dashboard']);
          } else {
            this.router.navigate(['/helper-dashboard']);
          }
        }, 2000);
      },
      error: (error) => {
        this.errorMessage = error.error?.error || 'Failed to submit report';
        this.isLoading = false;
      }
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
