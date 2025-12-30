import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

export interface ChatMessage {
  id?: number;
  requestId: number;
  senderId: number;
  senderRole: 'Resident' | 'Helper' | 'Admin';
  messageText: string;
  timestamp: Date;
  senderName?: string;
}

export interface ChatInfo {
  id: number;
  title: string;
  category: string;
  status: string;
  residentId: number;
  residentName: string;
  helperId: number;
  helperName: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = `${environment.apiUrl}/api/chat`;
  private socketUrl = environment.socketUrl;
  private socket: Socket | null = null;
  
  private messageSubject = new Subject<ChatMessage>();
  public messages$ = this.messageSubject.asObservable();
  
  private typingSubject = new Subject<{ userId: number; isTyping: boolean }>();
  public typing$ = this.typingSubject.asObservable();

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

  // HTTP Methods
  getChatInfo(requestId: number): Observable<{ request: ChatInfo }> {
    return this.http.get<{ request: ChatInfo }>(
      `${this.apiUrl}/${requestId}/info`,
      { headers: this.getHeaders() }
    );
  }

  getChatMessages(requestId: number): Observable<{ messages: ChatMessage[] }> {
    return this.http.get<{ messages: ChatMessage[] }>(
      `${this.apiUrl}/${requestId}/messages`,
      { headers: this.getHeaders() }
    );
  }

  // WebSocket Methods
  connectSocket(): void {
    if (!this.socket) {
      this.socket = io(this.socketUrl, {
        transports: ['websocket', 'polling']
      });

      this.socket.on('connect', () => {
        console.log('Socket connected:', this.socket?.id);
      });

      this.socket.on('receiveMessage', (message: ChatMessage) => {
        this.messageSubject.next(message);
      });

      this.socket.on('userTyping', (data: { userId: number; isTyping: boolean }) => {
        this.typingSubject.next(data);
      });

      this.socket.on('disconnect', () => {
        console.log('Socket disconnected');
      });
    }
  }

  joinRoom(requestId: number, userId: number): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.socket) {
        this.connectSocket();
      }

      this.socket?.emit('joinRoom', { requestId, userId });

      this.socket?.once('joinedRoom', (response: { success: boolean; message: string }) => {
        console.log('Join room response:', response);
        resolve(response.success);
      });
    });
  }

  sendMessage(message: ChatMessage): void {
    if (this.socket) {
      this.socket.emit('sendMessage', message);
    }
  }

  sendTypingIndicator(requestId: number, userId: number, isTyping: boolean): void {
    if (this.socket) {
      this.socket.emit('typing', { requestId, userId, isTyping });
    }
  }

  disconnectSocket(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}
