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

interface StableGridProps {
  children: ReactNode;
  className?: string;
}

/**
 * Stable Grid - Prevents layout shifts in grid layouts
 */
export const StableGrid = ({ children, className = '' }: StableGridProps) => {
  return (
    <div className={`stable-grid grid ${className}`}>
      {children}
    </div>
  );
};

interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
  rounded?: boolean;
}

/**
 * Skeleton Loader - Prevents layout shifts during loading
 */
export const Skeleton = ({ 
  className = '', 
  width = 'w-full', 
  height = 'h-4',
  rounded = true 
}: SkeletonProps) => {
  return (
    <div 
      className={`skeleton ${width} ${height} ${rounded ? 'rounded' : ''} ${className}`}
      aria-label="Loading..."
    />
  );
};

/**
 * Skeleton Text - For text content loading
 */
export const SkeletonText = ({ lines = 3 }: { lines?: number }) => {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton 
          key={index}
          width={index === lines - 1 ? 'w-3/4' : 'w-full'}
          className="skeleton-text"
        />
      ))}
    </div>
  );
};

/**
 * Skeleton Card - For card content loading
 */
export const SkeletonCard = () => {
  return (
    <div className="p-6 border rounded-lg space-y-4 prevent-layout-shift">
      <Skeleton className="skeleton-title" />
      <SkeletonText lines={3} />
      <div className="flex space-x-2">
        <Skeleton className="skeleton-button" />
        <Skeleton className="skeleton-button" />
      </div>
    </div>
  );
};

/**
 * Skeleton Table - For table content loading
 */
export const SkeletonTable = ({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) => {
  return (
    <div className="w-full prevent-layout-shift">
      {/* Table Header */}
      <div className="grid gap-4 p-4 border-b" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {Array.from({ length: cols }).map((_, index) => (
          <Skeleton key={`header-${index}`} height="h-6" />
        ))}
      </div>
      
      {/* Table Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div 
          key={`row-${rowIndex}`}
          className="grid gap-4 p-4 border-b" 
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
        >
          {Array.from({ length: cols }).map((_, colIndex) => (
            <Skeleton key={`cell-${rowIndex}-${colIndex}`} />
          ))}
        </div>
      ))}
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

interface StableImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
}

/**
 * Stable Image - Prevents layout shifts from image loading
 */
export const StableImage = ({ 
  src, 
  alt, 
  width, 
  height, 
  className = '',
  priority = false 
}: StableImageProps) => {
  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      style={{ width, height }}
    >
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="absolute inset-0 w-full h-full object-cover"
        priority={priority}
        onLoad={(e) => {
          // Remove skeleton effect when image loads
          e.currentTarget.classList.remove('skeleton');
        }}
        onError={(e) => {
          // Handle image load errors
          e.currentTarget.style.display = 'none';
        }}
      />
      {/* Skeleton placeholder while loading */}
      <div className="skeleton absolute inset-0 w-full h-full" />
    </div>
  );
};

/**
 * Stable Button - Prevents layout shifts from button state changes
 */
interface StableButtonProps {
  children: ReactNode;
  onClick?: () => void;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export const StableButton = ({
  children,
  onClick,
  loading = false,
  disabled = false,
  className = '',
  type = 'button'
}: StableButtonProps) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        relative min-w-[100px] min-h-[40px] px-4 py-2 
        bg-blue-600 text-white rounded-md
        hover:bg-blue-700 disabled:bg-gray-400
        transition-colors duration-200
        prevent-layout-shift
        ${className}
      `}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          Loading...
        </div>
      ) : (
        children
      )}
    </button>
  );
};
