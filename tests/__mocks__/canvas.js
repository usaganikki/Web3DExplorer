// Canvas専用モックファイル
// Issue #71で要求された canvas.js

// Extended Canvas mock for specific Three.js requirements
// This complements jest-canvas-mock with additional functionality

// Mock Canvas with specific dimensions and methods for Three.js
export const createMockCanvas = (width = 800, height = 600) => {
  const canvas = {
    width,
    height,
    clientWidth: width,
    clientHeight: height,
    offsetWidth: width,
    offsetHeight: height,
    style: {
      width: `${width}px`,
      height: `${height}px`,
    },
    
    // Event handling
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
    
    // Canvas-specific methods
    getContext: jest.fn((contextType) => {
      if (contextType === '2d') {
        return {
          canvas,
          fillStyle: '#000000',
          strokeStyle: '#000000',
          lineWidth: 1,
          font: '10px sans-serif',
          textAlign: 'start',
          textBaseline: 'alphabetic',
          
          // Drawing methods
          fillRect: jest.fn(),
          strokeRect: jest.fn(),
          clearRect: jest.fn(),
          beginPath: jest.fn(),
          closePath: jest.fn(),
          moveTo: jest.fn(),
          lineTo: jest.fn(),
          arc: jest.fn(),
          fill: jest.fn(),
          stroke: jest.fn(),
          
          // Text methods
          fillText: jest.fn(),
          strokeText: jest.fn(),
          measureText: jest.fn(() => ({ width: 100 })),
          
          // Transform methods
          translate: jest.fn(),
          rotate: jest.fn(),
          scale: jest.fn(),
          transform: jest.fn(),
          setTransform: jest.fn(),
          resetTransform: jest.fn(),
          
          // State methods
          save: jest.fn(),
          restore: jest.fn(),
          
          // Image methods
          drawImage: jest.fn(),
          getImageData: jest.fn(() => ({
            width,
            height,
            data: new Uint8ClampedArray(width * height * 4)
          })),
          putImageData: jest.fn(),
          createImageData: jest.fn(() => ({
            width,
            height,
            data: new Uint8ClampedArray(width * height * 4)
          })),
        };
      }
      
      if (contextType === 'webgl' || contextType === 'webgl2') {
        // Basic WebGL context mock (jest-canvas-mock provides more complete version)
        return {
          canvas,
          drawingBufferWidth: width,
          drawingBufferHeight: height,
          viewport: jest.fn(),
          clear: jest.fn(),
          clearColor: jest.fn(),
          getParameter: jest.fn(() => 'WebGL Mock'),
          getExtension: jest.fn(() => null),
        };
      }
      
      return null;
    }),
    
    // Canvas data methods
    toDataURL: jest.fn(() => 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='),
    toBlob: jest.fn((callback) => {
      const blob = new Blob(['mock'], { type: 'image/png' });
      callback(blob);
    }),
    
    // Size methods
    getBoundingClientRect: jest.fn(() => ({
      left: 0,
      top: 0,
      right: width,
      bottom: height,
      width,
      height,
      x: 0,
      y: 0,
    })),
  };
  
  Object.setPrototypeOf(canvas, HTMLCanvasElement.prototype);
  return canvas;
};

// Mock canvas for testing specific scenarios
export const mockCanvasScenarios = {
  // High DPI scenario
  highDPI: () => createMockCanvas(1600, 1200),
  
  // Mobile scenario
  mobile: () => createMockCanvas(375, 667),
  
  // WebGL failure scenario
  webglFailure: () => {
    const canvas = createMockCanvas();
    canvas.getContext = jest.fn((contextType) => {
      if (contextType === 'webgl' || contextType === 'webgl2') {
        return null; // Simulate WebGL not available
      }
      return canvas.getContext(contextType);
    });
    return canvas;
  },
};

export default createMockCanvas;
