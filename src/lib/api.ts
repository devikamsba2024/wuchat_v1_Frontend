// API service for backend communication
const API_BASE_URL = (typeof window !== 'undefined' 
  ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8501')
  : 'http://localhost:8501');

export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  status?: 'sending' | 'sent' | 'delivered' | 'error';
}

export interface ChatRequest {
  q: string;  // Your backend expects 'q' instead of 'message'
  message?: string;  // Keep for backward compatibility
  user_id?: string;
  session_id?: string;
  context?: {
    user_name?: string;
    conversation_history?: ChatMessage[];
  };
}

export interface ChatResponse {
  success?: boolean;
  status?: 'OK' | 'error';
  data?: {
    response: string;
    confidence: number;
    source_url: string;
    timestamp: string;
  } | null;
  error?: string;  // Your backend returns error in this field
  answer?: {
    fact_type?: string;
    deadline_type?: string;
    level?: string;
    audience?: string;
    date_iso?: string;
    timezone?: string;
    text: string;
    confidence?: number;
  };
  source?: {
    url: string;
    quote: string;
  };
  session_id?: string;
  user_id?: string;
  error_message?: string;
}

export class ChatAPI {
  private baseURL: string;
  private sessionId: string;
  private userId: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL || 'http://localhost:8501';
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
        q: message.trim(),  // Use 'q' field that your backend expects
        user_id: this.userId,
        session_id: this.sessionId,
        context: context || {}
      };

      const url = `${this.baseURL}/api/ask`;
      
      let response;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);
      
      try {
        response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
      } catch (fetchError) {
        clearTimeout(timeoutId);
        
        // Check if it's an abort error (timeout)
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          console.error('API request timed out after 60 seconds');
          throw new Error('Request timed out. The server is taking too long to respond. Please try again.');
        }
        
        // Check if it's a network error
        if (fetchError instanceof TypeError && fetchError.message.includes('fetch')) {
          console.error('API request failed: Network error');
          throw new Error('Network error: Unable to connect to the server. Please check your connection and try again.');
        }
        
        console.error('API request failed:', fetchError instanceof Error ? fetchError.message : String(fetchError));
        throw fetchError;
      }

      // ⚠️ CRITICAL: Read response text ONCE (can only be read once!)
      const contentType = response.headers.get('content-type');
      
      let responseText: string;
      try {
        responseText = await response.text();
      } catch (textError) {
        console.error('Failed to read response text:', textError);
        throw new Error('Failed to read response from backend');
      }

      if (!response.ok) {
        // Handle 403 Forbidden specifically (likely CORS or auth issue)
        if (response.status === 403) {
          console.error('API: 403 Forbidden from backend');
          throw new Error(`Backend returned 403 Forbidden. This may be a CORS or authentication issue. Please check your backend configuration.`);
        }
        console.error('API: HTTP error, status:', response.status);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Check if response is JSON
      if (!contentType || !contentType.includes('application/json')) {
        console.error('API: Non-JSON response from backend, Content-Type:', contentType);
        throw new Error('Backend returned non-JSON response');
      }

      // Parse JSON
      let data: ChatResponse & { answer?: string | { text: string; confidence?: number }; sources?: Array<{ source_file?: string; text_snippet?: string }> };
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError);
        console.error('Response text:', responseText);
        throw parseError;
      }
      
      // Handle your backend's response format
      if (data.success === false) {
        // Convert backend error to a user-friendly response
        return {
          status: 'OK',
          answer: {
            text: data.error || 'I apologize, but I couldn\'t find specific information about that. Please try rephrasing your question or ask about admissions, programs, or campus life.',
            confidence: 0.1
          },
          source: {
            url: '',
            quote: ''
          },
          session_id: this.sessionId,
          user_id: this.userId
        };
      }
      
      if (data.status === 'error') {
        throw new Error(data.error_message || 'Backend returned error status');
      }

      // Handle new backend format: { answer: string, sources: array, ... }
      // This is the PRIMARY format your backend uses
      if (data.answer !== undefined && data.answer !== null && typeof data.answer === 'string') {
        const sourceUrl = data.sources && Array.isArray(data.sources) && data.sources[0]?.source_file 
          ? `https://wichita.edu/${data.sources[0].source_file}` 
          : '';
        const sourceQuote = data.sources && Array.isArray(data.sources) && data.sources[0]?.text_snippet 
          ? data.sources[0].text_snippet 
          : '';
        
        // Create the response object with explicit structure
        const answerText = String(data.answer).trim();
        if (!answerText || answerText.length === 0) {
          throw new Error('Answer text is empty');
        }
        
        const result: ChatResponse = {
          status: 'OK' as const,
          answer: {
            text: answerText,
            confidence: 0.9
          },
          source: {
            url: String(sourceUrl),
            quote: String(sourceQuote)
          },
          session_id: data.session_id || this.sessionId,
          user_id: data.user_id || this.userId
        };
        
        // Verify the structure before returning
        if (!result.answer || !result.answer.text || result.answer.text.length === 0) {
          throw new Error('Failed to create valid response structure: answer.text is missing or empty');
        }
        
        return result;
      }

      // Convert old backend format: { success: true, data: { response: string, ... } }
      if (data.success && data.data) {
        return {
          status: 'OK',
          answer: {
            text: data.data.response,
            confidence: data.data.confidence || 0.9
          },
          source: {
            url: data.data.source_url || '',
            quote: data.data.response
          },
          session_id: this.sessionId,
          user_id: this.userId
        };
      }

      // If response already has answer object, return as-is
      if (data.answer && typeof data.answer === 'object') {
        return {
          status: 'OK',
          answer: data.answer,
          source: data.source || { url: '', quote: '' },
          session_id: data.session_id || this.sessionId,
          user_id: data.user_id || this.userId
        };
      }

      // Fallback: if we have any text in the response, use it
      const fallbackText = 
        (typeof data.answer === 'string' ? data.answer : null) ||
        (data.data?.response) ||
        (('response' in data && typeof (data as { response?: string }).response === 'string') ? (data as { response: string }).response : null) ||
        (data.answer && typeof data.answer === 'object' && 'text' in data.answer ? (data.answer as { text: string }).text : null) ||
        JSON.stringify(data);
      
      const fallbackResult = {
        status: 'OK' as const,
        answer: {
          text: fallbackText || 'No response received from backend',
          confidence: 0.5
        },
        source: {
          url: data.sources && data.sources[0]?.source_file ? `https://wichita.edu/${data.sources[0].source_file}` : '',
          quote: data.sources && data.sources[0]?.text_snippet ? data.sources[0].text_snippet : ''
        },
        session_id: data.session_id || this.sessionId,
        user_id: data.user_id || this.userId
      };
      return fallbackResult;
    } catch (error) {
      console.error('API error:', error instanceof Error ? error.message : String(error));
      
      // Check if it's a timeout error
      const isTimeoutError = error instanceof Error && (
        error.message.includes('timed out') || 
        error.message.includes('Request timed out') ||
        error.name === 'AbortError'
      );
      
      // Check if it's a network error
      const isNetworkError = error instanceof TypeError && error.message.includes('fetch');
      
      // Check if it's a 403 Forbidden error
      const isForbiddenError = error instanceof Error && error.message.includes('403 Forbidden');
      
      // Return appropriate error message
      let errorMessage = "I'm sorry, there was an error processing your request. Please try again.";
      if (isTimeoutError) {
        errorMessage = "The request timed out. The server is taking too long to respond. Please try again with a simpler question or check if the backend is running properly.";
      } else if (isNetworkError) {
        errorMessage = "I'm sorry, I'm having trouble connecting to the server right now. Please try again in a moment.";
      } else if (isForbiddenError) {
        errorMessage = "I'm having trouble connecting to the backend server. Please check that the backend is running and configured to allow requests from this origin (CORS).";
      }
      
      return {
        status: 'error' as const,
        answer: {
          text: errorMessage,
          confidence: 0
        },
        session_id: this.sessionId,
        user_id: this.userId,
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
