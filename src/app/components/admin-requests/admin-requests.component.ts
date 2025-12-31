import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';
import { HelpRequestService } from '../../services/help-request.service';

@Component({
  selector: 'app-admin-requests',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './admin-requests.component.html',
  styleUrls: ['./admin-requests.component.css']
})
export class AdminRequestsComponent implements OnInit {
  requests: any[] = [];
  filteredRequests: any[] = [];
  paginatedRequests: any[] = [];
  isLoading: boolean = true;
  searchTerm: string = '';
  filterStatus: string = 'All';
  sortOrder: string = 'desc';

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 0;

  totalRequests: number = 0;
  pendingRequests: number = 0;
  acceptedRequests: number = 0;
  inProgressRequests: number = 0;
  completedRequests: number = 0;

  constructor(
    private router: Router,
    private authService: AuthService,
    private helpRequestService: HelpRequestService
  ) {}

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    if (!user || user.role !== 'Admin') {
      this.router.navigate(['/register']);
      return;
    }
    this.loadRequests();
  }

  loadRequests() {
    this.isLoading = true;
    this.helpRequestService.getAllHelpRequests().subscribe({
      next: (response) => {
        this.requests = response.requests || [];
        this.filteredRequests = this.requests;
        this.calculateStats();
        this.updatePagination();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading requests:', error);
        this.isLoading = false;
      }
    });
  }

  calculateStats() {
    this.totalRequests = this.requests.length;
    this.pendingRequests = this.requests.filter(r => r.status === 'Pending').length;
    this.acceptedRequests = this.requests.filter(r => r.status === 'Accepted').length;
    this.inProgressRequests = this.requests.filter(r => r.status === 'In-progress').length;
    this.completedRequests = this.requests.filter(r => r.status === 'Completed').length;
  }

  filterRequests() {
    this.filteredRequests = this.requests.filter(request => {
      const matchesSearch =
        request.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        request.category.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (request.resident_name &&
          request.resident_name.toLowerCase().includes(this.searchTerm.toLowerCase()));
      const matchesStatus = this.filterStatus === 'All' || request.status === this.filterStatus;
      return matchesSearch && matchesStatus;
    });
    this.sortRequests();
    this.currentPage = 1;
    this.updatePagination();
  }

  sortRequests() {
    this.filteredRequests.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return this.sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredRequests.length / this.itemsPerPage);
    if (this.totalPages === 0) this.totalPages = 1;
    if (this.currentPage > this.totalPages) this.currentPage = 1;
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedRequests = this.filteredRequests.slice(startIndex, endIndex);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  onSearchChange(event: any) {
    this.searchTerm = event.target.value;
    this.filterRequests();
  }

  onStatusFilterChange(status: string) {
    this.filterStatus = status;
    this.filterRequests();
  }

  onSortOrderChange(order: string) {
    this.sortOrder = order;
    this.sortRequests();
    this.updatePagination();
  }

  getStatusClass(status: string): string {
    return 'status-' + status.toLowerCase();
  }

  logout() {
    this.authService.logout();
  }
}
