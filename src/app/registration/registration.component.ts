import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../services/auth.service';
import { PasswordResetService } from '../services/password-reset.service';
import lottie, { AnimationItem } from 'lottie-web';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.css'
})
export class RegistrationComponent implements OnInit, AfterViewInit {

  @ViewChild('lottieContainer', { static: false }) lottieContainer!: ElementRef;

  activeTab: 'login' | 'signup' = 'login';
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;

  showLoginPassword = false;
  showSignupPassword = false;
  showConfirmPassword = false;

  private lottieAnimation: AnimationItem | null = null;

  loginData = {
    contact_info: '',
    password: '',
    role: '' as 'Resident' | 'Helper' | 'Admin' | ''
  };

  signupData = {
    name: '',
    contact_info: '',
    location: '',
    password: '',
    confirmPassword: '',
    role: '' as 'Resident' | 'Helper' | ''
  };

  showForgotPasswordModal = false;
  forgotPasswordStep: 'email' | 'otp' | 'newPassword' = 'email';
  forgotPasswordData = {
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  };
  forgotPasswordMessage = '';
  forgotPasswordError = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    private passwordResetService: PasswordResetService
  ) {}

  ngOnInit() {
    // Initial load
  }

  ngAfterViewInit() {
    this.loadLottieAnimation();
  }

  loadLottieAnimation() {
    if (this.lottieAnimation) {
      this.lottieAnimation.destroy();
    }

    const animationPath = this.activeTab === 'login' 
      ? '/Login.json' 
      : '/register.json';

    if (this.lottieContainer && this.lottieContainer.nativeElement) {
      this.lottieAnimation = lottie.loadAnimation({
        container: this.lottieContainer.nativeElement,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: animationPath
      });
    }
  }

  switchTab(tab: 'login' | 'signup') {
    this.activeTab = tab;
    this.errorMessage = '';
    this.successMessage = '';
    
    // Reload animation when switching tabs
    setTimeout(() => {
      this.loadLottieAnimation();
    }, 100);
  }

  onForgotPassword() {
    this.showForgotPasswordModal = true;
    this.forgotPasswordStep = 'email';
    this.forgotPasswordData = {
      email: '',
      otp: '',
      newPassword: '',
      confirmPassword: ''
    };
    this.forgotPasswordMessage = '';
    this.forgotPasswordError = '';
  }

  closeForgotPasswordModal() {
    this.showForgotPasswordModal = false;
  }

  sendOTP() {
    this.forgotPasswordError = '';
    this.forgotPasswordMessage = '';

    if (!this.forgotPasswordData.email) {
      this.forgotPasswordError = 'Please enter your email';
      return;
    }

    this.isLoading = true;

    this.passwordResetService.sendOTP(this.forgotPasswordData.email).subscribe({
      next: () => {
        this.isLoading = false;
        this.forgotPasswordMessage = 'OTP sent to your email successfully!';
        this.forgotPasswordStep = 'otp';
      },
      error: (error) => {
        this.isLoading = false;
        this.forgotPasswordError = error.error?.error || 'Failed to send OTP';
      }
    });
  }

  verifyOTP() {
    this.forgotPasswordError = '';
    this.forgotPasswordMessage = '';

    if (!this.forgotPasswordData.otp) {
      this.forgotPasswordError = 'Please enter the OTP';
      return;
    }

    this.isLoading = true;

    this.passwordResetService.verifyOTP(
      this.forgotPasswordData.email,
      this.forgotPasswordData.otp
    ).subscribe({
      next: () => {
        this.isLoading = false;
        this.forgotPasswordMessage = 'OTP verified successfully!';
        this.forgotPasswordStep = 'newPassword';
      },
      error: (error) => {
        this.isLoading = false;
        this.forgotPasswordError = error.error?.error || 'Invalid OTP';
      }
    });
  }

  resetPassword() {
    this.forgotPasswordError = '';
    this.forgotPasswordMessage = '';

    if (!this.forgotPasswordData.newPassword || !this.forgotPasswordData.confirmPassword) {
      this.forgotPasswordError = 'Please fill in all fields';
      return;
    }

    if (this.forgotPasswordData.newPassword !== this.forgotPasswordData.confirmPassword) {
      this.forgotPasswordError = 'Passwords do not match';
      return;
    }

    if (this.forgotPasswordData.newPassword.length < 6) {
      this.forgotPasswordError = 'Password must be at least 6 characters';
      return;
    }

    this.isLoading = true;

    this.passwordResetService.resetPassword(
      this.forgotPasswordData.email,
      this.forgotPasswordData.otp,
      this.forgotPasswordData.newPassword
    ).subscribe({
      next: () => {
        this.isLoading = false;
        this.forgotPasswordMessage = 'Password reset successfully! You can now login.';

        setTimeout(() => {
          this.closeForgotPasswordModal();
          this.activeTab = 'login';
        }, 2000);
      },
      error: (error) => {
        this.isLoading = false;
        this.forgotPasswordError = error.error?.error || 'Failed to reset password';
      }
    });
  }

  onLogin() {
    this.errorMessage = '';

    if (!this.loginData.contact_info || !this.loginData.password || !this.loginData.role) {
      this.errorMessage = 'Please fill in all fields and select a role.';
      return;
    }

    this.isLoading = true;

    this.authService.login({
      contact_info: this.loginData.contact_info,
      password: this.loginData.password,
      role: this.loginData.role
    }).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));

        if (response.user.role === 'Admin') {
          this.router.navigate(['/admin']);
        } else if (response.user.role === 'Resident') {
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

    if (
      !this.signupData.name ||
      !this.signupData.contact_info ||
      !this.signupData.location ||
      !this.signupData.password ||
      !this.signupData.confirmPassword ||
      !this.signupData.role
    ) {
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

    this.authService.register({
      name: this.signupData.name,
      contact_info: this.signupData.contact_info,
      location: this.signupData.location,
      password: this.signupData.password,
      role: this.signupData.role
    }).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.successMessage = 'Account created successfully! Redirecting...';

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
        this.errorMessage =
          error.error?.error || 'Registration failed. Please try again.';
      }
    });
  }
}
