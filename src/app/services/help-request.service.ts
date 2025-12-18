import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface HelpRequest {
  id?: number;
  resident_id?: number;
  helper_id?: number | null;
  title: string;
  description: string;
  category: string;
  status?: 'Pending' | 'Accepted' | 'In-progress' | 'Completed' | 'Rejected';
  attachments?: string | null;
  created_at?: Date;
  updated_at?: Date;
  resident_name?: string;
  resident_location?: string;
  helper_name?: string;
}

export interface HelpRequestResponse {
  message?: string;
  requestId?: number;
  requests?: HelpRequest[];
}

@Injectable({
  providedIn: 'root'
})
export class HelpRequestService {
  private apiUrl = 'http://localhost:3000/api/help-requests';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  createHelpRequest(request: HelpRequest): Observable<HelpRequestResponse> {
    return this.http.post<HelpRequestResponse>(
      this.apiUrl,
      request,
      { headers: this.getHeaders() }
    );
  }

  getAllHelpRequests(): Observable<HelpRequestResponse> {
    return this.http.get<HelpRequestResponse>(
      this.apiUrl,
      { headers: this.getHeaders() }
    );
  }

  getAvailableRequests(): Observable<HelpRequestResponse> {
    return this.http.get<HelpRequestResponse>(
      `${this.apiUrl}/available`,
      { headers: this.getHeaders() }
    );
  }

  getMyRequests(): Observable<HelpRequestResponse> {
    return this.http.get<HelpRequestResponse>(
      `${this.apiUrl}/my-requests`,
      { headers: this.getHeaders() }
    );
  }

  acceptHelpRequest(id: number): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(
      `${this.apiUrl}/${id}/accept`,
      {},
      { headers: this.getHeaders() }
    );
  }

  updateRequestStatus(id: number, status: string): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(
      `${this.apiUrl}/${id}/status`,
      { status },
      { headers: this.getHeaders() }
    );
  }
}
