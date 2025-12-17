import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ChatService, ChatMessage, ChatInfo } from '../../services/chat.service';
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
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

  // Common emojis
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

    // Get request ID from route
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
      // Get chat info
      this.chatService.getChatInfo(this.requestId).subscribe({
        next: async (response) => {
          this.chatInfo = response.request;
          
          // Verify user is part of this chat
          if (this.currentUser?.id !== this.chatInfo.residentId && 
              this.currentUser?.id !== this.chatInfo.helperId) {
            this.errorMessage = 'You are not authorized to view this chat.';
            this.isLoading = false;
            return;
          }

          // Connect socket and join room
          this.chatService.connectSocket();
          const joined = await this.chatService.joinRoom(this.requestId, this.currentUser!.id);
          
          if (!joined) {
            this.errorMessage = 'Failed to join chat room.';
            this.isLoading = false;
            return;
          }

          // Load existing messages
          this.loadMessages();

          // Subscribe to new messages
          this.chatService.messages$.subscribe(message => {
            this.messages.push(message);
            this.shouldScrollToBottom = true;
          });

          // Subscribe to typing indicator
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
        this.messages = response.messages;
        this.shouldScrollToBottom = true;
      },
      error: (error) => {
        console.error('Error loading messages:', error);
      }
    });
  }

  sendMessage() {
    if (!this.newMessage.trim() || !this.currentUser || !this.chatInfo) {
      return;
    }

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

  getMessageTime(timestamp: Date): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  scrollToBottom() {
    try {
      if (this.messageContainer) {
        this.messageContainer.nativeElement.scrollTop = 
          this.messageContainer.nativeElement.scrollHeight;
      }
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
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

