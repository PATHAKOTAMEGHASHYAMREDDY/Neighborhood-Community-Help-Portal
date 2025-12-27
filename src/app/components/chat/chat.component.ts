import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ChatService, ChatMessage, ChatInfo } from '../../services/chat.service';
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messageContainer') private messageContainer!: ElementRef;
  
  requestId: number = 0;
  chatInfo: ChatInfo | null = null;
  messages: ChatMessage[] = [];
  newMessage: string = '';
  currentUser: User | null = null;
  isLoading: boolean = true;
  errorMessage: string = '';
  otherUserTyping: boolean = false;
  showEmojiPicker: boolean = false;
  
  private shouldScrollToBottom: boolean = false;

  emojis: string[] = [
    '😊', '😂', '❤️', '👍', '👎', '🙏', '👏', '🎉', 
    '😍', '😢', '😎', '🤔', '😅', '🔥', '✅', '❌',
    '💯', '🙌', '👌', '💪', '🤝', '⭐', '✨', '💡'
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private chatService: ChatService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    
    if (!this.currentUser) {
      this.router.navigate(['/register']);
      return;
    }

    this.route.params.subscribe(params => {
      this.requestId = +params['id'];
      this.initializeChat();
    });
  }

  ngAfterViewChecked() {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  ngOnDestroy() {
    this.chatService.disconnectSocket();
  }

  async initializeChat() {
    try {
      this.chatService.getChatInfo(this.requestId).subscribe({
        next: async (response) => {
          this.chatInfo = response.request;
          
          if (
            this.currentUser?.id !== this.chatInfo.residentId &&
            this.currentUser?.id !== this.chatInfo.helperId
          ) {
            this.errorMessage = 'You are not authorized to view this chat.';
            this.isLoading = false;
            return;
          }

          this.chatService.connectSocket();
          const joined = await this.chatService.joinRoom(this.requestId, this.currentUser!.id);
          
          if (!joined) {
            this.errorMessage = 'Failed to join chat room.';
            this.isLoading = false;
            return;
          }

          this.loadMessages();

          this.chatService.messages$.subscribe(message => {
            this.messages.push(message);
            this.shouldScrollToBottom = true;
          });

          this.chatService.typing$.subscribe(data => {
            if (data.userId !== this.currentUser?.id) {
              this.otherUserTyping = data.isTyping;
            }
          });

          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading chat info:', error);
          this.errorMessage = error.error?.error || 'Failed to load chat. Please try again.';
          this.isLoading = false;
        }
      });
    } catch (error) {
      console.error('Error initializing chat:', error);
      this.errorMessage = 'Failed to initialize chat.';
      this.isLoading = false;
    }
  }

  loadMessages() {
    this.chatService.getChatMessages(this.requestId).subscribe({
      next: (response) => {
        this.messages = response.messages || [];
        this.shouldScrollToBottom = true;
      },
      error: () => {
        this.errorMessage = 'Failed to load messages.';
      }
    });
  }

  sendMessage() {
    if (!this.newMessage.trim() || !this.currentUser || !this.chatInfo) return;

    const message: ChatMessage = {
      requestId: this.requestId,
      senderId: this.currentUser.id,
      senderRole: this.currentUser.role,
      messageText: this.newMessage.trim(),
      timestamp: new Date()
    };

    this.chatService.sendMessage(message);
    this.newMessage = '';
    this.showEmojiPicker = false;
    this.stopTyping();
  }

  onTyping() {
    if (this.currentUser) {
      this.chatService.sendTypingIndicator(this.requestId, this.currentUser.id, true);
    }
  }

  stopTyping() {
    if (this.currentUser) {
      this.chatService.sendTypingIndicator(this.requestId, this.currentUser.id, false);
    }
  }

  addEmoji(emoji: string) {
    this.newMessage += emoji;
    this.showEmojiPicker = false;
  }

  toggleEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  isMyMessage(message: ChatMessage): boolean {
    return message.senderId === this.currentUser?.id;
  }

  getMessageTime(timestamp: Date | string): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  scrollToBottom() {
    if (this.messageContainer) {
      this.messageContainer.nativeElement.scrollTop =
        this.messageContainer.nativeElement.scrollHeight;
    }
  }

  goBack() {
    if (this.currentUser?.role === 'Resident') {
      this.router.navigate(['/requests']);
    } else {
      this.router.navigate(['/helper/tasks']);
    }
  }
}
