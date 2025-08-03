// Performance monitoring and optimization utilities

import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.observers = new Map();
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    
    this.setupWebVitals();
    this.setupPerformanceObserver();
    this.setupMemoryMonitoring();
    this.setupUserTimingAPI();
    
    this.initialized = true;
  }

  setupWebVitals() {
    const onPerfEntry = (metric) => {
      this.metrics.set(metric.name, metric);
      this.logMetric(metric);
      
      // Send to analytics in production
      if (process.env.NODE_ENV === 'production') {
        this.sendToAnalytics(metric);
      }
    };

    getCLS(onPerfEntry);
    getFID(onPerfEntry);
    getFCP(onPerfEntry);
    getLCP(onPerfEntry);
    getTTFB(onPerfEntry);
  }

  setupPerformanceObserver() {
    if ('PerformanceObserver' in window) {
      // Long task monitoring
      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (entry.duration > 50) {
              console.warn('Long task detected:', {
                duration: entry.duration,
                startTime: entry.startTime,
                name: entry.name
              });
            }
          });
        });
        longTaskObserver.observe({ entryTypes: ['longtask'] });
        this.observers.set('longtask', longTaskObserver);
      } catch (e) {
        console.warn('Long task observer not supported');
      }

      // Layout shift monitoring
      try {
        const layoutShiftObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (entry.value > 0.1) {
              console.warn('Layout shift detected:', {
                value: entry.value,
                startTime: entry.startTime,
                sources: entry.sources
              });
            }
          });
        });
        layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.set('layout-shift', layoutShiftObserver);
      } catch (e) {
        console.warn('Layout shift observer not supported');
      }

      // Resource timing
      try {
        const resourceObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            const loadTime = entry.responseEnd - entry.requestStart;
            if (loadTime > 1000) {
              console.warn('Slow resource detected:', {
                name: entry.name,
                loadTime,
                size: entry.transferSize
              });
            }
          });
        });
        resourceObserver.observe({ entryTypes: ['resource'] });
        this.observers.set('resource', resourceObserver);
      } catch (e) {
        console.warn('Resource observer not supported');
      }
    }
  }

  setupMemoryMonitoring() {
    if ('memory' in performance) {
      setInterval(() => {
        const memory = performance.memory;
        const usedJSHeapSize = Math.round(memory.usedJSHeapSize / 1048576);
        const totalJSHeapSize = Math.round(memory.totalJSHeapSize / 1048576);
        
        if (usedJSHeapSize > 50) { // Alert if over 50MB
          console.warn('High memory usage:', {
            used: `${usedJSHeapSize}MB`,
            total: `${totalJSHeapSize}MB`,
            percentage: Math.round((usedJSHeapSize / totalJSHeapSize) * 100)
          });
        }
      }, 30000); // Check every 30 seconds
    }
  }

  setupUserTimingAPI() {
    // Custom performance marks and measures
    this.mark = (name) => {
      performance.mark(name);
    };

    this.measure = (name, startMark, endMark) => {
      try {
        performance.measure(name, startMark, endMark);
        const measure = performance.getEntriesByName(name, 'measure')[0];
        console.log(`Performance measure: ${name} took ${measure.duration.toFixed(2)}ms`);
        return measure;
      } catch (e) {
        console.warn('Failed to measure performance:', e);
      }
    };
  }

  // Component performance tracking
  trackComponentRender(componentName, renderTime) {
    const metric = {
      name: 'component-render',
      component: componentName,
      duration: renderTime,
      timestamp: Date.now()
    };
    
    this.metrics.set(`component-${componentName}`, metric);
    
    if (renderTime > 16) { // Longer than one frame
      console.warn(`Slow component render: ${componentName} took ${renderTime.toFixed(2)}ms`);
    }
  }

  // API request performance tracking
  trackAPIRequest(url, method, duration, status) {
    const metric = {
      name: 'api-request',
      url,
      method,
      duration,
      status,
      timestamp: Date.now()
    };
    
    this.metrics.set(`api-${url}`, metric);
    
    if (duration > 2000) { // Longer than 2 seconds
      console.warn(`Slow API request: ${method} ${url} took ${duration}ms`);
    }
  }

  // Bundle size tracking
  async trackBundleSize() {
    if ('navigator' in window && 'connection' in navigator) {
      const connection = navigator.connection;
      console.log('Connection info:', {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt
      });
    }

    // Track script load times
    const scripts = document.querySelectorAll('script[src]');
    scripts.forEach((script) => {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.name === script.src) {
            console.log(`Script load time: ${script.src} - ${entry.duration.toFixed(2)}ms`);
          }
        });
      });
      observer.observe({ entryTypes: ['resource'] });
    });
  }

  logMetric(metric) {
    console.log(`Web Vital - ${metric.name}:`, metric.value);
    
    // Log warnings for poor performance
    switch (metric.name) {
      case 'LCP':
        if (metric.value > 2500) {
          console.warn('Poor LCP detected. Consider optimizing largest contentful paint.');
        }
        break;
      case 'FID':
        if (metric.value > 100) {
          console.warn('Poor FID detected. Consider optimizing JavaScript execution.');
        }
        break;
      case 'CLS':
        if (metric.value > 0.1) {
          console.warn('Poor CLS detected. Consider fixing layout shifts.');
        }
        break;
      case 'FCP':
        if (metric.value > 1800) {
          console.warn('Poor FCP detected. Consider optimizing critical resources.');
        }
        break;
      case 'TTFB':
        if (metric.value > 800) {
          console.warn('Poor TTFB detected. Consider optimizing server response time.');
        }
        break;
    }
  }

  sendToAnalytics(metric) {
    // In a real application, you would send this to your analytics service
    // Example: Google Analytics, Adobe Analytics, custom endpoint, etc.
    
    if (typeof gtag !== 'undefined') {
      gtag('event', metric.name, {
        event_category: 'Web Vitals',
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        non_interaction: true
      });
    }
    
    // Or send to custom endpoint
    // fetch('/api/analytics/web-vitals', {
    //   method: 'POST',
    //   body: JSON.stringify(metric),
    //   headers: { 'Content-Type': 'application/json' }
    // });
  }

  // Get performance report
  getPerformanceReport() {
    const report = {
      webVitals: {},
      customMetrics: {},
      browserInfo: {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine
      },
      memoryInfo: performance.memory ? {
        usedJSHeapSize: Math.round(performance.memory.usedJSHeapSize / 1048576),
        totalJSHeapSize: Math.round(performance.memory.totalJSHeapSize / 1048576),
        jsHeapSizeLimit: Math.round(performance.memory.jsHeapSizeLimit / 1048576)
      } : null,
      timestamp: Date.now()
    };

    // Collect Web Vitals
    ['CLS', 'FID', 'FCP', 'LCP', 'TTFB'].forEach(name => {
      if (this.metrics.has(name)) {
        report.webVitals[name] = this.metrics.get(name);
      }
    });

    // Collect custom metrics
    this.metrics.forEach((value, key) => {
      if (!['CLS', 'FID', 'FCP', 'LCP', 'TTFB'].includes(key)) {
        report.customMetrics[key] = value;
      }
    });

    return report;
  }

  // Cleanup
  destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
    this.metrics.clear();
    this.initialized = false;
  }
}

// Performance optimization utilities
export const performanceUtils = {
  // Debounce function for performance optimization
  debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        timeout = null;
        if (!immediate) func.apply(this, args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(this, args);
    };
  },

  // Throttle function for performance optimization
  throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // Lazy load images
  lazyLoadImages() {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            observer.unobserve(img);
          }
        });
      });

      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });
    }
  },

  // Preload critical resources
  preloadResource(href, as, type = null) {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    if (type) link.type = type;
    document.head.appendChild(link);
  },

  // Check if device has reduced motion preference
  prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
};

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// React hook for component performance tracking  
import React from 'react';

export const usePerformanceTracking = (componentName) => {
  const [renderStart, setRenderStart] = React.useState(null);

  React.useEffect(() => {
    setRenderStart(performance.now());
  }, []);

  React.useEffect(() => {
    if (renderStart) {
      const renderTime = performance.now() - renderStart;
      performanceMonitor.trackComponentRender(componentName, renderTime);
    }
  });
};

export default performanceMonitor;