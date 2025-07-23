/**
 * Layout Stability Components
 * Prevents Cumulative Layout Shift (CLS) by providing stable containers and loading states
 */

import { ReactNode } from 'react';
import Image from 'next/image';

interface StableContainerProps {
  children: ReactNode;
  className?: string;
  minHeight?: string;
}

/**
 * Stable Container - Prevents layout shifts with consistent dimensions
 */
export const StableContainer = ({ 
  children, 
  className = '', 
  minHeight = '100vh' 
}: StableContainerProps) => {
  return (
    <div 
      className={`stable-container prevent-layout-shift ${className}`}
      style={{ minHeight }}
    >
      {children}
    </div>
  );
};



interface LoadingPlaceholderProps {
  message?: string;
  height?: string;
  className?: string;
}

/**
 * Loading Placeholder - Stable loading state
 */
export const LoadingPlaceholder = ({ 
  message = 'Loading...', 
  height = '200px',
  className = ''
}: LoadingPlaceholderProps) => {
  return (
    <div 
      className={`loading-placeholder ${className}`}
      style={{ minHeight: height }}
    >
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
};


