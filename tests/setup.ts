// Jest追加設定ファイル
// Issue #71で要求された setup.js
// TypeScript ESM対応版

// Additional setup for Three.js testing environment
// This file is loaded via setupFilesAfterEnv after jest-canvas-mock

// eslint-disable-next-line no-console
console.log('Jest Test Environment: Three.js testing setup loaded');

// Additional WebGL extensions mock if needed
if (typeof window !== 'undefined' && window.HTMLCanvasElement) {
  const originalGetContext = window.HTMLCanvasElement.prototype.getContext;
  
  window.HTMLCanvasElement.prototype.getContext = function(
    contextType: string, 
    options?: any
  ): any {
    const context = originalGetContext.call(this, contextType, options);
    
    if (context && (contextType === 'webgl' || contextType === 'webgl2')) {
      // Add any additional WebGL extensions or methods if needed for Three.js
      (context as any).getExtension = (context as any).getExtension || jest.fn(() => null);
      (context as any).getSupportedExtensions = (context as any).getSupportedExtensions || jest.fn(() => []);
    }
    
    return context;
  };
}

// Mock for requestAnimationFrame (commonly used in Three.js animations)
(global as any).requestAnimationFrame = (global as any).requestAnimationFrame || jest.fn(cb => global.setTimeout(cb, 16));
(global as any).cancelAnimationFrame = (global as any).cancelAnimationFrame || jest.fn(id => global.clearTimeout(id));

// Mock for performance.now() (used in Three.js for timing)
(global as any).performance = (global as any).performance || {
  now: jest.fn(() => Date.now())
};

export {};

