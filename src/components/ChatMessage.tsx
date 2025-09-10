'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  content: string;
  isUser: boolean;
  timestamp: Date;
  onCopy?: (content: string) => void;
}

export default function ChatMessage({ 
  content, 
  isUser, 
  timestamp, 
  onCopy
}: ChatMessageProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      onCopy?.(content);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'flex w-full mb-4',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      <div className={cn(
        'flex flex-col max-w-[80%]',
        isUser ? 'items-end' : 'items-start'
      )}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs text-muted-foreground">
            {isUser ? 'You' : 'WSU Assistant'}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatTime(timestamp)}
          </span>
        </div>
        
        <Card className={cn(
          'p-4 relative group',
          isUser 
            ? 'bg-[var(--wsu-yellow)] text-[var(--wsu-black)] border-[var(--wsu-yellow)]' 
            : 'bg-card border-border'
        )}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {content}
          </p>
          
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity',
              isUser 
                ? 'text-[var(--wsu-black)] hover:bg-[var(--wsu-black)]/10' 
                : 'text-muted-foreground hover:text-foreground'
            )}
            onClick={handleCopy}
            aria-label="Copy message"
          >
            {copied ? (
              <Check className="h-3 w-3" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
        </Card>
      </div>
    </motion.div>
  );
}
