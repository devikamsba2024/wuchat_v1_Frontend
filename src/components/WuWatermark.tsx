'use client';

import { motion } from 'framer-motion';

interface WuWatermarkProps {
  className?: string;
}

export default function WuWatermark({ className = '' }: WuWatermarkProps) {
  return (
    <div
      className={`fixed inset-0 -z-10 pointer-events-none flex items-center justify-center ${className}`}
      aria-hidden="true"
      style={{ zIndex: -1 }}
    >
      {/* WU Mascot Image Watermark */}
      <div className="relative">
        <img
          src="/wu.png"
          alt="WU Mascot Watermark"
          className="w-32 h-32 md:w-48 md:h-48 lg:w-64 lg:h-64 opacity-60 object-contain"
          style={{ 
            filter: 'drop-shadow(0 0 20px rgba(0,0,0,0.1))',
          }}
        />
        
        {/* WU Text Watermark Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            width="80%"
            height="80%"
            viewBox="0 0 200 200"
            className="text-foreground/10"
            style={{ 
              filter: 'drop-shadow(0 0 20px rgba(0,0,0,0.1))',
            }}
          >
            <defs>
              <linearGradient id="watermarkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0.15" />
                <stop offset="50%" stopColor="currentColor" stopOpacity="0.10" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="0.05" />
              </linearGradient>
            </defs>
            
            {/* W Letter */}
            <path
              d="M20 40 L20 160 L40 160 L40 100 L60 140 L80 140 L100 100 L100 160 L120 160 L120 40 L100 40 L80 80 L60 80 L40 40 Z"
              fill="none"
              stroke="url(#watermarkGradient)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            
            {/* U Letter */}
            <path
              d="M140 40 L140 140 Q140 160 160 160 L180 160 Q200 160 200 140 L200 40 L180 40 L180 140 Q180 150 170 150 L150 150 Q140 150 140 140 Z"
              fill="none"
              stroke="url(#watermarkGradient)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

