import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface Report {
  id: number;
  reporter_id: number;
  reported_user_id: number;
  request_id?: number;
  issue_type: string;
  description: string;
  status: 'Pending' | 'Under Review' | 'Resolved' | 'Dismissed';
  admin_notes?: string;
  created_at: Date;
  reporter_name?: string;
  reporter_role?: string;
  reported_user_name?: string;
  reported_user_role?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private apiUrl = 'http://localhost:3000/api/reports';

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

  submitReport(data: {
    reported_user_id: number;
    request_id?: number;
    issue_type: string;
    description: string;
  }): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      this.apiUrl,
      data,
      { headers: this.getHeaders() }
    );
  }

  getMyReports(): Observable<{ success: boolean; reports: Report[] }> {
    return this.http.get<{ success: boolean; reports: Report[] }>(
      `${this.apiUrl}/my-reports`,
      { headers: this.getHeaders() }
    );
  }

  getAllReports(): Observable<{ success: boolean; reports: Report[] }> {
    return this.http.get<{ success: boolean; reports: Report[] }>(
      `${this.apiUrl}/all`,
      { headers: this.getHeaders() }
    );
  }

  getReportStats(): Observable<{ success: boolean; stats: any }> {
    return this.http.get<{ success: boolean; stats: any }>(
      `${this.apiUrl}/stats`,
      { headers: this.getHeaders() }
    );
  }

  updateReportStatus(reportId: number, status: string, admin_notes?: string): Observable<{ success: boolean; message: string }> {
    return this.http.put<{ success: boolean; message: string }>(
      `${this.apiUrl}/${reportId}/status`,
      { status, admin_notes },
      { headers: this.getHeaders() }
    );
  }
}
