import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  private baseUrl = 'http://localhost:3000/api/admin';

  constructor(private http: HttpClient) {}

  // Get all pending help requests
  getPendingRequests() {
    return this.http.get<any>(`${this.baseUrl}/requests/pending`);
  }

  // Approve a help request
  approveRequest(id: number) {
    return this.http.put(`${this.baseUrl}/requests/${id}/approve`, {});
  }

  // Reject a help request
  rejectRequest(id: number) {
    return this.http.put(`${this.baseUrl}/requests/${id}/reject`, {});
  }
}
