'use client';
import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Send, RotateCcw, ThumbsUp, ThumbsDown, Copy, Check } from 'lucide-react';
import { chatAPI, createChatMessage, formatErrorMessage, type ChatMessage } from '@/lib/api';
import StructuredMessage from './StructuredMessage';

// Message interface is now imported from api.ts


interface MessageWithData extends ChatMessage {
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
}

export default function SimpleChat() {
  const [messages, setMessages] = useState<MessageWithData[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [isWaitingForName, setIsWaitingForName] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);


  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputValue]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Format relative time
  const formatRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  // Copy message to clipboard
  const handleCopyMessage = async (messageId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      console.error('Failed to copy message:', err);
    }
  };


  const handleYesNoClick = (response: 'yes' | 'no') => {
    const userMessage: MessageWithData = {
      ...createChatMessage(
        response === 'yes' ? 'Yes' : 'No',
        true,
        'sending'
      )
    };

    setMessages(prev => [...prev, userMessage]);
    setError(null);
    setIsTyping(true);

    setTimeout(() => {
      setMessages(prev => prev.map(msg =>
        msg.id === userMessage.id ? { ...msg, status: 'sent' } : msg
      ));
    }, 500);

    setTimeout(() => {
      let botResponse: string;
      if (response === 'yes') {
        botResponse = "Great! Please tell me your name so I can address you properly. 😊";
        // Keep isWaitingForName as true - user still needs to provide their name
      } else {
        botResponse = "No problem! I'll just call you 'friend' then. How can I help you today? 😊";
        setUserName('friend');
        setIsWaitingForName(false);
      }

      const botMessage = createChatMessage(botResponse, false, 'delivered');

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  // Initialize welcome message
  useEffect(() => {
    const welcomeMessage = createChatMessage(
      "Hey there! 👋 I'm wuchat, your virtual guide to Wichita State University. Ask me about admissions, programs, events, or anything else! 🌾 Before we get started, can you share your name, that way I know who I'm chatting with?",
      false,
      'delivered'
    );
    welcomeMessage.id = 'welcome';
    setMessages([welcomeMessage]);
    setIsWaitingForName(true);
  }, []);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = createChatMessage(inputValue.trim(), true, 'sending');
    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue.trim();
    setInputValue('');
    setError(null);
    setIsTyping(true);

    // Update user message status to sent
    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === userMessage.id ? { ...msg, status: 'sent' } : msg
      ));
    }, 500);

    try {
      // Handle name collection
      if (isWaitingForName) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        let botResponse: string;
        if (currentInput.toLowerCase().includes('yes') || currentInput.toLowerCase().includes('sure') || currentInput.toLowerCase().includes('ok')) {
          botResponse = "Great! Please tell me your name so I can address you properly. 😊";
          // Keep isWaitingForName as true - user still needs to provide name
        } else if (currentInput.toLowerCase().includes('no') || currentInput.toLowerCase().includes('not') || currentInput.toLowerCase().includes('skip')) {
          botResponse = "No problem! I'll just call you 'friend' then. How can I help you today? 😊";
          setUserName('friend');
          setIsWaitingForName(false);
        } else {
          // User provided their name directly
          setUserName(currentInput);
          botResponse = `Nice to meet you, ${currentInput}! 😊 I'm excited to help you with any questions about Wichita State University. What would you like to know?`;
          setIsWaitingForName(false);
        }
        
        const botMessage: MessageWithData = {
          ...createChatMessage(botResponse, false, 'delivered')
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
          // Regular conversation - use backend API
          try {
            const context = {
              user_name: userName || undefined,
              conversation_history: messages.slice(-10) // Send last 10 messages for context
            };

            const response = await chatAPI.sendMessage(currentInput, context);

            if (response.status === 'error') {
              throw new Error(response.error_message || 'Backend error occurred');
            }

            // SIMPLE DIRECT FIX: Use answer.text directly, no complex logic
            let messageContent: string;
            
            if (response.answer?.text) {
              messageContent = response.answer.text;
            } else if (typeof response.answer === 'string') {
              messageContent = response.answer;
            } else if (response.data?.response) {
              messageContent = response.data.response;
            } else {
              messageContent = 'I apologize, but I could not process the response. Please try again.';
            }
            
            // Add personalized greeting if this is the first response after name collection
            if (userName && userName !== 'friend' && messages.filter(m => !m.isUser && !m.id?.includes('welcome')).length === 0) {
              messageContent = `Hi ${userName}! ${messageContent}`;
            }
            
            const botMessage: MessageWithData = {
              ...createChatMessage(messageContent, false, 'delivered'),
              answer: response.answer,
              source: response.source
            };
            
            setMessages(prev => [...prev, botMessage]);
          } catch (apiError) {
            console.error('Backend API unavailable, using fallback response:', apiError);
          
          // Fallback response when backend is unavailable
          const fallbackResponses = [
            "Thank you for your question! I'm here to help with information about Wichita State University.",
            "That's a great question! For more details, please visit our official website at wichita.edu.",
            "I'd be happy to help! You can also contact OneStop at (316) 978-7676 for assistance.",
            "Thanks for reaching out! Check out our website for the most up-to-date information.",
            "Great question! Feel free to explore our campus or contact our admissions office for more details."
          ];
          
          let randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
          
          // Add personalized greeting if user has provided their name
          if (userName && userName !== 'friend') {
            randomResponse = `Hi ${userName}! ${randomResponse}`;
          }
          
          const botMessage: MessageWithData = {
            ...createChatMessage(randomResponse, false, 'delivered')
          };
          
          setMessages(prev => [...prev, botMessage]);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError(formatErrorMessage(error));
      
      const errorMessage = createChatMessage(
        "Sorry, I'm having trouble connecting to the server. Please try again later.",
        false,
        'error'
      );
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setError(null);
    setUserName(null);
    setIsWaitingForName(false);
    chatAPI.resetSession(); // Reset the API session
  };

  const retryLastMessage = () => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.isUser) {
        setInputValue(lastMessage.content);
        textareaRef.current?.focus();
      }
    }
  };

  return (
    <Card className="flex flex-col h-[700px] w-[450px] border border-gray-200 shadow-lg bg-white rounded-lg">
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200 p-3 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
            <h2 className="font-semibold text-gray-800">wuchat</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearChat}
            className="text-gray-600 hover:bg-gray-100 h-8 px-2"
            aria-label="Clear chat"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 p-3 bg-gray-50 overflow-y-auto">
        <div className="space-y-3">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3" style={{backgroundColor: 'var(--wsu-yellow)'}}>
                <span className="text-xl">💬</span>
              </div>
              <h3 className="font-semibold mb-2 text-gray-800">wuchat</h3>
              <p className="text-sm text-gray-600">
                Loading your personalized experience...
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} group`}
              >
                {!message.isUser && (
                  <div className="flex-shrink-0 mr-2 self-end">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{backgroundColor: 'var(--wsu-yellow)'}}>
                      <span className="text-black text-sm font-medium">W</span>
                    </div>
                  </div>
                )}
                
                {message.isUser ? (
                  <div
                    className={`max-w-[350px] px-3 py-2 rounded-lg relative text-black rounded-br-sm ${
                      message.status === 'error' ? 'border border-red-300' : ''
                    }`}
                    style={{backgroundColor: 'var(--wsu-yellow)'}}
                  >
                    <div className="text-sm leading-relaxed prose prose-sm max-w-none">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                          a: ({ ...props }: { href?: string; children?: React.ReactNode }) => (
                            <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline" />
                          ),
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs opacity-70">
                        {formatRelativeTime(message.timestamp)}
                      </p>
                      
                      {/* Message Status & Actions */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {message.status === 'sending' && (
                          <div className="w-2 h-2 bg-current rounded-full animate-pulse" />
                        )}
                        {message.status === 'sent' && (
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                        )}
                        {message.status === 'error' && (
                          <button
                            onClick={retryLastMessage}
                            className="text-xs text-red-600 hover:text-red-800"
                          >
                            Retry
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleCopyMessage(message.id, message.content)}
                          className="p-1 hover:bg-black/10 rounded"
                          title="Copy message"
                        >
                          {copiedMessageId === message.id ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <StructuredMessage
                      content={message.answer?.text || message.content}
                      answer={message.answer}
                      source={message.source}
                      isUser={message.isUser}
                      timestamp={message.timestamp}
                    />
                    
                    {/* Yes/No buttons for welcome message */}
                    {message.id === 'welcome' && isWaitingForName && (
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => handleYesNoClick('yes')}
                          className="px-3 py-1.5 text-xs text-black rounded-full transition-colors font-medium hover:opacity-80"
                          style={{backgroundColor: 'var(--wsu-yellow)'}}
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => handleYesNoClick('no')}
                          className="px-3 py-1.5 text-xs bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors font-medium"
                        >
                          No
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex-shrink-0 mr-2 self-end">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{backgroundColor: 'var(--wsu-yellow)'}}>
                  <span className="text-black text-sm font-medium">W</span>
                </div>
              </div>
              <div className="bg-white border border-gray-200 text-gray-800 px-3 py-2 rounded-lg max-w-[350px]">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                  <span className="text-sm">wuchat is thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="px-4 py-2 bg-red-50 border-l-4 border-red-400 text-red-700 text-sm">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-3 border-t border-border">
        <div className="flex gap-2 items-end">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask about admissions, programs, events... (Press Enter to send, Shift+Enter for new line)"
              className="w-full px-3 py-2 border border-input rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent min-h-[40px] max-h-[120px] text-sm"
              rows={1}
              disabled={isTyping}
            />
            <div className="absolute bottom-1 right-2 text-xs text-muted-foreground">
              {inputValue.length > 0 && `${inputValue.length} characters`}
            </div>
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
            className="text-black h-10 px-4 hover:opacity-80 transition-opacity"
            style={{backgroundColor: 'var(--wsu-yellow)'}}
          >
            {isTyping ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        
        {/* Keyboard Shortcuts Help */}
        <div className="mt-2 text-xs text-muted-foreground text-center">
          Press <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Enter</kbd> to send, 
          <kbd className="px-1 py-0.5 bg-muted rounded text-xs ml-1">Shift+Enter</kbd> for new line
        </div>
      </div>
    </Card>
  );
}