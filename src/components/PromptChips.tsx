'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PromptChipsProps {
  prompts: string[];
  onPromptClick: (prompt: string) => void;
  className?: string;
}

const defaultPrompts = [
  'Application deadlines',
  'Scholarships',
  'Campus map',
  'Contact OneStop',
  'Academic programs',
  'Housing information'
];

export default function PromptChips({ 
  prompts = defaultPrompts, 
  onPromptClick, 
  className 
}: PromptChipsProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {prompts.map((prompt, index) => (
        <motion.div
          key={prompt}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            duration: 0.2, 
            delay: index * 0.05 
          }}
        >
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-8 px-3 hover:bg-[var(--wsu-yellow)] hover:text-[var(--wsu-black)] hover:border-[var(--wsu-yellow)] transition-colors"
            onClick={() => onPromptClick(prompt)}
          >
            {prompt}
          </Button>
        </motion.div>
      ))}
    </div>
  );
}

