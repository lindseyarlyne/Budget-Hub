import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

export const useVirtualizer = ({ 
  items, 
  itemHeight, 
  containerHeight, 
  overscan = 5 
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef(null);
  const itemRefs = useRef([]);

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const end = Math.min(start + visibleCount + overscan, items.length);
    
    return {
      start: Math.max(0, start - overscan),
      end
    };
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length]);

  // Get visible items with their positions
  const visibleItems = useMemo(() => {
    const result = [];
    for (let i = visibleRange.start; i < visibleRange.end; i++) {
      if (items[i]) {
        result.push({
          index: i,
          item: items[i],
          top: i * itemHeight
        });
      }
    }
    return result;
  }, [items, visibleRange, itemHeight]);

  // Handle scroll events with throttling
  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop);
    }
  }, []);

  // Throttled scroll handler for better performance
  const throttledHandleScroll = useCallback(() => {
    let ticking = false;
    
    return () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };
  }, [handleScroll]);

  // Scroll to specific index
  const scrollToIndex = useCallback((index) => {
    if (containerRef.current && index >= 0 && index < items.length) {
      const scrollTop = index * itemHeight;
      containerRef.current.scrollTop = scrollTop;
      setScrollTop(scrollTop);
    }
  }, [items.length, itemHeight]);

  // Set up scroll listener
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scrollHandler = throttledHandleScroll();
    container.addEventListener('scroll', scrollHandler, { passive: true });

    return () => {
      container.removeEventListener('scroll', scrollHandler);
    };
  }, [throttledHandleScroll]);

  // Calculate total height for scrollbar
  const totalHeight = items.length * itemHeight;

  // Style for the container
  const containerStyle = useMemo(() => ({
    height: containerHeight,
    overflow: 'auto',
    position: 'relative'
  }), [containerHeight]);

  // Style for the inner container that creates the scrollable area
  const innerStyle = useMemo(() => ({
    height: totalHeight,
    position: 'relative'
  }), [totalHeight]);

  return {
    containerRef,
    itemRefs,
    visibleItems,
    scrollToIndex,
    containerStyle,
    innerStyle,
    totalHeight
  };
};