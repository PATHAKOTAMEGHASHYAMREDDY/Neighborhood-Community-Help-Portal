import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';
import { AdminService, User } from '../../services/admin.service';
import { NotificationService } from '../../services/notification.service';
import { NotificationModalComponent } from '../notification-modal/notification-modal.component';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, NotificationModalComponent],
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.css']
})
export class AdminUsersComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  paginatedUsers: User[] = [];
  isLoading: boolean = true;
  isSidebarCollapsed: boolean = false;
  searchTerm: string = '';
  filterRole: string = 'All';
  sortOrder: string = 'desc';

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 0;

  totalUsers: number = 0;
  totalResidents: number = 0;
  totalHelpers: number = 0;

  constructor(
    private router: Router,
    private authService: AuthService,
    private adminService: AdminService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    if (!user || user.role !== 'Admin') {
      this.router.navigate(['/register']);
      return;
    }
    this.isSidebarCollapsed = window.innerWidth <= 768;
    this.loadUsers();
  }

  loadUsers() {
    this.isLoading = true;
    this.adminService.getAllUsers().subscribe({
      next: (response) => {
        this.users = response.users;
        this.filteredUsers = this.users;
        this.calculateStats();
        this.updatePagination();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.isLoading = false;
      }
    });
  }

  calculateStats() {
    this.totalUsers = this.users.length;
    this.totalResidents = this.users.filter(u => u.role === 'Resident').length;
    this.totalHelpers = this.users.filter(u => u.role === 'Helper').length;
  }

  filterUsers() {
    this.filteredUsers = this.users.filter(user => {
      const matchesSearch =
        user.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.contact_info.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.location.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesRole = this.filterRole === 'All' || user.role === this.filterRole;
      return matchesSearch && matchesRole;
    });
    this.sortUsers();
    this.currentPage = 1;
    this.updatePagination();
  }

  sortUsers() {
    this.filteredUsers.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return this.sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredUsers.length / this.itemsPerPage);
    if (this.totalPages === 0) this.totalPages = 1;
    if (this.currentPage > this.totalPages) this.currentPage = 1;
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedUsers = this.filteredUsers.slice(startIndex, endIndex);
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
    this.filterUsers();
  }

  onRoleFilterChange(role: string) {
    this.filterRole = role;
    this.filterUsers();
  }

  onSortOrderChange(order: string) {
    this.sortOrder = order;
    this.sortUsers();
    this.updatePagination();
  }

  blockUser(userId: number) {
    this.notificationService.confirm(
      'Block User',
      'Are you sure you want to block this user? They will not be able to create requests or help others.',
      () => {
        this.adminService.blockUser(userId).subscribe({
          next: () => {
            const user = this.users.find(u => u.id === userId);
            if (user) user.is_blocked = true;
            this.filterUsers();
            this.notificationService.success('Success', 'User blocked successfully');
          },
          error: (error) => {
            console.error('Error blocking user:', error);
            this.notificationService.error('Error', 'Failed to block user. Please try again.');
          }
        });
      }
    );
  }

  unblockUser(userId: number) {
    this.notificationService.confirm(
      'Unblock User',
      'Are you sure you want to unblock this user?',
      () => {
        this.adminService.unblockUser(userId).subscribe({
          next: () => {
            const user = this.users.find(u => u.id === userId);
            if (user) user.is_blocked = false;
            this.filterUsers();
            this.notificationService.success('Success', 'User unblocked successfully');
          },
          error: (error) => {
            console.error('Error unblocking user:', error);
            this.notificationService.error('Error', 'Failed to unblock user. Please try again.');
          }
        });
      }
    );
  }

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  closeSidebarOnMobile() {
    if (window.innerWidth <= 768) {
      setTimeout(() => {
        this.isSidebarCollapsed = true;
      }, 0);
    }
  }

  logout() {
    this.authService.logout();
  }
}
