import '@testing-library/jest-dom';

global.WebGLRenderingContext = jest.fn();

// `getContext`が返す、より多くの関数を持つ偽のコンテキストオブジェクト
const mockContext = {
    // 今回のエラー(getShaderPrecisionFormat)を解決するモック。
    // Three.jsが期待する{ rangeMin, rangeMax, precision }の形式で値を返す。
    getShaderPrecisionFormat: jest.fn().mockReturnValue({
      rangeMin: 1,
      rangeMax: 1,
      precision: 1,
    }),
  
    // 以前のエラーを解決したモック
    getExtension: jest.fn(),
  
    // 初期化時に呼び出されるその他の重要な関数
    // getParameterが呼び出された際に、空の配列を返すように修正。
    // これにより、返り値に対して`.indexOf()`を呼び出してもエラーにならない。
    getParameter: jest.fn().mockReturnValue([]),

    createShader: jest.fn(),
    shaderSource: jest.fn(),
    compileShader: jest.fn(),
    getShaderParameter: jest.fn(() => true), // コンパイル成功を偽装
    createProgram: jest.fn(),
    attachShader: jest.fn(),
    linkProgram: jest.fn(),
    getProgramParameter: jest.fn(() => true), // リンク成功を偽装
    useProgram: jest.fn(),
    
    // 描画関連の基本的な関数
    clear: jest.fn(),
    clearColor: jest.fn(),
    viewport: jest.fn(),
  
    shaderSource: jest.fn(),
    // シェーダーのソースを"取得"する関数。空文字列を返すようにする。
    getShaderSource: jest.fn().mockReturnValue(''),
    
    // 今後必要になりそうな関数を先回りして追加
    createTexture: jest.fn(),
    bindTexture: jest.fn(),
    texParameteri: jest.fn(),
    texImage2D: jest.fn(),
    activeTexture: jest.fn(),
    createBuffer: jest.fn(),
    bindBuffer: jest.fn(),
    bufferData: jest.fn(),
    getAttribLocation: jest.fn(),
    vertexAttribPointer: jest.fn(),
    enableVertexAttribArray: jest.fn(),
    getUniformLocation: jest.fn(),
    uniformMatrix4fv: jest.fn(),
    texImage3D: jest.fn(),
    clearDepth: jest.fn(),
    clearStencil: jest.fn(),
    enable: jest.fn(),
    depthFunc: jest.fn(),
    frontFace: jest.fn(),
    cullFace: jest.fn(),
    getContextAttributes: jest.fn(),
    stencilMask: jest.fn(),
    getProgramInfoLog: jest.fn()
  };
  
  // `getContext`が、上記で定義した偽コンテキストを返すように設定
  global.HTMLCanvasElement.prototype.getContext = jest.fn().mockReturnValue(mockContext);