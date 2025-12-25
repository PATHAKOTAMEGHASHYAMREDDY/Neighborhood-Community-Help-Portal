import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';
import { ReportService, Report } from '../../services/report.service';

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MatIconModule],
  templateUrl: './admin-reports.component.html',
  styleUrls: ['./admin-reports.component.css']
})
export class AdminReportsComponent implements OnInit {
  isSidebarCollapsed: boolean = false;
  isLoading: boolean = true;
  reports: Report[] = [];
  filteredReports: Report[] = [];
  filterStatus: string = 'All';
  
  totalReports: number = 0;
  pendingReports: number = 0;
  underReviewReports: number = 0;
  resolvedReports: number = 0;
  dismissedReports: number = 0;

  selectedReport: Report | null = null;
  showModal: boolean = false;
  modalStatus: string = '';
  modalNotes: string = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    private reportService: ReportService
  ) {}

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    if (!user || user.role !== 'Admin') {
      this.router.navigate(['/register']);
      return;
    }
    this.loadReports();
  }

  loadReports() {
    this.isLoading = true;
    this.reportService.getAllReports().subscribe({
      next: (response) => {
        this.reports = response.reports;
        this.filteredReports = this.reports;
        this.calculateStats();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading reports:', error);
        this.isLoading = false;
      }
    });
  }

  calculateStats() {
    this.totalReports = this.reports.length;
    this.pendingReports = this.reports.filter(r => r.status === 'Pending').length;
    this.underReviewReports = this.reports.filter(r => r.status === 'Under Review').length;
    this.resolvedReports = this.reports.filter(r => r.status === 'Resolved').length;
    this.dismissedReports = this.reports.filter(r => r.status === 'Dismissed').length;
  }

  filterReports(status: string) {
    this.filterStatus = status;
    if (status === 'All') {
      this.filteredReports = this.reports;
    } else {
      this.filteredReports = this.reports.filter(r => r.status === status);
    }
  }

  openReportModal(report: Report) {
    this.selectedReport = report;
    this.modalStatus = report.status;
    this.modalNotes = report.admin_notes || '';
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedReport = null;
  }

  updateReportStatus() {
    if (!this.selectedReport) return;

    this.reportService.updateReportStatus(
      this.selectedReport.id,
      this.modalStatus,
      this.modalNotes
    ).subscribe({
      next: () => {
        this.closeModal();
        this.loadReports();
      },
      error: (error) => {
        console.error('Error updating report:', error);
        alert('Failed to update report status');
      }
    });
  }

  getStatusClass(status: string): string {
    return 'status-' + status.toLowerCase().replace(' ', '-');
  }

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  logout() {
    this.authService.logout();
  }
}
