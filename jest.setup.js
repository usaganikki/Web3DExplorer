// Jest setup file for @testing-library/jest-dom
import '@testing-library/jest-dom';

// jest-canvas-mock は setupFilesAfterEnv で自動的に読み込まれるため、
// ここでは追加の設定のみを行う

// Three.js specific mocks and utilities
global.URL = global.URL || {
  createObjectURL: jest.fn(() => 'mock://url'),
  revokeObjectURL: jest.fn(),
};

global.Blob = global.Blob || jest.fn();

// Mock for Image constructor
global.Image = jest.fn(() => ({
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  src: '',
  onload: null,
  onerror: null,
}));

// Mock for document methods if needed
Object.defineProperty(document, 'createElement', {
  value: jest.fn((tagName) => {
    if (tagName === 'canvas') {
      const canvas = {
        tagName: 'CANVAS',
        width: 800,
        height: 600,
        style: {},
        getContext: jest.fn(),
        toDataURL: jest.fn(() => 'data:image/png;base64,mock'),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      };
      Object.setPrototypeOf(canvas, HTMLCanvasElement.prototype);
      return canvas;
    }
    return {
      tagName: tagName.toUpperCase(),
      style: {},
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    };
  }),
});

// Additional WebGL constants for Three.js
global.WebGLRenderingContext = global.WebGLRenderingContext || {
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

global.WebGL2RenderingContext = global.WebGL2RenderingContext || global.WebGLRenderingContext;

