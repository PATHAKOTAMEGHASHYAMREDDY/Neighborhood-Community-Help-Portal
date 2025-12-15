import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.css'
})
export class RegistrationComponent {
  activeTab: 'login' | 'signup' = 'login';
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;

  loginData = {
    contact_info: '',
    password: '',
    role: '' as 'Resident' | 'Helper' | ''
  };

  signupData = {
    name: '',
    contact_info: '',
    location: '',
    password: '',
    confirmPassword: '',
    role: '' as 'Resident' | 'Helper' | ''
  };

  constructor(private router: Router, private authService: AuthService) {}

  switchTab(tab: 'login' | 'signup') {
    this.activeTab = tab;
    this.errorMessage = '';
    this.successMessage = '';
  }

  onLogin() {
    this.errorMessage = '';
    
    // Validation
    if (!this.loginData.contact_info || !this.loginData.password || !this.loginData.role) {
      this.errorMessage = 'Please fill in all fields and select a role.';
      return;
    }

    this.isLoading = true;

    // Call API
    this.authService.login({
      contact_info: this.loginData.contact_info,
      password: this.loginData.password,
      role: this.loginData.role as 'Resident' | 'Helper'
    }).subscribe({
      next: (response) => {
        this.isLoading = false;
        // Redirect based on role
        if (response.user.role === 'Resident') {
          this.router.navigate(['/resident-dashboard']);
        } else {
          this.router.navigate(['/helper-dashboard']);
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.error || 'Login failed. Please try again.';
      }
    });
  }

  onSignup() {
    this.errorMessage = '';
    this.successMessage = '';

    // Validation
    if (!this.signupData.name || !this.signupData.contact_info || 
        !this.signupData.location || !this.signupData.password || 
        !this.signupData.confirmPassword || !this.signupData.role) {
      this.errorMessage = 'Please fill in all fields and select a role.';
      return;
    }

    if (this.signupData.password !== this.signupData.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    if (this.signupData.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters long.';
      return;
    }

    this.isLoading = true;

    // Call API
    this.authService.register({
      name: this.signupData.name,
      contact_info: this.signupData.contact_info,
      location: this.signupData.location,
      password: this.signupData.password,
      role: this.signupData.role as 'Resident' | 'Helper'
    }).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = 'Account created successfully! Redirecting...';

        // Redirect after 1.5 seconds
        setTimeout(() => {
          if (response.user.role === 'Resident') {
            this.router.navigate(['/resident-dashboard']);
          } else {
            this.router.navigate(['/helper-dashboard']);
          }
        }, 1500);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.error || 'Registration failed. Please try again.';
      }
    });
  }
}
