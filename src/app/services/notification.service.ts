import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Notification {
  type: 'success' | 'error' | 'warning' | 'info' | 'confirm';
  title: string;
  message: string;
  confirmCallback?: () => void;
  cancelCallback?: () => void;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationSubject = new Subject<Notification>();
  notification$ = this.notificationSubject.asObservable();

  success(title: string, message: string) {
    this.notificationSubject.next({
      type: 'success',
      title,
      message
    });
  }

  error(title: string, message: string) {
    this.notificationSubject.next({
      type: 'error',
      title,
      message
    });
  }

  warning(title: string, message: string) {
    this.notificationSubject.next({
      type: 'warning',
      title,
      message
    });
  }

  info(title: string, message: string) {
    this.notificationSubject.next({
      type: 'info',
      title,
      message
    });
  }

  confirm(title: string, message: string, onConfirm: () => void, onCancel?: () => void) {
    this.notificationSubject.next({
      type: 'confirm',
      title,
      message,
      confirmCallback: onConfirm,
      cancelCallback: onCancel
    });
  }
}
