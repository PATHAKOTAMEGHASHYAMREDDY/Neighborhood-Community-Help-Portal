import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HelpRequestService } from '../../services/help-request.service';

@Component({
  selector: 'app-help-request',
  standalone: true,
  imports: [CommonModule, FormsModule],
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

  constructor(
    private router: Router,
    private authService: AuthService,
    private helpRequestService: HelpRequestService
  ) {}

  ngOnInit() {
    // Verify user is a resident
    if (!this.authService.isResident()) {
      this.router.navigate(['/register']);
    }
  }

  onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';

    // Validation
    if (!this.requestData.title || !this.requestData.description || !this.requestData.category) {
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
      next: (response) => {
        this.isLoading = false;
        this.successMessage = 'Request created successfully! Redirecting...';
        
        // Redirect to dashboard after 1.5 seconds
        setTimeout(() => {
          this.router.navigate(['/requests']);
        }, 1500);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.error || 'Failed to create request. Please try again.';
      }
    });
  }

  goBack() {
    this.router.navigate(['/requests']);
  }
}
