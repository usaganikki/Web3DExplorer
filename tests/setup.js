// Jest追加設定ファイル
// Issue #71で要求された setup.js

// Additional setup for Three.js testing environment
// This file is loaded via setupFilesAfterEnv after jest-canvas-mock

console.log('Jest Test Environment: Three.js testing setup loaded');

// Additional WebGL extensions mock if needed
if (typeof window !== 'undefined' && window.HTMLCanvasElement) {
  const originalGetContext = window.HTMLCanvasElement.prototype.getContext;
  
  window.HTMLCanvasElement.prototype.getContext = function(contextType, options) {
    const context = originalGetContext.call(this, contextType, options);
    
    if (context && (contextType === 'webgl' || contextType === 'webgl2')) {
      // Add any additional WebGL extensions or methods if needed for Three.js
      context.getExtension = context.getExtension || jest.fn(() => null);
      context.getSupportedExtensions = context.getSupportedExtensions || jest.fn(() => []);
    }
    
    return context;
  };
}

// Mock for requestAnimationFrame (commonly used in Three.js animations)
global.requestAnimationFrame = global.requestAnimationFrame || jest.fn(cb => setTimeout(cb, 16));
global.cancelAnimationFrame = global.cancelAnimationFrame || jest.fn(id => clearTimeout(id));

// Mock for performance.now() (used in Three.js for timing)
global.performance = global.performance || {
  now: jest.fn(() => Date.now())
};
