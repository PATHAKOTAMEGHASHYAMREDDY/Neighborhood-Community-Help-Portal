import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';
import { AdminService, User } from '../../services/admin.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.css']
})
export class AdminUsersComponent implements OnInit {
  isSidebarCollapsed: boolean = false;
  users: User[] = [];
  filteredUsers: User[] = [];
  isLoading: boolean = true;
  searchTerm: string = '';
  filterRole: string = 'All';

  totalUsers: number = 0;
  totalResidents: number = 0;
  totalHelpers: number = 0;

  constructor(
    private router: Router,
    private authService: AuthService,
    private adminService: AdminService
  ) {}

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    if (!user || user.role !== 'Admin') {
      this.router.navigate(['/register']);
      return;
    }
    this.loadUsers();
  }

  loadUsers() {
    this.isLoading = true;
    this.adminService.getAllUsers().subscribe({
      next: (response) => {
        this.users = response.users;
        this.filteredUsers = this.users;
        this.calculateStats();
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
  }

  onSearchChange(event: any) {
    this.searchTerm = event.target.value;
    this.filterUsers();
  }

  onRoleFilterChange(role: string) {
    this.filterRole = role;
    this.filterUsers();
  }

  blockUser(userId: number) {
    if (!confirm('Are you sure you want to block this user? They will not be able to create requests or help others.')) {
      return;
    }

    this.adminService.blockUser(userId).subscribe({
      next: () => {
        const user = this.users.find(u => u.id === userId);
        if (user) user.is_blocked = true;
        this.filterUsers();
        alert('User blocked successfully');
      },
      error: (error) => {
        console.error('Error blocking user:', error);
        alert('Failed to block user. Please try again.');
      }
    });
  }

  unblockUser(userId: number) {
    if (!confirm('Are you sure you want to unblock this user?')) {
      return;
    }

    this.adminService.unblockUser(userId).subscribe({
      next: () => {
        const user = this.users.find(u => u.id === userId);
        if (user) user.is_blocked = false;
        this.filterUsers();
        alert('User unblocked successfully');
      },
      error: (error) => {
        console.error('Error unblocking user:', error);
        alert('Failed to unblock user. Please try again.');
      }
    });
  }

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  logout() {
    this.authService.logout();
  }
}
