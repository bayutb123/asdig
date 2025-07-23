'use client'

import { lazy, Suspense } from 'react'
import { LoadingPlaceholder } from './LayoutStable'

// Lazy load heavy components for better performance
export const LazyAttendanceTable = lazy(() => import('./AttendanceTable'))

// Loading wrapper component
interface LazyWrapperProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function LazyWrapper({ children, fallback }: LazyWrapperProps) {
  const defaultFallback = (
    <div className="min-h-[200px] flex items-center justify-center">
      <LoadingPlaceholder />
    </div>
  )

  return (
    <Suspense fallback={fallback || defaultFallback}>
      {children}
    </Suspense>
  )
}

// Higher-order component for lazy loading
export function withLazyLoading<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ReactNode
) {
  return function LazyComponent(props: P) {
    return (
      <LazyWrapper fallback={fallback}>
        <Component {...props} />
      </LazyWrapper>
    )
  }
}

// Preload function for critical components
export function preloadComponents() {
  // Preload components that are likely to be needed soon
  import('./AttendanceTable')
}

// Component for lazy loading with intersection observer
export function LazyOnVisible({ 
  children, 
  fallback,
  rootMargin = '50px' 
}: LazyWrapperProps & { rootMargin?: string }) {
  return (
    <LazyWrapper fallback={fallback}>
      {children}
    </LazyWrapper>
  )
}
