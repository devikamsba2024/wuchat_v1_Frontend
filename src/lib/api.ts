// API service for backend communication
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  status?: 'sending' | 'sent' | 'delivered' | 'error';
}

export interface ChatRequest {
  message: string;
  user_id?: string;
  session_id?: string;
  context?: {
    user_name?: string;
    conversation_history?: ChatMessage[];
  };
}

export interface ChatResponse {
  response: string;
  session_id?: string;
  user_id?: string;
  status: 'success' | 'error';
  error_message?: string;
}

export class ChatAPI {
  private baseURL: string;
  private sessionId: string;
  private userId: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    this.sessionId = this.generateSessionId();
    this.userId = this.generateUserId();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateUserId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async sendMessage(
    message: string,
    context?: {
      user_name?: string;
      conversation_history?: ChatMessage[];
    }
  ): Promise<ChatResponse> {
    try {
      const requestBody: ChatRequest = {
        message: message.trim(),
        user_id: this.userId,
        session_id: this.sessionId,
        context: context || {}
      };

      const response = await fetch(`${this.baseURL}/api/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ChatResponse = await response.json();
      
      if (data.status === 'error') {
        throw new Error(data.error_message || 'Unknown error occurred');
      }

      return data;
    } catch (error) {
      console.error('Chat API Error:', error);
      
      // Return a fallback response for network errors
      return {
        response: "I'm sorry, I'm having trouble connecting to the server right now. Please try again in a moment.",
        session_id: this.sessionId,
        user_id: this.userId,
        status: 'error',
        error_message: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Method to reset session (useful for clearing chat)
  resetSession(): void {
    this.sessionId = this.generateSessionId();
    this.userId = this.generateUserId();
  }

  // Get current session info
  getSessionInfo(): { sessionId: string; userId: string } {
    return {
      sessionId: this.sessionId,
      userId: this.userId
    };
  }
}

// Create a singleton instance
export const chatAPI = new ChatAPI();

// Utility function to create a chat message
export function createChatMessage(
  content: string,
  isUser: boolean,
  status: ChatMessage['status'] = 'delivered'
): ChatMessage {
  return {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    content,
    isUser,
    timestamp: new Date(),
    status
  };
}

// Utility function to format error messages
export function formatErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred. Please try again.';
}
