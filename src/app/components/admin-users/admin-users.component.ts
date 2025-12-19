import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AdminService, User } from '../../services/admin.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, RouterModule],
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
      const matchesSearch = user.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
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

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  logout() {
    this.authService.logout();
  }
}
