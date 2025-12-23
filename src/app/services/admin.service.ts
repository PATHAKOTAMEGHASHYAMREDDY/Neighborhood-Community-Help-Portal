import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface User {
  id: number;
  name: string;
  contact_info: string;
  location: string;
  role: 'Resident' | 'Helper';
  is_blocked: boolean;
  created_at: Date;
}

export interface UserStats {
  total_users: number;
  total_residents: number;
  total_helpers: number;
}

export interface RequestStats {
  total_requests: number;
  pending: number;
  accepted: number;
  in_progress: number;
  completed: number;
}

export interface Analytics {
  categoryDistribution: { category: string; count: number }[];
  dailyRequests: { date: string; count: number }[];
  topHelpers: { helper_name: string; total_tasks: number; completed_tasks: number }[];
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'http://localhost:3000/api/admin';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getAllUsers(): Observable<{ success: boolean; users: User[] }> {
    return this.http.get<{ success: boolean; users: User[] }>(
      `${this.apiUrl}/users`,
      { headers: this.getHeaders() }
    );
  }

  getUserStats(): Observable<{ success: boolean; stats: UserStats }> {
    return this.http.get<{ success: boolean; stats: UserStats }>(
      `${this.apiUrl}/stats/users`,
      { headers: this.getHeaders() }
    );
  }

  getRequestStats(): Observable<{ success: boolean; stats: RequestStats }> {
    return this.http.get<{ success: boolean; stats: RequestStats }>(
      `${this.apiUrl}/stats/requests`,
      { headers: this.getHeaders() }
    );
  }

  getAnalytics(): Observable<{ success: boolean; analytics: Analytics }> {
    return this.http.get<{ success: boolean; analytics: Analytics }>(
      `${this.apiUrl}/analytics`,
      { headers: this.getHeaders() }
    );
  }

  blockUser(userId: number): Observable<{ success: boolean; message: string }> {
    return this.http.put<{ success: boolean; message: string }>(
      `${this.apiUrl}/users/${userId}/block`,
      {},
      { headers: this.getHeaders() }
    );
  }

  unblockUser(userId: number): Observable<{ success: boolean; message: string }> {
    return this.http.put<{ success: boolean; message: string }>(
      `${this.apiUrl}/users/${userId}/unblock`,
      {},
      { headers: this.getHeaders() }
    );
  }
}
