import { useEffect, useRef } from 'react';

export const usePerformanceMonitor = (componentName) => {
  const renderCount = useRef(0);
  const renderStartTime = useRef(null);

  useEffect(() => {
    // Track render count
    renderCount.current += 1;
    
    // Track render time
    if (renderStartTime.current) {
      const renderTime = Date.now() - renderStartTime.current;
      if (__DEV__ && renderTime > 16) { // 16ms = 60fps threshold
        console.warn(`[Performance] ${componentName} slow render: ${renderTime}ms`);
      }
    }
    
    renderStartTime.current = Date.now();
    
    if (__DEV__) {
      console.log(`[Performance] ${componentName} render count: ${renderCount.current}`);
    }
  });

  return {
    renderCount: renderCount.current,
  };
};

export default usePerformanceMonitor;
