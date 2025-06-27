// Jest setup file for @testing-library/jest-dom
// TypeScript ESM対応版
import '@testing-library/jest-dom';

// Three.js specific global mocks
(global as any).URL = (global as any).URL || {
  createObjectURL: jest.fn(() => 'mock://url'),
  revokeObjectURL: jest.fn(),
};

(global as any).Blob = (global as any).Blob || jest.fn();

// Mock for Image constructor
(global as any).Image = jest.fn(() => ({
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  src: '',
  onload: null,
  onerror: null,
}));

// Enhanced Canvas Mock - Fix appendChild issue
const originalCreateElement = document.createElement.bind(document);
Object.defineProperty(document, 'createElement', {
  value: jest.fn((tagName: string) => {
    if (tagName === 'canvas') {
      // Create a real canvas element and enhance it with mocks
      const canvas = originalCreateElement('canvas');
      
      // Add Jest mock functions while preserving DOM element properties
      Object.assign(canvas, {
        getContext: jest.fn((contextType: string) => {
          if (contextType === '2d') {
            return {
              fillRect: jest.fn(),
              clearRect: jest.fn(),
              getImageData: jest.fn(),
              putImageData: jest.fn(),
              createImageData: jest.fn(),
              setTransform: jest.fn(),
              drawImage: jest.fn(),
              save: jest.fn(),
              restore: jest.fn(),
              beginPath: jest.fn(),
              moveTo: jest.fn(),
              lineTo: jest.fn(),
              closePath: jest.fn(),
              stroke: jest.fn(),
              fill: jest.fn(),
            };
          }
          if (contextType === 'webgl' || contextType === 'webgl2') {
            return {
              clearColor: jest.fn(),
              clear: jest.fn(),
              drawArrays: jest.fn(),
              drawElements: jest.fn(),
              getExtension: jest.fn(() => null),
              getSupportedExtensions: jest.fn(() => []),
            };
          }
          return null;
        }),
        toDataURL: jest.fn(() => 'data:image/png;base64,mock'),
      });
      
      return canvas;
    }
    return originalCreateElement(tagName);
  }),
});

// Additional WebGL constants for Three.js
(global as any).WebGLRenderingContext = (global as any).WebGLRenderingContext || {
  FRAMEBUFFER_COMPLETE: 36053,
  COLOR_BUFFER_BIT: 16384,
  DEPTH_BUFFER_BIT: 256,
  STENCIL_BUFFER_BIT: 1024,
  TEXTURE_2D: 3553,
  NEAREST: 9728,
  LINEAR: 9729,
  CLAMP_TO_EDGE: 33071,
  REPEAT: 10497,
};

(global as any).WebGL2RenderingContext = (global as any).WebGL2RenderingContext || (global as any).WebGLRenderingContext;

// Mock for requestAnimationFrame (commonly used in Three.js animations)
(global as any).requestAnimationFrame = (global as any).requestAnimationFrame || jest.fn(cb => setTimeout(cb, 16));
(global as any).cancelAnimationFrame = (global as any).cancelAnimationFrame || jest.fn(id => clearTimeout(id));

// Mock for performance.now() (used in Three.js for timing)
(global as any).performance = (global as any).performance || {
  now: jest.fn(() => Date.now())
};


