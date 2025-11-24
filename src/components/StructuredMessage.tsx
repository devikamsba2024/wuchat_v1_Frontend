'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, ExternalLink, AlertCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface StructuredMessageProps {
  content: string;
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
  isUser: boolean;
  timestamp: Date;
}

export default function StructuredMessage({ 
  content, 
  answer, 
  source, 
  isUser, 
  timestamp 
}: StructuredMessageProps) {
  
  const formatDate = (dateIso: string, timezone?: string) => {
    try {
      const date = parseISO(dateIso);
      return format(date, 'MMMM d, yyyy');
    } catch {
      return dateIso;
    }
  };

  const getConfidenceColor = (confidence?: number) => {
    if (!confidence) return 'bg-gray-100';
    if (confidence >= 0.9) return 'bg-green-100 text-green-800';
    if (confidence >= 0.7) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getConfidenceText = (confidence?: number) => {
    if (!confidence) return 'Unknown';
    if (confidence >= 0.9) return 'High';
    if (confidence >= 0.7) return 'Medium';
    return 'Low';
  };

  if (isUser) {
    return (
      <div className="max-w-xs px-4 py-3 rounded-lg bg-[var(--wsu-yellow)] text-[var(--wsu-black)] rounded-br-sm">
        <div className="text-sm leading-relaxed prose prose-sm max-w-none">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={{
              a: ({ ...props }: { href?: string; children?: React.ReactNode }) => (
                <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline" />
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>
    );
  }

  // DIRECT FIX: Always use answer.text if it exists, otherwise use content
  const displayText = answer?.text || content;
  
  // Force use answer.text if content is "No response received"
  const finalText = (content === 'No response received' && answer?.text) ? answer.text : displayText;

  return (
    <div className="max-w-md">
      <Card className="p-4 bg-muted text-foreground rounded-bl-sm">
        {/* Main response text */}
        <div className="text-sm leading-relaxed mb-3 prose prose-sm max-w-none">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={{
              a: ({ ...props }: { href?: string; children?: React.ReactNode }) => (
                <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline" />
              ),
            }}
          >
            {finalText}
          </ReactMarkdown>
        </div>
        
        {/* Structured data display */}
        {answer && (
          <div className="space-y-3">
            {/* Deadline information */}
            {answer.fact_type === 'deadline' && answer.date_iso && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-900">Important Deadline</span>
                </div>
                <div className="text-sm text-blue-800">
                  <p className="font-medium">{answer.text}</p>
                  {answer.date_iso && (
                    <p className="mt-1">
                      <strong>Date:</strong> {formatDate(answer.date_iso, answer.timezone)}
                    </p>
                  )}
                  {answer.level && (
                    <p><strong>Level:</strong> {answer.level}</p>
                  )}
                  {answer.audience && (
                    <p><strong>Audience:</strong> {answer.audience}</p>
                  )}
                </div>
              </div>
            )}
            
            {/* Confidence indicator */}
            {answer.confidence !== undefined && (
              <div className="flex items-center gap-2">
                <Badge 
                  variant="secondary" 
                  className={`text-xs ${getConfidenceColor(answer.confidence)}`}
                >
                  Confidence: {getConfidenceText(answer.confidence)}
                </Badge>
                {answer.confidence < 0.8 && (
                  <div className="flex items-center gap-1 text-amber-600 text-xs">
                    <AlertCircle className="h-3 w-3" />
                    <span>Verify with official sources</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* Source information */}
        {source?.url && (
          <div className="mt-3 pt-3 border-t border-border">
            <div className="flex items-start gap-2">
              <ExternalLink className="h-3 w-3 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="text-xs text-muted-foreground">
                <p className="font-medium">Source:</p>
                <a 
                  href={source.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline break-all"
                >
                  {source.url}
                </a>
                {source.quote && (
                  <p className="mt-1 italic">"{source.quote}"</p>
                )}
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
