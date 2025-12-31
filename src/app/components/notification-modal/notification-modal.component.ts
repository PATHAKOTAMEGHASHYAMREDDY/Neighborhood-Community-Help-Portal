import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { NotificationService, Notification } from '../../services/notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notification-modal',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './notification-modal.component.html',
  styleUrls: ['./notification-modal.component.css']
})
export class NotificationModalComponent implements OnInit, OnDestroy {
  showModal = false;
  notification: Notification | null = null;
  private subscription?: Subscription;

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    this.subscription = this.notificationService.notification$.subscribe(
      (notification) => {
        this.notification = notification;
        this.showModal = true;
      }
    );
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  onConfirm() {
    if (this.notification?.confirmCallback) {
      this.notification.confirmCallback();
    }
    this.close();
  }

  onCancel() {
    if (this.notification?.cancelCallback) {
      this.notification.cancelCallback();
    }
    this.close();
  }

  close() {
    this.showModal = false;
    setTimeout(() => {
      this.notification = null;
    }, 300);
  }

  getIcon(): string {
    switch (this.notification?.type) {
      case 'success': return 'check_circle';
      case 'error': return 'error';
      case 'warning': return 'warning';
      case 'info': return 'info';
      case 'confirm': return 'help_outline';
      default: return 'info';
    }
  }

  getIconClass(): string {
    return `icon-${this.notification?.type}`;
  }
}
