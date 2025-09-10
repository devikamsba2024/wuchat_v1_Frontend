'use client';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Send, RotateCcw, ThumbsUp, ThumbsDown, Copy, Check } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  status?: 'sending' | 'sent' | 'delivered' | 'error';
}

interface QuickReply {
  id: string;
  text: string;
  action: string;
}

export default function SimpleChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [isWaitingForName, setIsWaitingForName] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Quick reply suggestions
  const quickReplies: QuickReply[] = [
    { id: '1', text: 'Tell me about admissions', action: 'admissions' },
    { id: '2', text: 'What programs do you offer?', action: 'programs' },
    { id: '3', text: 'Campus events and activities', action: 'events' },
    { id: '4', text: 'How to contact OneStop?', action: 'contact' },
    { id: '5', text: 'Financial aid information', action: 'financial-aid' },
  ];

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

  // Handle quick reply
  const handleQuickReply = (reply: QuickReply) => {
    setInputValue(reply.text);
    textareaRef.current?.focus();
  };

  const handleYesNoClick = (response: 'yes' | 'no') => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content: response === 'yes' ? 'Yes' : 'No',
      isUser: true,
      timestamp: new Date(),
      status: 'sending'
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
        setIsWaitingForName(false);
      } else {
        botResponse = "No problem! I'll just call you 'friend' then. How can I help you today? 😊";
        setUserName('friend');
        setIsWaitingForName(false);
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: botResponse,
        isUser: false,
        timestamp: new Date(),
        status: 'delivered'
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  // Initialize welcome message
              useEffect(() => {
                if (messages.length === 0 && !isWaitingForName) {
                  const welcomeMessage: Message = {
                    id: 'welcome',
                    content: "Hey there! 👋 I'm Wu Assistant, a chatbot to help answer any questions about you with information about Wichita State University. Ask me about admissions, programs, events, or anything else! 🌾 Before we get started, can you share your name, that way I know who I'm chatting with?",
                    isUser: false,
                    timestamp: new Date(),
                    status: 'delivered'
                  };
                  setMessages([welcomeMessage]);
                  setIsWaitingForName(true);
                }
              }, [messages.length, isWaitingForName]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      isUser: true,
      timestamp: new Date(),
      status: 'sending'
    };

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
          setIsWaitingForName(false);
        } else if (currentInput.toLowerCase().includes('no') || currentInput.toLowerCase().includes('not') || currentInput.toLowerCase().includes('skip')) {
          botResponse = "No problem! I'll just call you 'friend' then. How can I help you today? 😊";
          setUserName('friend');
          setIsWaitingForName(false);
        } else {
          // User provided their name directly
          setUserName(currentInput);
          botResponse = `Nice to meet you, ${currentInput}! 😊 How can I help you today?`;
          setIsWaitingForName(false);
        }
        
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: botResponse,
          isUser: false,
          timestamp: new Date(),
          status: 'delivered'
        };
        
        setMessages(prev => [...prev, botMessage]);
      } else {
        // Regular conversation
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const responses = [
          "Thank you for your question! I'm here to help with information about Wichita State University.",
          "That's a great question! For more details, please visit our official website at wichita.edu.",
          "I'd be happy to help! You can also contact OneStop at (316) 978-7676 for assistance.",
          "Thanks for reaching out! Check out our website for the most up-to-date information.",
          "Great question! Feel free to explore our campus or contact our admissions office for more details."
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: randomResponse,
          isUser: false,
          timestamp: new Date(),
          status: 'delivered'
        };
        
        setMessages(prev => [...prev, botMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, I'm having trouble connecting to the server. Please try again later.",
        isUser: false,
        timestamp: new Date(),
        status: 'error'
      };
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
    <Card className="flex flex-col h-[90vh] max-h-[1000px] border border-[var(--wsu-black)]/12 shadow-sm bg-background/95 backdrop-blur-sm">
      {/* Header */}
      <div className="bg-[var(--wsu-black)] text-white p-4 rounded-t-lg border-t-4 border-t-[var(--wsu-yellow)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
            <h2 className="font-heading font-semibold">WU Assistant</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearChat}
            className="text-white hover:bg-white/10 h-8 px-2"
            aria-label="Clear chat"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 p-4 bg-gradient-to-b from-background/90 to-muted/10 overflow-y-auto relative">
        {/* WU Watermark inside chat */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <img
            src="/wu.png"
            alt="WU Mascot Watermark"
            className="w-40 h-40 md:w-56 md:h-56 lg:w-72 lg:h-72 opacity-25 object-contain"
            style={{ 
              filter: 'drop-shadow(0 0 15px rgba(0,0,0,0.1))',
            }}
          />
        </div>
        
        <div className="space-y-4 relative z-10">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="w-16 h-16 bg-[var(--wsu-yellow)] rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">🌾</span>
              </div>
              <h3 className="font-heading font-semibold mb-2">WU Assistant</h3>
              <p className="text-sm text-muted-foreground">
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
                    <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-[var(--wsu-yellow)]">
                      <img
                        src="/wu.png"
                        alt="WU Assistant"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
                
                <div
                  className={`max-w-xs px-4 py-3 rounded-lg relative ${
                    message.isUser
                      ? 'bg-[var(--wsu-yellow)] text-[var(--wsu-black)] rounded-br-sm'
                      : 'bg-muted text-foreground rounded-bl-sm'
                  } ${message.status === 'error' ? 'border border-red-300' : ''}`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  
                  {/* Yes/No buttons for welcome message */}
                  {message.id === 'welcome' && isWaitingForName && (
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleYesNoClick('yes')}
                        className="px-3 py-1.5 text-xs bg-[var(--wsu-yellow)] text-[var(--wsu-black)] rounded-full hover:bg-[var(--wsu-yellow)]/80 transition-colors font-medium"
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
              </div>
            ))
          )}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex-shrink-0 mr-2 self-end">
                <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-[var(--wsu-yellow)]">
                  <img
                    src="/wu.png"
                    alt="WU Assistant"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="bg-muted text-foreground px-4 py-2 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                  <span className="text-sm">WU Assistant is thinking...</span>
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
      <div className="p-4 border-t border-border">
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
            className="bg-[var(--wsu-yellow)] text-[var(--wsu-black)] hover:bg-[var(--wsu-yellow)]/90 h-10 px-4"
          >
            {isTyping ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        {/* Quick Reply Suggestions */}
        <div className="mt-3">
          <div className="flex flex-wrap gap-2 justify-center">
            {quickReplies.map((reply) => (
              <button
                key={reply.id}
                onClick={() => handleQuickReply(reply)}
                className="px-3 py-1.5 text-xs bg-[var(--wsu-yellow)] text-[var(--wsu-black)] rounded-full hover:bg-[var(--wsu-yellow)]/80 transition-colors"
              >
                {reply.text}
              </button>
            ))}
          </div>
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