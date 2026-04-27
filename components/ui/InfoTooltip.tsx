import React, { useState, useRef, useEffect } from 'react';

interface InfoTooltipProps {
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
  forcePlacement?: 'top' | 'bottom';
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({ 
  title, 
  description, 
  children, 
  className = '',
  forcePlacement
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [placement, setPlacement] = useState<'top' | 'bottom'>('top');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      if (forcePlacement) {
        setPlacement(forcePlacement);
        setIsVisible(true);
        return;
      }

      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        
        // Check if there is enough space above (approx 150px)
        if (rect.top < 150) {
          setPlacement('bottom');
        } else {
          setPlacement('top');
        }
        
        setIsVisible(true);
      }
    }, 400);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative h-full ${className}`}
    >
      {children}
      {isVisible && (
        <div 
          className={`absolute z-[100] w-[260px] p-4 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl shadow-2xl pointer-events-none animate-fadeIn left-1/2 -translate-x-1/2 transition-all duration-300 ${
            placement === 'top' 
              ? 'bottom-full mb-3' 
              : 'top-full mt-3'
          }`}
        >
          <div className="relative z-10">
            <h4 className="text-xs font-bold uppercase tracking-widest mb-1 text-slate-300">
              {title}
            </h4>
            <p className="text-[12px] leading-relaxed text-slate-400 font-medium">
              {description}
            </p>
          </div>
          
          {/* Arrow */}
          <div 
            className={`absolute left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900 dark:bg-slate-800 rotate-45 z-0 ${
              placement === 'top' ? '-bottom-1.5' : '-top-1.5'
            }`}
          />
        </div>
      )}
    </div>
  );
};
