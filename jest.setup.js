// Jest setup file
// Three.jsのモック設定などをここに追加

// Canvas Mock
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: jest.fn((contextType) => {
    if (contextType === '2d') {
      return {
        fillRect: jest.fn(),
        clearRect: jest.fn(),
        getImageData: jest.fn(() => ({ data: new Array(4) })),
        putImageData: jest.fn(),
        createImageData: jest.fn(() => ({ data: new Array(4) })),
        setTransform: jest.fn(),
        drawImage: jest.fn(),
        save: jest.fn(),
        fillText: jest.fn(),
        restore: jest.fn(),
        beginPath: jest.fn(),
        moveTo: jest.fn(),
        lineTo: jest.fn(),
        closePath: jest.fn(),
        stroke: jest.fn(),
        translate: jest.fn(),
        scale: jest.fn(),
        rotate: jest.fn(),
        arc: jest.fn(),
        fill: jest.fn(),
      };
    } else if (contextType === 'webgl' || contextType === 'experimental-webgl') {
      // WebGL context mock
      const mockContext = {
        canvas: { width: 800, height: 600 },
        drawingBufferWidth: 800,
        drawingBufferHeight: 600,
        
        // Constants
        COLOR_BUFFER_BIT: 16384,
        DEPTH_BUFFER_BIT: 256,
        STENCIL_BUFFER_BIT: 1024,
        FRAMEBUFFER_COMPLETE: 36053,
        TEXTURE_2D: 3553,
        NEAREST: 9728,
        LINEAR: 9729,
        CLAMP_TO_EDGE: 33071,
        REPEAT: 10497,
        
        // Basic methods
        getParameter: jest.fn((param) => {
          switch (param) {
            case 7938: return 'WebKit WebGL'; // VENDOR
            case 7937: return 'WebKit'; // RENDERER  
            case 7936: return 'WebGL 1.0'; // VERSION
            default: return 'WebGL mock';
          }
        }),
        getExtension: jest.fn(() => null),
        getSupportedExtensions: jest.fn(() => []),
        
        // Shader methods
        createShader: jest.fn(() => ({})),
        shaderSource: jest.fn(),
        compileShader: jest.fn(),
        getShaderParameter: jest.fn(() => true),
        getShaderInfoLog: jest.fn(() => ''),
        deleteShader: jest.fn(),
        
        // Program methods
        createProgram: jest.fn(() => ({})),
        attachShader: jest.fn(),
        linkProgram: jest.fn(),
        getProgramParameter: jest.fn(() => true),
        getProgramInfoLog: jest.fn(() => ''),
        useProgram: jest.fn(),
        deleteProgram: jest.fn(),
        
        // Buffer methods
        createBuffer: jest.fn(() => ({})),
        bindBuffer: jest.fn(),
        bufferData: jest.fn(),
        deleteBuffer: jest.fn(),
        
        // Texture methods
        createTexture: jest.fn(() => ({})),
        bindTexture: jest.fn(),
        texImage2D: jest.fn(),
        texParameteri: jest.fn(),
        deleteTexture: jest.fn(),
        
        // Framebuffer methods
        createFramebuffer: jest.fn(() => ({})),
        bindFramebuffer: jest.fn(),
        framebufferTexture2D: jest.fn(),
        deleteFramebuffer: jest.fn(),
        checkFramebufferStatus: jest.fn(() => 36053), // FRAMEBUFFER_COMPLETE
        
        // Rendering methods
        viewport: jest.fn(),
        clear: jest.fn(),
        clearColor: jest.fn(),
        clearDepth: jest.fn(),
        enable: jest.fn(),
        disable: jest.fn(),
        depthFunc: jest.fn(),
        depthMask: jest.fn(),
        blendFunc: jest.fn(),
        blendEquation: jest.fn(),
        cullFace: jest.fn(),
        frontFace: jest.fn(),
        
        // Drawing methods
        drawArrays: jest.fn(),
        drawElements: jest.fn(),
        
        // Attribute methods
        getAttribLocation: jest.fn(() => 0),
        enableVertexAttribArray: jest.fn(),
        disableVertexAttribArray: jest.fn(),
        vertexAttribPointer: jest.fn(),
        
        // Uniform methods
        getUniformLocation: jest.fn(() => ({})),
        uniform1f: jest.fn(),
        uniform1i: jest.fn(),
        uniform2f: jest.fn(),
        uniform2fv: jest.fn(),
        uniform3f: jest.fn(),
        uniform3fv: jest.fn(),
        uniform4f: jest.fn(),
        uniform4fv: jest.fn(),
        uniformMatrix2fv: jest.fn(),
        uniformMatrix3fv: jest.fn(),
        uniformMatrix4fv: jest.fn(),
        
        // Texture unit methods
        activeTexture: jest.fn(),
        generateMipmap: jest.fn(),
        
        // Pixel methods
        pixelStorei: jest.fn(),
        readPixels: jest.fn(),
        
        // State methods
        isEnabled: jest.fn(() => false),
        getError: jest.fn(() => 0), // NO_ERROR
      };
      
      return mockContext;
    }
    return null;
  }),
});

// WebGL Mock
Object.defineProperty(HTMLCanvasElement.prototype, 'toDataURL', {
  value: jest.fn(() => 'data:image/png;base64,mock'),
});

// WebGL constants
global.WebGLRenderingContext = {
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

global.WebGL2RenderingContext = global.WebGLRenderingContext;

// Additional DOM mocks for Three.js
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

// Mock for document methods
Object.defineProperty(document, 'createElement', {
  value: jest.fn((tagName) => {
    if (tagName === 'canvas') {
      const canvas = {
        tagName: 'CANVAS',
        width: 800,
        height: 600,
        style: {},
        getContext: global.HTMLCanvasElement.prototype.getContext,
        toDataURL: global.HTMLCanvasElement.prototype.toDataURL,
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
