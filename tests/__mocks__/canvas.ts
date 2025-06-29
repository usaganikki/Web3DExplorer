// Canvas専用モックファイル
// Issue #71で要求された canvas.ts (TypeScript変換版)

// Extended Canvas mock for specific Three.js requirements
// This complements jest-canvas-mock with additional functionality

interface MockCanvasRenderingContext2D {
  canvas: MockCanvas;
  fillStyle: string;
  strokeStyle: string;
  lineWidth: number;
  font: string;
  textAlign: CanvasTextAlign;
  textBaseline: CanvasTextBaseline;
  
  // Drawing methods
  fillRect: jest.MockedFunction<(x: number, y: number, width: number, height: number) => void>;
  strokeRect: jest.MockedFunction<(x: number, y: number, width: number, height: number) => void>;
  clearRect: jest.MockedFunction<(x: number, y: number, width: number, height: number) => void>;
  beginPath: jest.MockedFunction<() => void>;
  closePath: jest.MockedFunction<() => void>;
  moveTo: jest.MockedFunction<(x: number, y: number) => void>;
  lineTo: jest.MockedFunction<(x: number, y: number) => void>;
  arc: jest.MockedFunction<(x: number, y: number, radius: number, startAngle: number, endAngle: number, counterclockwise?: boolean) => void>;
  fill: jest.MockedFunction<() => void>;
  stroke: jest.MockedFunction<() => void>;
  
  // Text methods
  fillText: jest.MockedFunction<(text: string, x: number, y: number, maxWidth?: number) => void>;
  strokeText: jest.MockedFunction<(text: string, x: number, y: number, maxWidth?: number) => void>;
  measureText: jest.MockedFunction<(text: string) => TextMetrics>;
  
  // Transform methods
  translate: jest.MockedFunction<(x: number, y: number) => void>;
  rotate: jest.MockedFunction<(angle: number) => void>;
  scale: jest.MockedFunction<(x: number, y: number) => void>;
  transform: jest.MockedFunction<(a: number, b: number, c: number, d: number, e: number, f: number) => void>;
  setTransform: jest.MockedFunction<(a: number, b: number, c: number, d: number, e: number, f: number) => void>;
  resetTransform: jest.MockedFunction<() => void>;
  
  // State methods
  save: jest.MockedFunction<() => void>;
  restore: jest.MockedFunction<() => void>;
  
  // Image methods
  drawImage: jest.MockedFunction<(...args: any[]) => void>;
  getImageData: jest.MockedFunction<(sx: number, sy: number, sw: number, sh: number) => ImageData>;
  putImageData: jest.MockedFunction<(imagedata: ImageData, dx: number, dy: number) => void>;
  createImageData: jest.MockedFunction<(sw: number, sh: number) => ImageData>;
}

interface MockWebGLRenderingContext {
  canvas: MockCanvas;
  drawingBufferWidth: number;
  drawingBufferHeight: number;
  viewport: jest.MockedFunction<(x: number, y: number, width: number, height: number) => void>;
  clear: jest.MockedFunction<(mask: number) => void>;
  clearColor: jest.MockedFunction<(red: number, green: number, blue: number, alpha: number) => void>;
  getParameter: jest.MockedFunction<(pname: number) => any>;
  getExtension: jest.MockedFunction<(name: string) => any>;
}

interface MockCanvas {
  width: number;
  height: number;
  clientWidth: number;
  clientHeight: number;
  offsetWidth: number;
  offsetHeight: number;
  style: {
    width: string;
    height: string;
  };
  
  // Event handling
  addEventListener: jest.MockedFunction<(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) => void>;
  removeEventListener: jest.MockedFunction<(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions) => void>;
  dispatchEvent: jest.MockedFunction<(event: Event) => boolean>;
  
  // Canvas-specific methods
  getContext: jest.MockedFunction<(contextId: string, options?: any) => MockCanvasRenderingContext2D | MockWebGLRenderingContext | null>;
  
  // Canvas data methods
  toDataURL: jest.MockedFunction<(type?: string, quality?: any) => string>;
  toBlob: jest.MockedFunction<(callback: BlobCallback, type?: string, quality?: any) => void>;
  
  // Size methods
  getBoundingClientRect: jest.MockedFunction<() => DOMRect>;
}

// Mock Canvas with specific dimensions and methods for Three.js
export const createMockCanvas = (width = 800, height = 600): MockCanvas => {
  const canvas: MockCanvas = {
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
    getContext: jest.fn((contextType: string): MockCanvasRenderingContext2D | MockWebGLRenderingContext | null => {
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
          measureText: jest.fn((text: string) => ({ width: 100 } as TextMetrics)),
          
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
          getImageData: jest.fn((sx: number, sy: number, sw: number, sh: number) => ({
            width: sw,
            height: sh,
            data: new Uint8ClampedArray(sw * sh * 4)
          } as ImageData)),
          putImageData: jest.fn(),
          createImageData: jest.fn((sw: number, sh: number) => ({
            width: sw,
            height: sh,
            data: new Uint8ClampedArray(sw * sh * 4)
          } as ImageData)),
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
          getParameter: jest.fn((pname: number) => 'WebGL Mock'),
          getExtension: jest.fn((name: string) => null),
        };
      }
      
      return null;
    }),
    
    // Canvas data methods
    toDataURL: jest.fn(() => 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='),
    toBlob: jest.fn((callback: BlobCallback) => {
      const blob = new Blob(['mock'], { type: 'image/png' });
      callback(blob);
    }),
    
    // Size methods
    getBoundingClientRect: jest.fn((): DOMRect => ({
      left: 0,
      top: 0,
      right: width,
      bottom: height,
      width,
      height,
      x: 0,
      y: 0,
      toJSON: () => ({})
    })),
  };
  
  Object.setPrototypeOf(canvas, HTMLCanvasElement.prototype);
  return canvas;
};

// Mock canvas for testing specific scenarios
export const mockCanvasScenarios = {
  // High DPI scenario
  highDPI: (): MockCanvas => createMockCanvas(1600, 1200),
  
  // Mobile scenario
  mobile: (): MockCanvas => createMockCanvas(375, 667),
  
  // WebGL failure scenario
  webglFailure: (): MockCanvas => {
    const canvas = createMockCanvas();
    canvas.getContext = jest.fn((contextType: string): MockCanvasRenderingContext2D | MockWebGLRenderingContext | null => {
      if (contextType === 'webgl' || contextType === 'webgl2') {
        return null; // Simulate WebGL not available
      }
      // For 2D context, return the original implementation
      if (contextType === '2d') {
        return createMockCanvas().getContext('2d');
      }
      return null;
    });
    return canvas;
  },
};

export default createMockCanvas;
