import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HelpRequestService, HelpRequest } from '../../services/help-request.service';

@Component({
  selector: 'app-request-status',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './request-status.component.html',
  styleUrl: './request-status.component.css'
})
export class RequestStatusComponent implements OnInit {
  request: HelpRequest | null = null;
  isLoading: boolean = false;
  errorMessage: string = '';
  requestId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private helpRequestService: HelpRequestService
  ) {}

  ngOnInit() {
    // Verify user is authenticated
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/register']);
      return;
    }

    // Get request ID from route
    this.route.params.subscribe(params => {
      this.requestId = +params['id'];
      if (this.requestId) {
        this.loadRequestDetails();
      }
    });
  }

  loadRequestDetails() {
    this.isLoading = true;
    this.errorMessage = '';

    // Get all user's requests and find the specific one
    this.helpRequestService.getMyRequests().subscribe({
      next: (response) => {
        const requests = response.requests || [];
        this.request = requests.find(r => r.id === this.requestId) || null;
        
        if (!this.request) {
          this.errorMessage = 'Request not found or you do not have access to it.';
        }
        
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load request details. Please try again.';
        this.isLoading = false;
        console.error('Error loading request:', error);
      }
    });
  }

  isStepCompleted(stepStatus: string): boolean {
    if (!this.request || !this.request.status) return false;
    
    const statusOrder = ['Pending', 'Accepted', 'In-progress', 'Completed','Rejected'];
    const currentIndex = statusOrder.indexOf(this.request.status);
    const stepIndex = statusOrder.indexOf(stepStatus);
    
    return currentIndex >= stepIndex;
  }

  goBack() {
    this.router.navigate(['/requests']);
  }
}
