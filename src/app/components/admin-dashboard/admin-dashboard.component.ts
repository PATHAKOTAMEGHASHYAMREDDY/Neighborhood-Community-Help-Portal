import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {

  pendingRequests: any[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadPendingRequests();
  }

  loadPendingRequests() {
    this.isLoading = true;
    this.adminService.getPendingRequests().subscribe({
      next: (res) => {
        this.pendingRequests = res.requests;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load requests';
        this.isLoading = false;
      }
    });
  }

  approve(id: number) {
    this.adminService.approveRequest(id).subscribe(() => {
      this.loadPendingRequests(); // refresh list
    });
  }

  reject(id: number) {
    this.adminService.rejectRequest(id).subscribe(() => {
      this.loadPendingRequests(); // refresh list
    });
  }
}
