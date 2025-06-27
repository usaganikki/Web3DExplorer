# WebGLテスト専門ガイド

## 目次
1. [WebGLテストの基礎理論](#1-webglテストの基礎理論)
2. [WebGL特有のテスト課題](#2-webgl特有のテスト課題)
3. [テストツール実装ガイド](#3-テストツール実装ガイド)
4. [高度なテスト手法と最適化](#4-高度なテスト手法と最適化)
5. [将来技術と実装戦略](#5-将来技術と実装戦略)

## 1. WebGLテストの基礎理論

### 1.1 WebGL アーキテクチャとテスト設計

**WebGLパイプライン理解**

WebGLレンダリングパイプラインの理解は、効果的なテスト戦略構築の基盤となる：

```
頂点処理 → プリミティブ組み立て → ラスタライゼーション → フラグメント処理 → フレームバッファ操作
```

**各段階におけるテストポイント：**

1. **頂点シェーダーテスト**: 頂点座標変換、属性値処理の検証
2. **ジオメトリテスト**: プリミティブ組み立て、面カリング、クリッピングの確認
3. **フラグメントシェーダーテスト**: ピクセル色計算、テクスチャサンプリングの検証
4. **フレームバッファテスト**: 最終出力結果の画像比較

### 1.2 WebGL API 仕様準拠テスト

**Khronos WebGL適合性テストの理解**

Khronos GroupのWebGL適合性テストスイートは、WebGL実装の仕様準拠性を検証する公式ツールである。これらのテストは以下の目的で設計されている：

- **実装間の互換性確保**: 異なるブラウザ、OS間でのWebGLプログラム実行一貫性
- **OpenGL ES 2.0差異の検証**: デスクトップOpenGLとの重要な違いの確認
- **セキュリティ制約の検証**: WebGL特有のセキュリティ要件への適合性

**適合性テスト活用方法：**

```javascript
// WebGL適合性テスト統合例
const runConformanceTests = async () => {
  // 基本的なWebGLサポート確認
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
  
  if (!gl) {
    throw new Error('WebGL not supported');
  }
  
  // 適合性テスト項目の自動実行
  const conformanceResults = {
    extensions: checkExtensionSupport(gl),
    limits: checkWebGLLimits(gl),
    rendering: await checkRenderingCapabilities(gl),
    security: checkSecurityConstraints(gl)
  };
  
  return conformanceResults;
};

function checkWebGLLimits(gl) {
  return {
    maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
    maxViewportDims: gl.getParameter(gl.MAX_VIEWPORT_DIMS),
    maxVertexAttribs: gl.getParameter(gl.MAX_VERTEX_ATTRIBS),
    maxVaryingVectors: gl.getParameter(gl.MAX_VARYING_VECTORS),
    maxFragmentUniforms: gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS),
    maxVertexUniforms: gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS)
  };
}

function checkExtensionSupport(gl) {
  const extensions = [
    'OES_vertex_array_object',
    'WEBGL_depth_texture',
    'OES_texture_float',
    'OES_texture_half_float',
    'EXT_color_buffer_float',
    'EXT_color_buffer_half_float',
    'WEBGL_color_buffer_float',
    'EXT_float_blend'
  ];
  
  const supportedExtensions = {};
  extensions.forEach(ext => {
    supportedExtensions[ext] = gl.getExtension(ext) !== null;
  });
  
  return supportedExtensions;
}

async function checkRenderingCapabilities(gl) {
  // 基本レンダリング機能テスト
  const canvas = gl.canvas;
  canvas.width = 256;
  canvas.height = 256;
  
  gl.viewport(0, 0, 256, 256);
  gl.clearColor(0.0, 0.0, 1.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  
  // ピクセル読み取りテスト
  const pixels = new Uint8Array(4);
  gl.readPixels(128, 128, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
  
  return {
    canRender: pixels[2] === 255, // 青色が正しく描画されているか
    canReadPixels: true,
    maxRenderbufferSize: gl.getParameter(gl.MAX_RENDERBUFFER_SIZE),
    maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE)
  };
}

function checkSecurityConstraints(gl) {
  // WebGL特有のセキュリティ制約確認
  return {
    contextLossHandling: checkContextLossHandling(gl),
    crossOriginResourceSharing: checkCORSSupport(gl),
    shaderPrecisionLimits: checkShaderPrecision(gl)
  };
}

function checkContextLossHandling(gl) {
  // コンテキストロス・復帰テスト
  const loseExtension = gl.getExtension('WEBGL_lose_context');
  if (!loseExtension) {
    return { supported: false, reason: 'WEBGL_lose_context extension not available' };
  }
  
  let contextLost = false;
  let contextRestored = false;
  
  const canvas = gl.canvas;
  canvas.addEventListener('webglcontextlost', () => {
    contextLost = true;
  });
  
  canvas.addEventListener('webglcontextrestored', () => {
    contextRestored = true;
  });
  
  // 手動でコンテキストロスを発生
  loseExtension.loseContext();
  
  return {
    supported: true,
    canLoseContext: true,
    contextLostDetected: contextLost
  };
}
```

### 1.3 GPU依存の問題への対処法

**GPU固有の問題パターン**

WebGLは互換性のあるほとんどのモダンブラウザで動作するが、GPU（グラフィック処理ユニット）を使用するため高速である。しかし、GPU依存による以下の問題が発生する：

**精度の変動問題：**
- 浮動小数点演算の GPU間での微細な差異
- シェーダー最適化による結果の変動
- テクスチャフィルタリングの実装差異

**対処戦略：**

```javascript
// 許容誤差を考慮したピクセル比較
function comparePixelsWithTolerance(expected, actual, tolerance = 0.01) {
  const diff = Math.abs(expected - actual) / 255.0;
  return diff <= tolerance;
}

// GPU精度テスト用のシェーダー
const precisionTestFragmentShader = `
precision highp float;
void main() {
  // 高精度計算テスト
  float highPrecisionValue = 1.0 / 3.0;
  gl_FragColor = vec4(highPrecisionValue, highPrecisionValue, highPrecisionValue, 1.0);
}
`;

// 異なるGPU間での結果比較
async function testGPUPrecision(gl) {
  const shader = compileShader(gl, precisionTestFragmentShader);
  renderToTexture(gl, shader);
  
  const pixels = new Uint8Array(4);
  gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
  
  // 期待値との比較（GPU固有の許容範囲を設定）
  const tolerance = getGPUSpecificTolerance();
  return comparePixelsWithTolerance([85, 85, 85, 255], pixels, tolerance);
}

function getGPUSpecificTolerance() {
  const gl = document.createElement('canvas').getContext('webgl');
  const renderer = gl.getParameter(gl.RENDERER);
  const vendor = gl.getParameter(gl.VENDOR);
  
  // GPU別の許容誤差設定
  if (renderer.includes('Intel')) {
    return 0.02; // Intel GPU: 2%許容誤差
  } else if (renderer.includes('NVIDIA')) {
    return 0.005; // NVIDIA GPU: 0.5%許容誤差
  } else if (renderer.includes('AMD') || renderer.includes('Radeon')) {
    return 0.01; // AMD GPU: 1%許容誤差
  } else if (renderer.includes('Apple')) {
    return 0.008; // Apple GPU: 0.8%許容誤差
  }
  
  return 0.015; // デフォルト: 1.5%許容誤差
}

// GPU情報収集ユーティリティ
function getGPUInfo(gl) {
  const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
  
  return {
    vendor: gl.getParameter(gl.VENDOR),
    renderer: gl.getParameter(gl.RENDERER),
    version: gl.getParameter(gl.VERSION),
    shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
    unmaskedVendor: debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : 'Unknown',
    unmaskedRenderer: debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'Unknown',
    maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
    maxViewportDims: gl.getParameter(gl.MAX_VIEWPORT_DIMS),
    maxVertexAttribs: gl.getParameter(gl.MAX_VERTEX_ATTRIBS)
  };
}

// プラットフォーム別最適化設定
function getPlatformOptimizations() {
  const userAgent = navigator.userAgent;
  const platform = navigator.platform;
  
  let optimizations = {
    antialias: true,
    preserveDrawingBuffer: false,
    powerPreference: 'default'
  };
  
  // iOS Safari の場合
  if (/iPad|iPhone|iPod/.test(userAgent)) {
    optimizations = {
      ...optimizations,
      antialias: false, // iOS では antialias 無効化
      powerPreference: 'low-power', // バッテリー節約
      maxTextureSize: 2048 // テクスチャサイズ制限
    };
  }
  
  // Android Chrome の場合
  if (/Android/.test(userAgent)) {
    optimizations = {
      ...optimizations,
      powerPreference: 'high-performance',
      failIfMajorPerformanceCaveat: false
    };
  }
  
  // Windows の場合
  if (/Windows/.test(platform)) {
    optimizations = {
      ...optimizations,
      powerPreference: 'high-performance',
      antialias: true
    };
  }
  
  return optimizations;
}
```

### 1.4 エラー検出・ハンドリング基礎

**WebGLエラー監視システム**

```javascript
// WebGLエラー監視クラス
class WebGLErrorMonitor {
  constructor(gl) {
    this.gl = gl;
    this.errorHistory = [];
    this.errorCallbacks = [];
    this.maxErrors = 32; // Firefox の制限に合わせる
  }
  
  // エラーチェック実行
  checkErrors(operation = 'unknown') {
    const error = this.gl.getError();
    
    if (error !== this.gl.NO_ERROR) {
      const errorInfo = {
        code: error,
        name: this.getErrorName(error),
        operation: operation,
        timestamp: Date.now(),
        stack: new Error().stack
      };
      
      this.errorHistory.push(errorInfo);
      this.notifyCallbacks(errorInfo);
      
      // エラー履歴の上限管理
      if (this.errorHistory.length > this.maxErrors) {
        this.errorHistory.shift();
      }
      
      return errorInfo;
    }
    
    return null;
  }
  
  getErrorName(errorCode) {
    const errorNames = {
      [this.gl.NO_ERROR]: 'NO_ERROR',
      [this.gl.INVALID_ENUM]: 'INVALID_ENUM',
      [this.gl.INVALID_VALUE]: 'INVALID_VALUE',
      [this.gl.INVALID_OPERATION]: 'INVALID_OPERATION',
      [this.gl.INVALID_FRAMEBUFFER_OPERATION]: 'INVALID_FRAMEBUFFER_OPERATION',
      [this.gl.OUT_OF_MEMORY]: 'OUT_OF_MEMORY',
      [this.gl.CONTEXT_LOST_WEBGL]: 'CONTEXT_LOST_WEBGL'
    };
    
    return errorNames[errorCode] || `UNKNOWN_ERROR_${errorCode}`;
  }
  
  // エラーコールバック登録
  onError(callback) {
    this.errorCallbacks.push(callback);
  }
  
  notifyCallbacks(errorInfo) {
    this.errorCallbacks.forEach(callback => {
      try {
        callback(errorInfo);
      } catch (e) {
        console.error('Error in WebGL error callback:', e);
      }
    });
  }
  
  // エラー統計取得
  getErrorStats() {
    const stats = {};
    
    this.errorHistory.forEach(error => {
      if (!stats[error.name]) {
        stats[error.name] = {
          count: 0,
          operations: new Set(),
          firstOccurrence: error.timestamp,
          lastOccurrence: error.timestamp
        };
      }
      
      stats[error.name].count++;
      stats[error.name].operations.add(error.operation);
      stats[error.name].lastOccurrence = error.timestamp;
    });
    
    return stats;
  }
  
  // エラー履歴クリア
  clearErrors() {
    this.errorHistory = [];
  }
}

// 使用例
describe('WebGL Error Monitoring', () => {
  let gl, errorMonitor;
  
  beforeEach(() => {
    const canvas = document.createElement('canvas');
    gl = canvas.getContext('webgl');
    errorMonitor = new WebGLErrorMonitor(gl);
  });
  
  test('should detect invalid operations', () => {
    // 意図的に無効な操作を実行
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 100, 100, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    
    const error = errorMonitor.checkErrors('invalid texture operation');
    expect(error).not.toBeNull();
    expect(error.name).toBe('INVALID_OPERATION');
  });
  
  test('should track error statistics', () => {
    // 複数のエラーを発生させる
    gl.bindTexture(gl.TEXTURE_2D, 999); // 無効なテクスチャID
    errorMonitor.checkErrors('invalid bind');
    
    gl.uniform1f(-1, 1.0); // 無効なユニフォーム位置
    errorMonitor.checkErrors('invalid uniform');
    
    const stats = errorMonitor.getErrorStats();
    expect(Object.keys(stats).length).toBeGreaterThan(0);
  });
});
```

## 2. WebGL特有のテスト課題

### 2.1 クロスプラットフォーム対応策

**プラットフォーム固有の問題と対応**

WebGLの可用性は大部分がクライアントシステムに依存する。WebGL拡張機能を使用する場合、可能であれば対応していない場合に適切に適応することでオプション化を試みるべきである。

**主要プラットフォーム別課題：**

**Windows（ANGLE）:**
```javascript
// ANGLEドライバー検出と対応
function detectANGLE(gl) {
  const renderer = gl.getParameter(gl.RENDERER);
  const isANGLE = renderer.includes('ANGLE');
  
  if (isANGLE) {
    console.log('ANGLE detected:', renderer);
    // ANGLE特有の制限事項への対応
    return {
      maxTextureSize: Math.min(gl.getParameter(gl.MAX_TEXTURE_SIZE), 4096),
      supportsFloatTextures: checkFloatTextureSupport(gl, true),
      shaderPrecision: 'medium', // ANGLE では精度制限
      batchSizeLimit: 2000 // 描画バッチサイズ制限
    };
  }
  
  return null;
}

function optimizeForANGLE(gl, config) {
  if (config && config.isANGLE) {
    // ANGLE最適化設定
    gl.disable(gl.DITHER); // ディザリング無効化
    
    // テクスチャ設定の最適化
    const textureOptimizations = {
      filterMode: gl.LINEAR, // シンプルなフィルタリング
      wrapMode: gl.CLAMP_TO_EDGE, // エッジクランプ
      maxMipLevel: 4 // ミップマップレベル制限
    };
    
    return textureOptimizations;
  }
  
  return {};
}
```

**macOS（Metal）:**
```javascript
// Metal バックエンド最適化
function optimizeForMetal(gl) {
  const renderer = gl.getParameter(gl.RENDERER);
  const isMetal = renderer.includes('Metal');
  
  if (isMetal) {
    // Metal特有の最適化設定
    return {
      preferredVertexFormat: gl.FLOAT,
      batchSize: 1000,
      useComputeShaders: true,
      memoryStrategy: 'unified',
      renderPassOptimization: true
    };
  }
  
  return {};
}
```

**Linux（Mesa）:**
```javascript
// Mesa ドライバー対応
function configureForMesa(gl) {
  const vendor = gl.getParameter(gl.VENDOR);
  const renderer = gl.getParameter(gl.RENDERER);
  const isMesa = vendor.includes('Mesa') || renderer.includes('Mesa');
  
  if (isMesa) {
    const mesaConfig = {
      maxDrawBuffers: Math.min(gl.getParameter(gl.MAX_DRAW_BUFFERS), 4),
      avoidComplexShaders: true,
      useLinearFiltering: false,
      limitTextureUnits: 8,
      shaderOptimization: 'conservative'
    };
    
    const version = getMesaVersion(renderer);
    if (version && version.major < 20) {
      mesaConfig.legacyMode = true;
      mesaConfig.maxVertexAttributes = 8;
    }
    
    return mesaConfig;
  }
  
  return {};
}
```

### 2.2 精度保証の手法

**数値精度テスト戦略**

```javascript
// 精度テスト用フレームワーク
class WebGLPrecisionTester {
  constructor(gl) {
    this.gl = gl;
    this.tolerances = {
      low: 0.1,      // 10%
      medium: 0.02,  // 2%
      high: 0.004,   // 0.4%
      ultra: 0.001   // 0.1%
    };
  }
  
  // 浮動小数点精度テスト
  testFloatPrecision() {
    const testValues = [
      { input: Math.PI, expected: Math.PI, name: 'PI' },
      { input: 1.0/3.0, expected: 0.333333, name: 'One Third' },
      { input: Math.sqrt(2), expected: Math.sqrt(2), name: 'Square Root 2' },
      { input: Math.E, expected: Math.E, name: 'Euler Number' },
      { input: 0.1 + 0.2, expected: 0.3, name: 'Float Addition' }
    ];
    
    return testValues.map(test => this.runPrecisionTest(test));
  }
  
  runPrecisionTest({ input, expected, name }) {
    const result = this.computeOnGPU(input);
    const relativeError = Math.abs(result - expected) / Math.abs(expected);
    
    return {
      name,
      input,
      expected,
      actual: result,
      relativeError,
      tolerance: this.selectTolerance(relativeError),
      passed: relativeError <= this.tolerances.medium
    };
  }
  
  // 行列計算精度テスト
  testMatrixPrecision() {
    const tests = [
      this.testMatrixMultiplication(),
      this.testMatrixInversion(),
      this.testMatrixOrthogonality()
    ];
    
    return tests;
  }
  
  testMatrixMultiplication() {
    // 単位行列との乗算テスト
    const identity = [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ];
    
    const testMatrix = [
      2, 0, 0, 0,
      0, 3, 0, 0,
      0, 0, 4, 0,
      0, 0, 0, 1
    ];
    
    const result = this.multiplyMatricesOnGPU(testMatrix, identity);
    const expectedResult = testMatrix;
    
    const error = this.calculateMatrixError(result, expectedResult);
    
    return {
      name: 'Matrix Multiplication',
      passed: error < this.tolerances.medium,
      error: error,
      result: result,
      expected: expectedResult
    };
  }
  
  testMatrixInversion() {
    // 逆行列計算精度テスト
    const matrix = [
      2, 0, 0, 0,
      0, 3, 0, 0,
      0, 0, 4, 0,
      0, 0, 0, 1
    ];
    
    const inverse = this.invertMatrixOnGPU(matrix);
    const identity = this.multiplyMatricesOnGPU(matrix, inverse);
    
    const expectedIdentity = [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ];
    
    const error = this.calculateMatrixError(identity, expectedIdentity);
    
    return {
      name: 'Matrix Inversion',
      passed: error < this.tolerances.medium,
      error: error,
      identity: identity,
      expected: expectedIdentity
    };
  }
  
  calculateMatrixError(actual, expected) {
    let totalError = 0;
    for (let i = 0; i < actual.length; i++) {
      totalError += Math.abs(actual[i] - expected[i]);
    }
    return totalError / actual.length;
  }
}
```

### 2.3 メモリ・リソース管理テスト

**WebGLリソースリークの検出**

```javascript
// リソースリーク検出フレームワーク
class WebGLResourceTracker {
  constructor(gl) {
    this.gl = gl;
    this.resources = {
      textures: new Set(),
      buffers: new Set(),
      programs: new Set(),
      shaders: new Set(),
      framebuffers: new Set(),
      renderbuffers: new Set()
    };
    
    this.creationStack = new Map();
    this.wrapWebGLMethods();
  }
  
  wrapWebGLMethods() {
    // テクスチャ管理
    const originalCreateTexture = this.gl.createTexture;
    this.gl.createTexture = () => {
      const texture = originalCreateTexture.call(this.gl);
      this.resources.textures.add(texture);
      this.creationStack.set(texture, new Error().stack);
      return texture;
    };
    
    const originalDeleteTexture = this.gl.deleteTexture;
    this.gl.deleteTexture = (texture) => {
      this.resources.textures.delete(texture);
      this.creationStack.delete(texture);
      return originalDeleteTexture.call(this.gl, texture);
    };
    
    // バッファ管理
    const originalCreateBuffer = this.gl.createBuffer;
    this.gl.createBuffer = () => {
      const buffer = originalCreateBuffer.call(this.gl);
      this.resources.buffers.add(buffer);
      this.creationStack.set(buffer, new Error().stack);
      return buffer;
    };
    
    const originalDeleteBuffer = this.gl.deleteBuffer;
    this.gl.deleteBuffer = (buffer) => {
      this.resources.buffers.delete(buffer);
      this.creationStack.delete(buffer);
      return originalDeleteBuffer.call(this.gl, buffer);
    };
  }
  
  getResourceSummary() {
    return {
      textureCount: this.resources.textures.size,
      bufferCount: this.resources.buffers.size,
      programCount: this.resources.programs.size,
      shaderCount: this.resources.shaders.size,
      framebufferCount: this.resources.framebuffers.size,
      renderbufferCount: this.resources.renderbuffers.size,
      totalResources: Object.values(this.resources).reduce((sum, set) => sum + set.size, 0)
    };
  }
  
  checkForLeaks() {
    const summary = this.getResourceSummary();
    const hasLeaks = summary.totalResources > 0;
    
    if (hasLeaks) {
      console.warn('Potential WebGL resource leak detected:', summary);
      this.logLeakDetails();
    }
    
    return { hasLeaks, summary };
  }
  
  // メモリ使用量推定
  estimateMemoryUsage() {
    let totalMemory = 0;
    
    this.resources.textures.forEach(texture => {
      totalMemory += this.estimateTextureMemory(texture);
    });
    
    this.resources.buffers.forEach(buffer => {
      totalMemory += this.estimateBufferMemory(buffer);
    });
    
    return {
      totalBytes: totalMemory,
      totalMB: (totalMemory / (1024 * 1024)).toFixed(2)
    };
  }
  
  estimateTextureMemory(texture) {
    // 標準的なテクスチャサイズとフォーマットで推定
    return 1024 * 1024 * 4; // 1MB RGBA テクスチャと仮定
  }
  
  estimateBufferMemory(buffer) {
    // 標準的なバッファサイズで推定
    return 65536; // 64KB バッファと仮定
  }
}

// GPU メモリ監視
class GPUMemoryMonitor {
  constructor(gl) {
    this.gl = gl;
    this.memoryInfo = null;
    this.updateMemoryInfo();
  }
  
  updateMemoryInfo() {
    const memoryExtension = this.gl.getExtension('WEBGL_debug_renderer_info');
    
    this.memoryInfo = {
      totalMemory: this.estimateTotalGPUMemory(),
      availableMemory: this.estimateAvailableMemory(),
      usedMemory: this.estimateUsedMemory(),
      maxTextureSize: this.gl.getParameter(this.gl.MAX_TEXTURE_SIZE),
      maxRenderbufferSize: this.gl.getParameter(this.gl.MAX_RENDERBUFFER_SIZE)
    };
  }
  
  estimateTotalGPUMemory() {
    // WebGLでは直接GPU メモリ量を取得できないため推定
    const renderer = this.gl.getParameter(this.gl.RENDERER);
    
    // GPU別の一般的なメモリ量（推定）
    if (renderer.includes('RTX 4090')) return 24 * 1024 * 1024 * 1024; // 24GB
    if (renderer.includes('RTX 4080')) return 16 * 1024 * 1024 * 1024; // 16GB
    if (renderer.includes('RTX 3080')) return 10 * 1024 * 1024 * 1024; // 10GB
    if (renderer.includes('Apple M1')) return 8 * 1024 * 1024 * 1024;   // 8GB (統合)
    if (renderer.includes('Intel')) return 2 * 1024 * 1024 * 1024;      // 2GB (推定)
    
    return 4 * 1024 * 1024 * 1024; // デフォルト 4GB
  }
  
  estimateAvailableMemory() {
    // 利用可能メモリの推定（実際の値は取得不可）
    return this.memoryInfo ? this.memoryInfo.totalMemory * 0.8 : 0;
  }
  
  estimateUsedMemory() {
    // 使用メモリの推定
    return this.memoryInfo ? this.memoryInfo.totalMemory * 0.2 : 0;
  }
  
  getMemoryPressure() {
    const usedRatio = this.memoryInfo.usedMemory / this.memoryInfo.totalMemory;
    
    if (usedRatio > 0.9) return 'critical';
    if (usedRatio > 0.75) return 'high';
    if (usedRatio > 0.5) return 'medium';
    return 'low';
  }
  
  // メモリ使用量最適化提案
  getOptimizationSuggestions() {
    const pressure = this.getMemoryPressure();
    const suggestions = [];
    
    if (pressure === 'critical' || pressure === 'high') {
      suggestions.push('テクスチャサイズの削減を検討');
      suggestions.push('使用していないリソースの削除');
      suggestions.push('テクスチャ圧縮の適用');
      suggestions.push('ミップマップレベルの制限');
    }
    
    if (pressure === 'medium') {
      suggestions.push('リソースプールの実装を検討');
      suggestions.push('LOD（Level of Detail）システムの導入');
    }
    
    return suggestions;
  }
}

// テストケース例
describe('WebGL Memory Management', () => {
  let gl, resourceTracker, memoryMonitor;
  
  beforeEach(() => {
    const canvas = document.createElement('canvas');
    gl = canvas.getContext('webgl');
    resourceTracker = new WebGLResourceTracker(gl);
    memoryMonitor = new GPUMemoryMonitor(gl);
  });
  
  afterEach(() => {
    const leakCheck = resourceTracker.checkForLeaks();
    expect(leakCheck.hasLeaks).toBe(false);
  });
  
  test('should track texture creation and cleanup', () => {
    const texture = gl.createTexture();
    
    let summary = resourceTracker.getResourceSummary();
    expect(summary.textureCount).toBe(1);
    
    gl.deleteTexture(texture);
    
    summary = resourceTracker.getResourceSummary();
    expect(summary.textureCount).toBe(0);
  });
  
  test('should estimate memory usage', () => {
    const textures = Array.from({ length: 5 }, () => gl.createTexture());
    const buffers = Array.from({ length: 3 }, () => gl.createBuffer());
    
    const memoryUsage = resourceTracker.estimateMemoryUsage();
    expect(memoryUsage.totalBytes).toBeGreaterThan(0);
    
    // クリーンアップ
    textures.forEach(texture => gl.deleteTexture(texture));
    buffers.forEach(buffer => gl.deleteBuffer(buffer));
  });
  
  test('should detect memory pressure', () => {
    memoryMonitor.updateMemoryInfo();
    const pressure = memoryMonitor.getMemoryPressure();
    expect(['low', 'medium', 'high', 'critical']).toContain(pressure);
    
    const suggestions = memoryMonitor.getOptimizationSuggestions();
    expect(Array.isArray(suggestions)).toBe(true);
  });
});
```

### 2.4 ブラウザ間互換性テスト

**ブラウザ固有の問題検出**

```javascript
// ブラウザ互換性テスター
class BrowserCompatibilityTester {
  constructor(gl) {
    this.gl = gl;
    this.browserInfo = this.detectBrowser();
    this.knownIssues = this.loadKnownIssues();
  }
  
  detectBrowser() {
    const userAgent = navigator.userAgent;
    let browser = 'unknown';
    let version = 'unknown';
    
    if (userAgent.includes('Chrome')) {
      browser = 'chrome';
      const match = userAgent.match(/Chrome\/(\d+)/);
      version = match ? match[1] : 'unknown';
    } else if (userAgent.includes('Firefox')) {
      browser = 'firefox';
      const match = userAgent.match(/Firefox\/(\d+)/);
      version = match ? match[1] : 'unknown';
    } else if (userAgent.includes('Safari')) {
      browser = 'safari';
      const match = userAgent.match(/Version\/(\d+)/);
      version = match ? match[1] : 'unknown';
    }
    
    return { browser, version, userAgent };
  }
  
  loadKnownIssues() {
    return {
      chrome: {
        '90-95': ['ANGLE precision issues', 'Context loss on tab switch'],
        '96+': ['Improved WebGL2 support']
      },
      firefox: {
        '80-85': ['Shader compilation delays', 'Extension support limited'],
        '86+': ['Better performance', 'WebGL2 improvements']
      },
      safari: {
        '14-15': ['WebGL2 partial support', 'iOS restrictions'],
        '16+': ['Full WebGL2 support', 'Metal backend improvements']
      }
    };
  }
  
  runCompatibilityTests() {
    const tests = [
      this.testExtensionSupport(),
      this.testShaderPrecision(),
      this.testTextureFormats(),
      this.testFramebufferSupport(),
      this.testVertexArrayObjects()
    ];
    
    return {
      browser: this.browserInfo,
      results: tests,
      knownIssues: this.getKnownIssuesForBrowser(),
      overallCompatibility: this.calculateOverallScore(tests)
    };
  }
  
  testExtensionSupport() {
    const requiredExtensions = [
      'OES_vertex_array_object',
      'WEBGL_depth_texture',
      'OES_texture_float',
      'OES_texture_half_float'
    ];
    
    const optionalExtensions = [
      'EXT_color_buffer_float',
      'WEBGL_color_buffer_float',
      'EXT_float_blend',
      'WEBGL_draw_buffers'
    ];
    
    const supportedRequired = requiredExtensions.filter(ext => 
      this.gl.getExtension(ext) !== null
    );
    
    const supportedOptional = optionalExtensions.filter(ext => 
      this.gl.getExtension(ext) !== null
    );
    
    return {
      name: 'Extension Support',
      passed: supportedRequired.length === requiredExtensions.length,
      details: {
        required: {
          supported: supportedRequired,
          missing: requiredExtensions.filter(ext => !supportedRequired.includes(ext))
        },
        optional: {
          supported: supportedOptional,
          missing: optionalExtensions.filter(ext => !supportedOptional.includes(ext))
        }
      }
    };
  }
  
  testShaderPrecision() {
    const precisionTests = ['lowp', 'mediump', 'highp'].map(precision => {
      const fragmentShader = `
        precision ${precision} float;
        void main() {
          float value = 1.0 / 3.0;
          gl_FragColor = vec4(value, value, value, 1.0);
        }
      `;
      
      try {
        const shader = this.compileShader(this.gl.FRAGMENT_SHADER, fragmentShader);
        const success = this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS);
        this.gl.deleteShader(shader);
        
        return { precision, supported: success };
      } catch (error) {
        return { precision, supported: false, error: error.message };
      }
    });
    
    return {
      name: 'Shader Precision Support',
      passed: precisionTests.some(test => test.supported),
      details: precisionTests
    };
  }
  
  getKnownIssuesForBrowser() {
    const browser = this.browserInfo.browser;
    const version = parseInt(this.browserInfo.version);
    const issues = this.knownIssues[browser];
    
    if (!issues) return [];
    
    for (const [versionRange, issueList] of Object.entries(issues)) {
      if (this.isVersionInRange(version, versionRange)) {
        return issueList;
      }
    }
    
    return [];
  }
  
  isVersionInRange(version, range) {
    if (range.includes('+')) {
      const minVersion = parseInt(range.replace('+', ''));
      return version >= minVersion;
    }
    
    if (range.includes('-')) {
      const [min, max] = range.split('-').map(v => parseInt(v));
      return version >= min && version <= max;
    }
    
    return version === parseInt(range);
  }
  
  calculateOverallScore(tests) {
    const passedTests = tests.filter(test => test.passed).length;
    const totalTests = tests.length;
    const score = (passedTests / totalTests) * 100;
    
    if (score >= 90) return 'excellent';
    if (score >= 75) return 'good';
    if (score >= 60) return 'fair';
    return 'poor';
  }
}
```

## 3. テストツール実装ガイド

### 3.1 Jest + Canvas API mocksの実装

**jest-canvas-mockセットアップ**

Canvas API のモックライブラリである jest-canvas-mock は、JSDOM 環境での Canvas 描画テストを可能にする重要なツールです。

```bash
# インストール
npm install --save-dev jest-canvas-mock
```

**Jest設定ファイルの構成**

```javascript
// jest.config.js
module.exports = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jsdom',
  moduleNameMapping: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(three)/)'
  ]
};

// jest.setup.js
import 'jest-canvas-mock';

// Three.js のテスト環境設定
global.THREE = require('three');

// WebGLRenderingContext のモック
global.WebGLRenderingContext = jest.fn(() => ({
  canvas: document.createElement('canvas'),
  drawingBufferWidth: 300,
  drawingBufferHeight: 150,
  getParameter: jest.fn(),
  getExtension: jest.fn(),
  // 基本的な WebGL メソッド
  createBuffer: jest.fn(),
  createTexture: jest.fn(),
  createShader: jest.fn(),
  createProgram: jest.fn(),
}));
```

**Canvas APIモックの詳細機能**

```javascript
// Canvas描画呼び出しの検証テスト
describe('Canvas Drawing Calls', () => {
  let canvas, ctx;
  
  beforeEach(() => {
    canvas = document.createElement('canvas');
    ctx = canvas.getContext('2d');
  });
  
  test('should track drawing operations', () => {
    ctx.fillStyle = 'red';
    ctx.fillRect(10, 10, 100, 50);
    
    // jest-canvas-mock によるイベント追跡
    const events = ctx.__getEvents();
    expect(events).toContainEqual({
      type: 'fillStyle',
      props: { value: 'red' }
    });
    expect(events).toContainEqual({
      type: 'fillRect',
      props: { x: 10, y: 10, width: 100, height: 50 }
    });
  });
  
  test('should capture drawing path', () => {
    ctx.beginPath();
    ctx.moveTo(10, 10);
    ctx.lineTo(100, 100);
    ctx.stroke();
    
    const path = ctx.__getPath();
    expect(path).toContain('moveTo(10,10)');
    expect(path).toContain('lineTo(100,100)');
  });
  
  test('should track all draw calls', () => {
    ctx.save();
    ctx.scale(2, 2);
    ctx.fillRect(0, 0, 50, 50);
    ctx.restore();
    
    const drawCalls = ctx.__getDrawCalls();
    expect(drawCalls).toHaveLength(4);
    expect(drawCalls[0]).toEqual(['save']);
    expect(drawCalls[1]).toEqual(['scale', 2, 2]);
    expect(drawCalls[2]).toEqual(['fillRect', 0, 0, 50, 50]);
    expect(drawCalls[3]).toEqual(['restore']);
  });
});
```

**Three.jsとの統合テスト**

```javascript
import * as THREE from 'three';

describe('Three.js Canvas Integration', () => {
  let scene, camera, renderer, canvas;
  
  beforeEach(() => {
    // Canvas要素の作成
    canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    
    // Three.js基本オブジェクトの初期化
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    
    // WebGLRendererのモック
    renderer = {
      domElement: canvas,
      setSize: jest.fn(),
      render: jest.fn(),
      dispose: jest.fn()
    };
  });
  
  test('should create Three.js scene components', () => {
    expect(scene).toBeInstanceOf(THREE.Scene);
    expect(camera).toBeInstanceOf(THREE.PerspectiveCamera);
    expect(renderer.domElement).toBe(canvas);
  });
  
  test('should verify geometry creation', () => {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    
    scene.add(cube);
    
    expect(scene.children).toHaveLength(1);
    expect(scene.children[0]).toBe(cube);
    expect(cube.geometry).toBeInstanceOf(THREE.BoxGeometry);
    expect(cube.material.color.getHex()).toBe(0x00ff00);
  });
  
  test('should mock render calls', () => {
    const cube = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshBasicMaterial({ color: 0xff0000 })
    );
    scene.add(cube);
    
    renderer.render(scene, camera);
    
    expect(renderer.render).toHaveBeenCalledWith(scene, camera);
    expect(renderer.render).toHaveBeenCalledTimes(1);
  });
});
```

### 3.2 Puppeteer/Playwright実装ガイド

**ヘッドレスブラウザ環境構築**

```javascript
// puppeteer-config.js
const puppeteerConfig = {
  launch: {
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--disable-features=VizDisplayCompositor',
      '--enable-webgl',
      '--enable-accelerated-2d-canvas',
      '--enable-gpu-rasterization',
      '--enable-zero-copy',
      '--ignore-gpu-blacklist',
      '--use-angle=metal', // macOS用Metal backend
      '--use-gl=angle',    // Windows用ANGLE
    ],
    ignoreDefaultArgs: ['--disable-extensions'],
  },
  viewport: {
    width: 1024,
    height: 768,
    deviceScaleFactor: 1,
  }
};

// playwright-config.js
const playwrightConfig = {
  use: {
    launchOptions: {
      args: [
        '--enable-webgl',
        '--enable-gpu',
        '--use-angle=metal'
      ]
    },
    viewport: { width: 1024, height: 768 },
    ignoreHTTPSErrors: true,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
};
```

**Three.js描画結果キャプチャ**

```javascript
// puppeteer-threejs-test.js
const puppeteer = require('puppeteer');
const fs = require('fs').promises;

class ThreeJSPuppeteerTester {
  constructor() {
    this.browser = null;
    this.page = null;
  }
  
  async setup() {
    this.browser = await puppeteer.launch(puppeteerConfig.launch);
    this.page = await this.browser.newPage();
    await this.page.setViewport(puppeteerConfig.viewport);
    
    // WebGL サポート確認
    const webglSupported = await this.page.evaluate(() => {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      return !!gl;
    });
    
    if (!webglSupported) {
      throw new Error('WebGL not supported in headless browser');
    }
  }
  
  async loadThreeJSScene(htmlPath) {
    await this.page.goto(`file://${htmlPath}`);
    
    // Three.js ライブラリの読み込み待機
    await this.page.waitForFunction(() => {
      return typeof window.THREE !== 'undefined';
    });
    
    // シーンの初期化待機
    await this.page.waitForFunction(() => {
      return window.sceneReady === true;
    }, { timeout: 10000 });
  }
  
  async captureWebGLCanvas(selector = 'canvas') {
    // WebGL描画完了の待機
    await this.page.waitForFunction((sel) => {
      const canvas = document.querySelector(sel);
      if (!canvas) return false;
      
      const gl = canvas.getContext('webgl');
      if (!gl) return false;
      
      // フレーム描画の確認
      return canvas.width > 0 && canvas.height > 0;
    }, {}, selector);
    
    // アニメーション停止（安定したキャプチャのため）
    await this.page.evaluate(() => {
      if (window.animationId) {
        cancelAnimationFrame(window.animationId);
      }
    });
    
    // 追加の描画フレーム待機
    await this.page.waitForTimeout(100);
    
    const screenshot = await this.page.screenshot({
      clip: await this.page.evaluate((sel) => {
        const canvas = document.querySelector(sel);
        const rect = canvas.getBoundingClientRect();
        return {
          x: rect.left,
          y: rect.top,
          width: rect.width,
          height: rect.height
        };
      }, selector)
    });
    
    return screenshot;
  }
  
  async compareImages(baselinePath, currentPath, diffPath, threshold = 0.1) {
    const pixelmatch = require('pixelmatch');
    const PNG = require('pngjs').PNG;
    
    const baseline = PNG.sync.read(await fs.readFile(baselinePath));
    const current = PNG.sync.read(await fs.readFile(currentPath));
    const { width, height } = baseline;
    const diff = new PNG({ width, height });
    
    const numDiffPixels = pixelmatch(
      baseline.data,
      current.data,
      diff.data,
      width,
      height,
      { threshold }
    );
    
    await fs.writeFile(diffPath, PNG.sync.write(diff));
    
    return {
      numDiffPixels,
      totalPixels: width * height,
      percentageDiff: (numDiffPixels / (width * height)) * 100
    };
  }
  
  async cleanup() {
    if (this.page) await this.page.close();
    if (this.browser) await this.browser.close();
  }
}

// テスト使用例
describe('Three.js Visual Regression Tests', () => {
  let tester;
  
  beforeAll(async () => {
    tester = new ThreeJSPuppeteerTester();
    await tester.setup();
  });
  
  afterAll(async () => {
    await tester.cleanup();
  });
  
  test('should capture rotating cube scene', async () => {
    await tester.loadThreeJSScene('path/to/cube-scene.html');
    
    const screenshot = await tester.captureWebGLCanvas();
    await fs.writeFile('test-output/cube-scene.png', screenshot);
    
    const comparison = await tester.compareImages(
      'baselines/cube-scene.png',
      'test-output/cube-scene.png',
      'test-output/cube-scene-diff.png'
    );
    
    expect(comparison.percentageDiff).toBeLessThan(5);
  });
});
```

### 3.3 Visual Regression Testing実装

**Percy実装ガイド**

```javascript
// percy.config.js
module.exports = {
  version: 2,
  discovery: {
    allowedHostnames: ['localhost'],
    networkIdleTimeout: 100,
  },
  snapshot: {
    widths: [375, 768, 1280],
    minHeight: 1024,
    percyCSS: `
      /* 動的要素の非表示 */
      .loading-spinner,
      .timestamp,
      .random-element {
        visibility: hidden !important;
      }
      
      /* アニメーションの停止 */
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
      }
    `
  }
};

// percy-threejs-test.js
const PercyScript = require('@percy/script');

PercyScript.run(async (page, percySnapshot) => {
  // Three.jsアプリケーションページの読み込み
  await page.goto('http://localhost:3000/threejs-app');
  
  // WebGL コンテキストの初期化待機
  await page.waitForFunction(() => {
    const canvas = document.querySelector('canvas');
    return canvas && canvas.getContext('webgl');
  });
  
  // シーンレンダリング完了の待機
  await page.waitForFunction(() => {
    return window.sceneLoaded === true;
  });
  
  // アニメーション一時停止
  await page.evaluate(() => {
    if (window.pauseAnimation) {
      window.pauseAnimation();
    }
  });
  
  // Percy スナップショット
  await percySnapshot('Three.js Scene - Default View', {
    widths: [1280],
    minHeight: 720,
    percyCSS: `
      canvas {
        /* WebGL キャンバスの安定化 */
        image-rendering: pixelated;
      }
    `
  });
  
  // カメラ角度変更
  await page.evaluate(() => {
    if (window.setCameraAngle) {
      window.setCameraAngle(45, 30);
    }
  });
  
  await page.waitForTimeout(500); // レンダリング待機
  
  await percySnapshot('Three.js Scene - Angled View', {
    widths: [1280],
    minHeight: 720
  });
});
```

**Chromatic実装ガイド**

```javascript
// .storybook/main.js
module.exports = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-controls',
  ],
  features: {
    buildStoriesJson: true
  },
  webpackFinal: async (config) => {
    // Three.js の webpack 設定
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      use: 'raw-loader',
      exclude: /node_modules/
    });
    
    return config;
  }
};

// src/components/ThreeJSScene.stories.js
import { ThreeJSScene } from './ThreeJSScene';

export default {
  title: 'Three.js/Scene',
  component: ThreeJSScene,
  parameters: {
    chromatic: {
      delay: 1000, // レンダリング安定化待機
      pauseAnimationAtEnd: true,
    },
  },
};

export const BasicCube = {
  args: {
    geometry: 'box',
    color: '#00ff00',
    wireframe: false,
  },
};

export const WireframeSphere = {
  args: {
    geometry: 'sphere',
    color: '#ff0000',
    wireframe: true,
  },
  parameters: {
    chromatic: {
      modes: {
        desktop: { viewport: { width: 1200, height: 800 } },
        mobile: { viewport: { width: 414, height: 896 } },
      },
    },
  },
};

export const MultipleObjects = {
  args: {
    objects: [
      { geometry: 'box', position: [-2, 0, 0], color: '#ff0000' },
      { geometry: 'sphere', position: [0, 0, 0], color: '#00ff00' },
      { geometry: 'cylinder', position: [2, 0, 0], color: '#0000ff' },
    ],
  },
};

// chromatic.yml (GitHub Actions)
name: Chromatic
on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  chromatic-deployment:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Publish to Chromatic
        uses: chromaui/action@v1
        with:
          projectToken: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}
          token: ${{ secrets.GITHUB_TOKEN }}
          buildScriptName: build-storybook
          exitZeroOnChanges: true
          ignoreLastBuildOnBranch: develop
```

### 3.4 CI/CD統合の実践

**GitHub Actions統合**

```yaml
# .github/workflows/webgl-testing.yml
name: WebGL Testing Suite

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run Jest tests with Canvas mocks
        run: npm run test:unit
        env:
          CI: true
      
      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info

  visual-regression:
    runs-on: ubuntu-latest
    container:
      image: mcr.microsoft.com/playwright:v1.40.0-focal
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Setup display
        run: |
          export DISPLAY=:99
          Xvfb :99 -screen 0 1024x768x24 &
      
      - name: Run visual regression tests
        run: |
          npm run build
          npm run test:visual
        env:
          PERCY_TOKEN: ${{ secrets.PERCY_TOKEN }}
      
      - name: Upload test artifacts
        uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: visual-test-results
          path: |
            test-results/
            screenshots/

  performance-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run performance benchmarks
        run: npm run test:performance
      
      - name: Performance regression check
        run: |
          node scripts/performance-check.js \
            --baseline performance-baselines/ \
            --current performance-results/ \
            --threshold 10

  cross-browser:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        browser: [chromium, firefox, webkit]
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install Playwright browsers
        run: npx playwright install ${{ matrix.browser }}
      
      - name: Run cross-browser tests
        run: npx playwright test --project=${{ matrix.browser }}
      
      - name: Upload browser test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-results-${{ matrix.browser }}
          path: test-results/
```

**カスタム GitHub Actions**

```javascript
// scripts/webgl-test-action.js
const core = require('@actions/core');
const github = require('@actions/github');
const { execSync } = require('child_process');

async function run() {
  try {
    const testType = core.getInput('test-type');
    const browser = core.getInput('browser') || 'chromium';
    const threshold = parseFloat(core.getInput('threshold')) || 5.0;
    
    console.log(`Running ${testType} tests with ${browser}`);
    
    let command;
    switch (testType) {
      case 'visual':
        command = `npm run test:visual -- --browser=${browser}`;
        break;
      case 'performance':
        command = `npm run test:performance -- --browser=${browser}`;
        break;
      case 'integration':
        command = `npm run test:integration -- --browser=${browser}`;
        break;
      default:
        throw new Error(`Unknown test type: ${testType}`);
    }
    
    const output = execSync(command, { encoding: 'utf-8' });
    console.log(output);
    
    // 結果の解析
    const results = parseTestResults(output);
    
    if (results.failed > 0 || results.regressionPercentage > threshold) {
      core.setFailed(`Tests failed: ${results.failed} failures, ${results.regressionPercentage}% regression`);
    }
    
    // GitHub にコメント追加
    if (github.context.eventName === 'pull_request') {
      await addPRComment(results);
    }
    
  } catch (error) {
    core.setFailed(error.message);
  }
}

function parseTestResults(output) {
  // テスト結果の解析ロジック
  const failedMatch = output.match(/(\d+) failed/);
  const regressionMatch = output.match(/(\d+\.?\d*)% regression/);
  
  return {
    failed: failedMatch ? parseInt(failedMatch[1]) : 0,
    regressionPercentage: regressionMatch ? parseFloat(regressionMatch[1]) : 0,
    output: output
  };
}

async function addPRComment(results) {
  const token = core.getInput('github-token');
  const octokit = github.getOctokit(token);
  
  const comment = `
## 🎨 Visual Regression Test Results

- **Failed Tests**: ${results.failed}
- **Visual Regression**: ${results.regressionPercentage}%
- **Status**: ${results.failed > 0 ? '❌ Failed' : '✅ Passed'}

<details>
<summary>Full Test Output</summary>

\`\`\`
${results.output}
\`\`\`

</details>
  `;
  
  await octokit.rest.issues.createComment({
    ...github.context.repo,
    issue_number: github.context.payload.pull_request.number,
    body: comment
  });
}

run();
```

## 4. 高度なテスト手法と最適化

### 4.1 WebGL Testing Utilities専門実装

**gl-matrix testing詳細実装**

gl-matrixライブラリは、WebGLアプリケーションで広く使用される行列・ベクトル演算ライブラリです。数値計算の精度テストは3Dアプリケーションの信頼性を保証する上で不可欠です。

```javascript
import { mat4, vec3, quat, mat3 } from 'gl-matrix';

class MatrixPrecisionTester {
  constructor() {
    this.tolerance = {
      low: 1e-3,     // 0.1%
      medium: 1e-6,  // 0.0001%
      high: 1e-9,    // 0.0000001%
      ultra: 1e-12   // 0.000000001%
    };
  }

  // 行列乗算精度テスト
  testMatrixMultiplication() {
    const results = [];

    // 単位行列との乗算テスト
    const identity = mat4.create();
    const testMatrix = mat4.fromValues(
      2, 0, 0, 0,
      0, 3, 0, 0,
      0, 0, 4, 0,
      1, 2, 3, 1
    );
    const result = mat4.create();
    
    mat4.multiply(result, testMatrix, identity);
    
    const isEqual = this.compareMatrices(result, testMatrix, this.tolerance.medium);
    results.push({
      name: 'Identity Multiplication',
      passed: isEqual,
      expected: testMatrix,
      actual: result,
      tolerance: this.tolerance.medium
    });

    // 逆行列との乗算テスト
    const inverse = mat4.create();
    const shouldBeIdentity = mat4.create();
    
    if (mat4.invert(inverse, testMatrix)) {
      mat4.multiply(shouldBeIdentity, testMatrix, inverse);
      
      const isIdentity = this.isIdentityMatrix(shouldBeIdentity, this.tolerance.medium);
      results.push({
        name: 'Inverse Multiplication',
        passed: isIdentity,
        expected: identity,
        actual: shouldBeIdentity,
        tolerance: this.tolerance.medium
      });
    }

    return results;
  }

  // ベクトル正規化精度テスト
  testVectorNormalization() {
    const testVectors = [
      [1, 0, 0],    // 単位ベクトル
      [1, 1, 1],    // 対角ベクトル
      [0.1, 0.2, 0.3], // 小さい値
      [100, 200, 300], // 大きい値
      [Math.PI, Math.E, Math.sqrt(2)] // 無理数
    ];

    return testVectors.map((vectorData, index) => {
      const vector = vec3.fromValues(...vectorData);
      const normalized = vec3.create();
      
      vec3.normalize(normalized, vector);
      const length = vec3.length(normalized);
      
      const isUnitLength = Math.abs(length - 1.0) < this.tolerance.medium;
      
      return {
        name: `Vector Normalization Test ${index + 1}`,
        passed: isUnitLength,
        input: vectorData,
        normalized: Array.from(normalized),
        length: length,
        expectedLength: 1.0,
        tolerance: this.tolerance.medium
      };
    });
  }

  // クォータニオン精度テスト
  testQuaternionOperations() {
    const results = [];

    // 単位クォータニオンテスト
    const unitQuat = quat.create(); // [0, 0, 0, 1]
    const length = quat.length(unitQuat);
    
    results.push({
      name: 'Unit Quaternion Length',
      passed: Math.abs(length - 1.0) < this.tolerance.medium,
      expected: 1.0,
      actual: length,
      tolerance: this.tolerance.medium
    });

    // 回転合成テスト
    const q1 = quat.create();
    const q2 = quat.create();
    const combined = quat.create();
    
    // 90度Y軸回転
    quat.rotationY(q1, Math.PI / 2);
    // 90度Z軸回転
    quat.rotationZ(q2, Math.PI / 2);
    
    quat.multiply(combined, q1, q2);
    
    // 結果の長さが1であることを確認
    const combinedLength = quat.length(combined);
    results.push({
      name: 'Quaternion Multiplication Length Preservation',
      passed: Math.abs(combinedLength - 1.0) < this.tolerance.medium,
      expected: 1.0,
      actual: combinedLength,
      tolerance: this.tolerance.medium
    });

    return results;
  }

  // 数値安定性検証アルゴリズム
  testNumericalStability() {
    const results = [];

    // 大きな数と小さな数の混在テスト
    const largeValue = 1e6;
    const smallValue = 1e-6;
    
    const matrix1 = mat4.fromValues(
      largeValue, 0, 0, 0,
      0, largeValue, 0, 0,
      0, 0, largeValue, 0,
      0, 0, 0, 1
    );
    
    const matrix2 = mat4.fromValues(
      smallValue, 0, 0, 0,
      0, smallValue, 0, 0,
      0, 0, smallValue, 0,
      0, 0, 0, 1
    );

    const result = mat4.create();
    mat4.multiply(result, matrix1, matrix2);
    
    // 期待値: 対角要素が1になるはず
    const expectedDiagonal = 1.0;
    const actualDiagonal = result[0]; // result[0], result[5], result[10] should be 1
    
    results.push({
      name: 'Large-Small Number Multiplication',
      passed: Math.abs(actualDiagonal - expectedDiagonal) < this.tolerance.low,
      expected: expectedDiagonal,
      actual: actualDiagonal,
      tolerance: this.tolerance.low
    });

    // 繰り返し演算での誤差蓄積テスト
    let accumMatrix = mat4.create();
    const rotationMatrix = mat4.create();
    mat4.rotateY(rotationMatrix, rotationMatrix, 0.01); // 小さな回転

    // 628回回転（約2π * 100回転）
    for (let i = 0; i < 628; i++) {
      mat4.multiply(accumMatrix, accumMatrix, rotationMatrix);
    }

    // 元の位置に戻っているはずなので、単位行列に近いはず
    const isNearIdentity = this.isIdentityMatrix(accumMatrix, this.tolerance.low);
    
    results.push({
      name: 'Accumulated Rotation Error',
      passed: isNearIdentity,
      description: '628 small rotations should return to identity',
      finalMatrix: Array.from(accumMatrix),
      tolerance: this.tolerance.low
    });

    return results;
  }

  // 行列比較ユーティリティ
  compareMatrices(a, b, tolerance) {
    for (let i = 0; i < 16; i++) {
      if (Math.abs(a[i] - b[i]) > tolerance) {
        return false;
      }
    }
    return true;
  }

  // 単位行列判定ユーティリティ
  isIdentityMatrix(matrix, tolerance) {
    const identity = mat4.create();
    return this.compareMatrices(matrix, identity, tolerance);
  }

  // 包括的テスト実行
  runAllTests() {
    const allResults = {
      matrixMultiplication: this.testMatrixMultiplication(),
      vectorNormalization: this.testVectorNormalization(),
      quaternionOperations: this.testQuaternionOperations(),
      numericalStability: this.testNumericalStability()
    };

    const summary = this.generateTestSummary(allResults);
    return { results: allResults, summary };
  }

  generateTestSummary(results) {
    let totalTests = 0;
    let passedTests = 0;

    Object.values(results).forEach(category => {
      category.forEach(test => {
        totalTests++;
        if (test.passed) passedTests++;
      });
    });

    return {
      total: totalTests,
      passed: passedTests,
      failed: totalTests - passedTests,
      successRate: (passedTests / totalTests) * 100
    };
  }
}

// Jest テストケース例
describe('gl-matrix Precision Tests', () => {
  let tester;

  beforeEach(() => {
    tester = new MatrixPrecisionTester();
  });

  test('matrix multiplication precision', () => {
    const results = tester.testMatrixMultiplication();
    results.forEach(result => {
      expect(result.passed).toBe(true);
    });
  });

  test('vector normalization precision', () => {
    const results = tester.testVectorNormalization();
    results.forEach(result => {
      expect(result.passed).toBe(true);
    });
  });

  test('numerical stability under stress', () => {
    const results = tester.testNumericalStability();
    results.forEach(result => {
      expect(result.passed).toBe(true);
    });
  });
});
```

**WebGL mock libraries活用**

```javascript
// webgl-mock-extended.js
class ExtendedWebGLMock {
  constructor() {
    this.gl = this.createMockContext();
    this.state = {
      programs: new Map(),
      buffers: new Map(),
      textures: new Map(),
      uniforms: new Map(),
      attributes: new Map()
    };
    this.callHistory = [];
  }

  createMockContext() {
    const mockMethods = {};
    
    // WebGL constants
    const constants = {
      VERTEX_SHADER: 35633,
      FRAGMENT_SHADER: 35632,
      ARRAY_BUFFER: 34962,
      ELEMENT_ARRAY_BUFFER: 34963,
      STATIC_DRAW: 35044,
      FLOAT: 5126,
      TRIANGLES: 4,
      COLOR_BUFFER_BIT: 16384,
      DEPTH_BUFFER_BIT: 256
    };

    // 基本メソッドのモック
    const basicMethods = {
      createShader: jest.fn((type) => {
        const shader = { type, source: '', compiled: false };
        this.recordCall('createShader', [type]);
        return shader;
      }),

      shaderSource: jest.fn((shader, source) => {
        shader.source = source;
        this.recordCall('shaderSource', [shader, source]);
      }),

      compileShader: jest.fn((shader) => {
        shader.compiled = true;
        this.recordCall('compileShader', [shader]);
      }),

      getShaderParameter: jest.fn((shader, pname) => {
        this.recordCall('getShaderParameter', [shader, pname]);
        if (pname === this.gl.COMPILE_STATUS) {
          return shader.compiled;
        }
        return true;
      }),

      createProgram: jest.fn(() => {
        const program = { 
          id: Math.random().toString(36),
          shaders: [],
          linked: false,
          uniforms: new Map(),
          attributes: new Map()
        };
        this.state.programs.set(program.id, program);
        this.recordCall('createProgram', []);
        return program;
      }),

      attachShader: jest.fn((program, shader) => {
        program.shaders.push(shader);
        this.recordCall('attachShader', [program, shader]);
      }),

      linkProgram: jest.fn((program) => {
        program.linked = true;
        this.recordCall('linkProgram', [program]);
      }),

      useProgram: jest.fn((program) => {
        this.state.currentProgram = program;
        this.recordCall('useProgram', [program]);
      }),

      createBuffer: jest.fn(() => {
        const buffer = {
          id: Math.random().toString(36),
          data: null,
          target: null,
          usage: null
        };
        this.state.buffers.set(buffer.id, buffer);
        this.recordCall('createBuffer', []);
        return buffer;
      }),

      bindBuffer: jest.fn((target, buffer) => {
        if (buffer) {
          buffer.target = target;
          this.state.currentBuffer = buffer;
        }
        this.recordCall('bindBuffer', [target, buffer]);
      }),

      bufferData: jest.fn((target, data, usage) => {
        if (this.state.currentBuffer) {
          this.state.currentBuffer.data = data;
          this.state.currentBuffer.usage = usage;
        }
        this.recordCall('bufferData', [target, data, usage]);
      }),

      getUniformLocation: jest.fn((program, name) => {
        const location = { program, name, id: Math.random().toString(36) };
        program.uniforms.set(name, location);
        this.recordCall('getUniformLocation', [program, name]);
        return location;
      }),

      uniform1f: jest.fn((location, value) => {
        this.state.uniforms.set(location.id, { type: 'float', value });
        this.recordCall('uniform1f', [location, value]);
      }),

      uniformMatrix4fv: jest.fn((location, transpose, value) => {
        this.state.uniforms.set(location.id, { type: 'mat4', value, transpose });
        this.recordCall('uniformMatrix4fv', [location, transpose, value]);
      }),

      // レンダリングメソッド
      viewport: jest.fn((x, y, width, height) => {
        this.state.viewport = { x, y, width, height };
        this.recordCall('viewport', [x, y, width, height]);
      }),

      clear: jest.fn((mask) => {
        this.recordCall('clear', [mask]);
      }),

      clearColor: jest.fn((r, g, b, a) => {
        this.state.clearColor = { r, g, b, a };
        this.recordCall('clearColor', [r, g, b, a]);
      }),

      drawArrays: jest.fn((mode, first, count) => {
        this.recordCall('drawArrays', [mode, first, count]);
      }),

      drawElements: jest.fn((mode, count, type, offset) => {
        this.recordCall('drawElements', [mode, count, type, offset]);
      })
    };

    return { ...constants, ...basicMethods };
  }

  recordCall(methodName, args) {
    this.callHistory.push({
      method: methodName,
      args: args,
      timestamp: Date.now()
    });
  }

  // テスト用ユーティリティメソッド
  getCallHistory(methodName) {
    if (methodName) {
      return this.callHistory.filter(call => call.method === methodName);
    }
    return this.callHistory;
  }

  expectMethodCalled(methodName, times = null) {
    const calls = this.getCallHistory(methodName);
    if (times !== null) {
      expect(calls).toHaveLength(times);
    } else {
      expect(calls.length).toBeGreaterThan(0);
    }
  }

  expectUniformSet(uniformName, expectedValue) {
    const program = this.state.currentProgram;
    expect(program).toBeDefined();
    
    const uniformLocation = program.uniforms.get(uniformName);
    expect(uniformLocation).toBeDefined();
    
    const uniformValue = this.state.uniforms.get(uniformLocation.id);
    expect(uniformValue.value).toEqual(expectedValue);
  }

  reset() {
    this.callHistory = [];
    this.state = {
      programs: new Map(),
      buffers: new Map(),
      textures: new Map(),
      uniforms: new Map(),
      attributes: new Map()
    };
  }
}

// Three.js シェーダーテスト例
describe('Three.js Shader Testing with WebGL Mock', () => {
  let mockWebGL;
  let mockCanvas;

  beforeEach(() => {
    mockWebGL = new ExtendedWebGLMock();
    mockCanvas = {
      getContext: jest.fn(() => mockWebGL.gl),
      width: 512,
      height: 512
    };
    
    // グローバル設定
    global.HTMLCanvasElement = jest.fn(() => mockCanvas);
    global.WebGLRenderingContext = jest.fn(() => mockWebGL.gl);
  });

  afterEach(() => {
    mockWebGL.reset();
  });

  test('should compile vertex and fragment shaders', () => {
    const gl = mockWebGL.gl;
    
    // シェーダーソース
    const vertexSource = `
      attribute vec3 position;
      uniform mat4 modelViewMatrix;
      uniform mat4 projectionMatrix;
      void main() {
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;
    
    const fragmentSource = `
      precision mediump float;
      uniform vec3 color;
      void main() {
        gl_FragColor = vec4(color, 1.0);
      }
    `;

    // シェーダーコンパイル
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexSource);
    gl.compileShader(vertexShader);

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentSource);
    gl.compileShader(fragmentShader);

    // プログラム作成
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    // 検証
    mockWebGL.expectMethodCalled('createShader', 2);
    mockWebGL.expectMethodCalled('compileShader', 2);
    mockWebGL.expectMethodCalled('createProgram', 1);
    mockWebGL.expectMethodCalled('linkProgram', 1);

    expect(gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)).toBe(true);
    expect(gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)).toBe(true);
  });

  test('should set uniforms correctly', () => {
    const gl = mockWebGL.gl;
    
    // プログラム作成（簡略化）
    const program = gl.createProgram();
    gl.useProgram(program);

    // ユニフォーム設定
    const colorLocation = gl.getUniformLocation(program, 'color');
    const matrixLocation = gl.getUniformLocation(program, 'modelViewMatrix');

    const testColor = [1.0, 0.5, 0.0];
    const testMatrix = new Float32Array([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ]);

    gl.uniform3fv(colorLocation, testColor);
    gl.uniformMatrix4fv(matrixLocation, false, testMatrix);

    // 検証
    mockWebGL.expectUniformSet('color', testColor);
    mockWebGL.expectUniformSet('modelViewMatrix', testMatrix);
  });
});
```

### 4.2 パフォーマンステストとベンチマーク

**レンダリング性能テスト**

```javascript
// performance-tester.js
class WebGLPerformanceTester {
  constructor(canvas) {
    this.canvas = canvas;
    this.gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    this.stats = {
      frameCount: 0,
      startTime: 0,
      lastFrameTime: 0,
      frameTimes: [],
      drawCalls: 0,
      gpuTime: 0
    };
    
    this.setupExtensions();
  }

  setupExtensions() {
    // タイマー拡張の設定
    this.timerExt = this.gl.getExtension('EXT_disjoint_timer_query_webgl2') ||
                    this.gl.getExtension('EXT_disjoint_timer_query');
    
    // GPU情報取得拡張
    this.debugInfo = this.gl.getExtension('WEBGL_debug_renderer_info');
    
    // インスタンシング拡張
    this.instancedExt = this.gl.getExtension('ANGLE_instanced_arrays');
  }

  // FPS測定
  startFPSMeasurement() {
    this.stats.frameCount = 0;
    this.stats.startTime = performance.now();
    this.stats.frameTimes = [];
  }

  recordFrame() {
    const currentTime = performance.now();
    
    if (this.stats.lastFrameTime > 0) {
      const frameTime = currentTime - this.stats.lastFrameTime;
      this.stats.frameTimes.push(frameTime);
    }
    
    this.stats.frameCount++;
    this.stats.lastFrameTime = currentTime;
  }

  getFPSStatistics() {
    const totalTime = this.stats.lastFrameTime - this.stats.startTime;
    const averageFPS = (this.stats.frameCount / totalTime) * 1000;
    
    const frameTimes = this.stats.frameTimes;
    frameTimes.sort((a, b) => a - b);
    
    return {
      averageFPS: averageFPS,
      frameCount: this.stats.frameCount,
      totalTimeMs: totalTime,
      averageFrameTimeMs: frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length,
      medianFrameTimeMs: frameTimes[Math.floor(frameTimes.length / 2)],
      p95FrameTimeMs: frameTimes[Math.floor(frameTimes.length * 0.95)],
      p99FrameTimeMs: frameTimes[Math.floor(frameTimes.length * 0.99)],
      minFrameTimeMs: Math.min(...frameTimes),
      maxFrameTimeMs: Math.max(...frameTimes)
    };
  }

  // GPU性能ベンチマーク
  async benchmarkTriangleThroughput(triangleCount) {
    const startTime = performance.now();
    
    // 大量の三角形データ生成
    const vertices = new Float32Array(triangleCount * 9);
    for (let i = 0; i < vertices.length; i += 9) {
      vertices[i] = Math.random() * 2 - 1;
      vertices[i + 1] = Math.random() * 2 - 1;
      vertices[i + 2] = 0;
      vertices[i + 3] = Math.random() * 2 - 1;
      vertices[i + 4] = Math.random() * 2 - 1;
      vertices[i + 5] = 0;
      vertices[i + 6] = Math.random() * 2 - 1;
      vertices[i + 7] = Math.random() * 2 - 1;
      vertices[i + 8] = 0;
    }

    const buffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);

    const program = this.createBasicShaderProgram();
    this.gl.useProgram(program);

    const positionLocation = this.gl.getAttribLocation(program, 'position');
    this.gl.enableVertexAttribArray(positionLocation);
    this.gl.vertexAttribPointer(positionLocation, 3, this.gl.FLOAT, false, 0, 0);

    const renderStartTime = performance.now();
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    this.gl.drawArrays(this.gl.TRIANGLES, 0, triangleCount * 3);
    this.gl.finish();
    const renderEndTime = performance.now();

    this.gl.deleteBuffer(buffer);
    this.gl.deleteProgram(program);

    return {
      triangleCount: triangleCount,
      setupTimeMs: renderStartTime - startTime,
      renderTimeMs: renderEndTime - renderStartTime,
      trianglesPerSecond: (triangleCount / (renderEndTime - renderStartTime)) * 1000
    };
  }

  createBasicShaderProgram() {
    const vertexShader = `
      attribute vec3 position;
      void main() {
        gl_Position = vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      precision mediump float;
      void main() {
        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
      }
    `;

    return this.compileShaderProgram(vertexShader, fragmentShader);
  }

  compileShaderProgram(vertexSource, fragmentSource) {
    const vertexShader = this.compileShader(this.gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = this.compileShader(this.gl.FRAGMENT_SHADER, fragmentSource);

    const program = this.gl.createProgram();
    this.gl.attachShader(program, vertexShader);
    this.gl.attachShader(program, fragmentShader);
    this.gl.linkProgram(program);

    this.gl.deleteShader(vertexShader);
    this.gl.deleteShader(fragmentShader);

    return program;
  }

  compileShader(type, source) {
    const shader = this.gl.createShader(type);
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    return shader;
  }
}

// Three.js特化パフォーマンステスト
class ThreeJSPerformanceTester {
  constructor() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    this.renderer = null;
  }

  setup(canvas) {
    this.renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: false,
      powerPreference: 'high-performance'
    });
    
    this.renderer.setSize(canvas.width, canvas.height);
    this.camera.aspect = canvas.width / canvas.height;
    this.camera.updateProjectionMatrix();
  }

  async testObjectCount(maxObjects, stepSize = 100) {
    const results = [];
    
    for (let objectCount = stepSize; objectCount <= maxObjects; objectCount += stepSize) {
      const result = await this.measureScenePerformance(objectCount);
      results.push({ objectCount, ...result });
      this.clearScene();
    }
    
    return results;
  }

  async measureScenePerformance(objectCount) {
    this.populateScene(objectCount);
    
    // ウォームアップ
    for (let i = 0; i < 10; i++) {
      this.renderer.render(this.scene, this.camera);
    }
    
    const frameCount = 60;
    const startTime = performance.now();
    
    for (let i = 0; i < frameCount; i++) {
      this.renderer.render(this.scene, this.camera);
    }
    
    this.renderer.getContext().finish();
    const endTime = performance.now();

    const renderInfo = this.renderer.info;
    
    return {
      fps: (frameCount / (endTime - startTime)) * 1000,
      averageFrameTimeMs: (endTime - startTime) / frameCount,
      drawCalls: renderInfo.render.calls,
      triangles: renderInfo.render.triangles
    };
  }

  populateScene(objectCount) {
    const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    
    for (let i = 0; i < objectCount; i++) {
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10
      );
      this.scene.add(mesh);
    }
  }

  clearScene() {
    while (this.scene.children.length > 0) {
      const object = this.scene.children[0];
      this.scene.remove(object);
      if (object.geometry) object.geometry.dispose();
      if (object.material) object.material.dispose();
    }
  }
}
```

### 4.3 メモリ・リソース管理の高度な手法

**WebGLリソースリーク高度検出**

```javascript
// advanced-resource-tracker.js
class AdvancedWebGLResourceTracker {
  constructor(gl) {
    this.gl = gl;
    this.resources = new Map();
    this.allocationHistory = [];
    this.memoryPressureCallbacks = [];
    this.leakDetectionThreshold = 100;
    
    this.wrapWebGLMethods();
    this.setupMemoryMonitoring();
  }

  wrapWebGLMethods() {
    this.wrapResourceMethods('Texture', ['createTexture', 'deleteTexture'], {
      estimateSize: (texture) => this.estimateTextureSize(texture)
    });

    this.wrapResourceMethods('Buffer', ['createBuffer', 'deleteBuffer'], {
      estimateSize: (buffer) => this.estimateBufferSize(buffer)
    });
  }

  wrapResourceMethods(resourceType, methods, options) {
    const createMethod = methods[0];
    const deleteMethod = methods[1];
    
    const originalCreate = this.gl[createMethod];
    this.gl[createMethod] = (...args) => {
      const resource = originalCreate.apply(this.gl, args);
      if (resource) {
        this.trackResource(resourceType, resource, options);
      }
      return resource;
    };

    const originalDelete = this.gl[deleteMethod];
    this.gl[deleteMethod] = (resource) => {
      this.untrackResource(resource);
      return originalDelete.call(this.gl, resource);
    };
  }

  trackResource(type, resource, options) {
    const resourceInfo = {
      id: Math.random().toString(36),
      type: type,
      resource: resource,
      createdAt: Date.now(),
      creationStack: new Error().stack,
      estimatedSize: options.estimateSize ? options.estimateSize(resource) : 0
    };

    this.resources.set(resource, resourceInfo);
    this.allocationHistory.push({
      action: 'create',
      type: type,
      id: resourceInfo.id,
      timestamp: Date.now()
    });

    this.checkMemoryPressure();
  }

  untrackResource(resource) {
    const resourceInfo = this.resources.get(resource);
    if (resourceInfo) {
      this.allocationHistory.push({
        action: 'delete',
        type: resourceInfo.type,
        id: resourceInfo.id,
        timestamp: Date.now(),
        lifetime: Date.now() - resourceInfo.createdAt
      });
      this.resources.delete(resource);
    }
  }

  detectLeaks() {
    const leaks = [];
    const now = Date.now();

    for (const [resource, info] of this.resources) {
      const age = now - info.createdAt;
      if (age > 60000) { // 1分以上残存
        leaks.push({
          type: 'long_lived',
          resource: info,
          age: age,
          severity: age > 300000 ? 'high' : 'medium'
        });
      }
    }

    return leaks;
  }

  getDetailedMemoryAnalysis() {
    const analysis = {
      byType: new Map(),
      totalEstimatedMemory: 0,
      resourceCount: this.resources.size
    };

    for (const [resource, info] of this.resources) {
      if (!analysis.byType.has(info.type)) {
        analysis.byType.set(info.type, { count: 0, totalSize: 0 });
      }

      const typeInfo = analysis.byType.get(info.type);
      typeInfo.count++;
      typeInfo.totalSize += info.estimatedSize;
      analysis.totalEstimatedMemory += info.estimatedSize;
    }

    return analysis;
  }

  setupMemoryMonitoring() {
    this.monitoringInterval = setInterval(() => {
      const leaks = this.detectLeaks();
      if (leaks.length > 0) {
        this.notifyMemoryPressure('leaks_detected', { leaks });
      }
    }, 5000);
  }

  notifyMemoryPressure(type, data) {
    this.memoryPressureCallbacks.forEach(callback => {
      try {
        callback({ type, timestamp: Date.now(), data });
      } catch (error) {
        console.error('Memory pressure callback error:', error);
      }
    });
  }

  onMemoryPressure(callback) {
    this.memoryPressureCallbacks.push(callback);
  }

  checkMemoryPressure() {
    if (this.resources.size > this.leakDetectionThreshold * 0.8) {
      this.notifyMemoryPressure('approaching_limit', {
        currentCount: this.resources.size,
        threshold: this.leakDetectionThreshold
      });
    }
  }

  estimateTextureSize(texture) {
    return 1024 * 1024; // デフォルト1MB
  }

  estimateBufferSize(buffer) {
    return 65536; // デフォルト64KB
  }

  dispose() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
  }
}
```

### 4.4 高度なクロスプラットフォーム対応

**プラットフォーム固有最適化テスト**

```javascript
// platform-optimizer.js
class PlatformSpecificOptimizer {
  constructor(gl) {
    this.gl = gl;
    this.platformInfo = this.detectPlatform();
    this.optimizations = this.generateOptimizations();
  }

  detectPlatform() {
    const renderer = this.gl.getParameter(this.gl.RENDERER);
    const vendor = this.gl.getParameter(this.gl.VENDOR);
    const userAgent = navigator.userAgent;

    return {
      renderer: renderer,
      vendor: vendor,
      isANGLE: renderer.includes('ANGLE'),
      isMetal: renderer.includes('Metal'),
      isMesa: vendor.includes('Mesa'),
      isMobile: /Android|iPhone|iPad|iPod/i.test(userAgent),
      isIOS: /iPad|iPhone|iPod/.test(userAgent),
      isAndroid: /Android/.test(userAgent)
    };
  }

  generateOptimizations() {
    const opts = {
      textureSettings: {},
      shaderSettings: {},
      renderingSettings: {}
    };

    if (this.platformInfo.isANGLE) {
      opts.textureSettings = {
        maxTextureSize: 4096,
        avoidFloatTextures: true
      };
      opts.shaderSettings = {
        precision: 'medium'
      };
    }

    if (this.platformInfo.isMetal) {
      opts.textureSettings = {
        supportsFloatTextures: true
      };
      opts.shaderSettings = {
        precision: 'high'
      };
    }

    if (this.platformInfo.isMobile) {
      opts.textureSettings = {
        maxTextureSize: 1024,
        useCompression: true
      };
      opts.shaderSettings = {
        precision: 'low'
      };
      opts.renderingSettings = {
        powerPreference: 'low-power'
      };
    }

    return opts;
  }

  runPlatformTests() {
    return {
      platform: this.platformInfo,
      optimizations: this.optimizations,
      testResults: [
        this.testBasicFeatures(),
        this.testExtensions(),
        this.testPlatformLimitations()
      ]
    };
  }

  testBasicFeatures() {
    return {
      maxTextureSize: this.gl.getParameter(this.gl.MAX_TEXTURE_SIZE),
      maxViewportDims: this.gl.getParameter(this.gl.MAX_VIEWPORT_DIMS),
      maxVertexAttribs: this.gl.getParameter(this.gl.MAX_VERTEX_ATTRIBS)
    };
  }

  testExtensions() {
    const extensions = [
      'OES_vertex_array_object',
      'WEBGL_depth_texture',
      'OES_texture_float'
    ];

    return extensions.map(ext => ({
      name: ext,
      supported: this.gl.getExtension(ext) !== null
    }));
  }

  testPlatformLimitations() {
    return {
      contextLossHandling: this.testContextLoss(),
      memoryConstraints: this.testMemoryLimits()
    };
  }

  testContextLoss() {
    const loseExtension = this.gl.getExtension('WEBGL_lose_context');
    return {
      supported: loseExtension !== null,
      canRecover: true
    };
  }

  testMemoryLimits() {
    return {
      estimatedGPUMemory: this.estimateGPUMemory(),
      recommendedTextureSize: this.getRecommendedTextureSize()
    };
  }

  estimateGPUMemory() {
    const renderer = this.platformInfo.renderer;
    if (renderer.includes('RTX 4090')) return '24GB';
    if (renderer.includes('RTX 3080')) return '10GB';
    if (renderer.includes('Apple M1')) return '8GB';
    return 'Unknown';
  }

  getRecommendedTextureSize() {
    if (this.platformInfo.isMobile) return 1024;
    if (this.platformInfo.isANGLE) return 4096;
    return 8192;
  }
}

// Jest テストケース
describe('Advanced WebGL Testing', () => {
  let canvas, gl, performanceTester, resourceTracker;
  
  beforeEach(() => {
    canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    gl = canvas.getContext('webgl');
    
    performanceTester = new WebGLPerformanceTester(canvas);
    resourceTracker = new AdvancedWebGLResourceTracker(gl);
  });
  
  afterEach(() => {
    resourceTracker.dispose();
  });
  
  test('performance benchmark should meet minimum standards', async () => {
    const result = await performanceTester.benchmarkTriangleThroughput(1000);
    expect(result.trianglesPerSecond).toBeGreaterThan(10000);
  });
  
  test('should detect resource leaks', () => {
    // リークを発生させる
    for (let i = 0; i < 50; i++) {
      gl.createTexture();
    }
    
    const leaks = resourceTracker.detectLeaks();
    const analysis = resourceTracker.getDetailedMemoryAnalysis();
    
    expect(analysis.resourceCount).toBe(50);
  });
  
  test('platform optimizer should provide appropriate settings', () => {
    const optimizer = new PlatformSpecificOptimizer(gl);
    const results = optimizer.runPlatformTests();
    
    expect(results.platform).toBeDefined();
    expect(results.optimizations).toBeDefined();
    expect(results.testResults).toHaveLength(3);
  });
});
```

## 5. 将来技術と実装戦略

### 5.1 WebGPU移行準備と戦略

**WebGPU対応Three.js実装**

WebGPUは次世代のWeb graphics APIとして、WebGLに代わる新しい標準となることが予想されます。Three.jsプロジェクトは過去14年間で進化し、WebGPUを活用した最適化された3Dパフォーマンスに焦点を当てています。

```javascript
// webgpu-migration-helper.js
class WebGPUMigrationHelper {
  constructor() {
    this.capabilities = {
      webgpu: false,
      webgl2: false,
      webgl: false
    };
    
    this.detectCapabilities();
  }

  async detectCapabilities() {
    // WebGPU サポート検出
    if (navigator.gpu) {
      try {
        const adapter = await navigator.gpu.requestAdapter();
        this.capabilities.webgpu = !!adapter;
      } catch (error) {
        console.warn('WebGPU detection failed:', error);
      }
    }

    // WebGL サポート検出
    const canvas = document.createElement('canvas');
    this.capabilities.webgl2 = !!canvas.getContext('webgl2');
    this.capabilities.webgl = !!canvas.getContext('webgl');
  }

  async createOptimalRenderer(canvas, options = {}) {
    await this.detectCapabilities();

    if (this.capabilities.webgpu && options.preferWebGPU !== false) {
      return this.createWebGPURenderer(canvas, options);
    } else if (this.capabilities.webgl2) {
      return this.createWebGL2Renderer(canvas, options);
    } else if (this.capabilities.webgl) {
      return this.createWebGLRenderer(canvas, options);
    } else {
      throw new Error('No supported graphics API found');
    }
  }

  async createWebGPURenderer(canvas, options) {
    const adapter = await navigator.gpu.requestAdapter({
      powerPreference: options.powerPreference || 'high-performance'
    });

    if (!adapter) {
      throw new Error('WebGPU adapter not available');
    }

    const device = await adapter.requestDevice({
      requiredFeatures: options.requiredFeatures || [],
      requiredLimits: options.requiredLimits || {}
    });

    // Three.js WebGPU Renderer (experimental)
    const renderer = new THREE.WebGPURenderer({
      canvas: canvas,
      device: device,
      antialias: options.antialias || false,
      alpha: options.alpha || false
    });

    return {
      renderer: renderer,
      type: 'webgpu',
      device: device,
      adapter: adapter,
      capabilities: {
        computeShaders: true,
        textureCompression: true,
        timestampQueries: adapter.features.has('timestamp-query'),
        multiDrawIndirect: adapter.features.has('multi-draw-indirect')
      }
    };
  }

  createWebGL2Renderer(canvas, options) {
    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      context: canvas.getContext('webgl2', {
        antialias: options.antialias || false,
        alpha: options.alpha || false,
        powerPreference: options.powerPreference || 'high-performance'
      })
    });

    return {
      renderer: renderer,
      type: 'webgl2',
      capabilities: {
        instancing: true,
        multipleRenderTargets: true,
        textureArrays: true,
        uniformBuffers: true
      }
    };
  }

  createWebGLRenderer(canvas, options) {
    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: options.antialias || false,
      alpha: options.alpha || false,
      powerPreference: options.powerPreference || 'default'
    });

    return {
      renderer: renderer,
      type: 'webgl',
      capabilities: {
        instancing: !!renderer.extensions.get('ANGLE_instanced_arrays'),
        floatTextures: !!renderer.extensions.get('OES_texture_float')
      }
    };
  }

  // WebGPU vs WebGL パフォーマンス比較
  async benchmarkRenderers(scene, camera, iterations = 100) {
    const results = {};

    // WebGPU ベンチマーク
    if (this.capabilities.webgpu) {
      try {
        const webgpuRenderer = await this.createWebGPURenderer(document.createElement('canvas'));
        results.webgpu = await this.runBenchmark(webgpuRenderer.renderer, scene, camera, iterations);
      } catch (error) {
        console.warn('WebGPU benchmark failed:', error);
      }
    }

    // WebGL2 ベンチマーク
    if (this.capabilities.webgl2) {
      const webgl2Renderer = this.createWebGL2Renderer(document.createElement('canvas'));
      results.webgl2 = await this.runBenchmark(webgl2Renderer.renderer, scene, camera, iterations);
    }

    // WebGL ベンチマーク
    if (this.capabilities.webgl) {
      const webglRenderer = this.createWebGLRenderer(document.createElement('canvas'));
      results.webgl = await this.runBenchmark(webglRenderer.renderer, scene, camera, iterations);
    }

    return results;
  }

  async runBenchmark(renderer, scene, camera, iterations) {
    renderer.setSize(512, 512);
    
    // ウォームアップ
    for (let i = 0; i < 10; i++) {
      renderer.render(scene, camera);
    }

    const startTime = performance.now();
    
    for (let i = 0; i < iterations; i++) {
      renderer.render(scene, camera);
    }

    const context = renderer.getContext();
    if (context.finish) context.finish();
    
    const endTime = performance.now();
    const averageFrameTime = (endTime - startTime) / iterations;

    return {
      averageFrameTimeMs: averageFrameTime,
      estimatedFPS: 1000 / averageFrameTime,
      totalTimeMs: endTime - startTime
    };
  }
}

// TSL (Three Shader Language) 対応例
class TSLShaderManager {
  constructor() {
    this.shaderCache = new Map();
  }

  createTSLMaterial(config) {
    const cacheKey = JSON.stringify(config);
    
    if (this.shaderCache.has(cacheKey)) {
      return this.shaderCache.get(cacheKey);
    }

    const material = new THREE.NodeMaterial();
    
    // TSL を使用したノードベースマテリアル
    const { positionLocal, normalLocal, uniform, vec3, mix, smoothstep } = THREE;
    
    // カスタム色計算
    const baseColor = uniform(new THREE.Color(config.baseColor || 0xffffff));
    const emissionColor = uniform(new THREE.Color(config.emissionColor || 0x000000));
    const roughness = uniform(config.roughness || 0.5);
    
    // 時間ベースのアニメーション
    const time = uniform(0);
    const animatedPosition = positionLocal.add(
      normalLocal.mul(
        smoothstep(0, 1, time.sin()).mul(config.animationStrength || 0.1)
      )
    );

    // マテリアル設定
    material.positionNode = animatedPosition;
    material.colorNode = mix(baseColor, emissionColor, time.sin().mul(0.5).add(0.5));
    material.roughnessNode = roughness;

    this.shaderCache.set(cacheKey, material);
    return material;
  }

  updateAnimationTime(deltaTime) {
    // 全ての TSL マテリアルの時間を更新
    for (const material of this.shaderCache.values()) {
      if (material.uniforms && material.uniforms.time) {
        material.uniforms.time.value += deltaTime;
      }
    }
  }
}

**TSL高度テスト実装**

```javascript
// TSL シェーダーテスト専用フレームワーク
class TSLShaderTester {
  constructor() {
    this.testResults = [];
    this.compilationCache = new Map();
  }

  // TSL ノード機能テスト
  async testTSLNodeFunctionality() {
    const tests = [
      this.testBasicNodes(),
      this.testMathOperations(),
      this.testTextureNodes(),
      this.testComputeShaders(),
      this.testCustomFunctions()
    ];

    const results = await Promise.all(tests);
    return {
      nodeTests: results,
      overallSuccess: results.every(test => test.passed),
      summary: this.generateTestSummary(results)
    };
  }

  testBasicNodes() {
    try {
      // 基本ノードのテスト
      const { positionLocal, normalLocal, uv, time } = THREE;
      
      const testNodes = {
        position: positionLocal,
        normal: normalLocal,
        texCoord: uv(),
        timeValue: time
      };

      // ノードの正常性確認
      Object.entries(testNodes).forEach(([name, node]) => {
        if (!node || typeof node.build !== 'function') {
          throw new Error(`Node ${name} is invalid or missing build method`);
        }
      });

      return {
        name: 'Basic TSL Nodes',
        passed: true,
        details: `Tested ${Object.keys(testNodes).length} basic nodes`,
        nodes: Object.keys(testNodes)
      };
    } catch (error) {
      return {
        name: 'Basic TSL Nodes',
        passed: false,
        error: error.message
      };
    }
  }

  testMathOperations() {
    try {
      const { float, vec3, add, mul, sin, cos, normalize } = THREE;
      
      // 数学演算ノードテスト
      const a = float(1.0);
      const b = vec3(1, 0, 0);
      
      const mathTests = {
        addition: add(a, float(2.0)),
        multiplication: mul(a, float(3.0)),
        trigonometry: sin(a),
        vectorOps: normalize(b),
        complexExpression: mul(sin(a), cos(a))
      };

      // 各演算の妥当性確認
      Object.entries(mathTests).forEach(([name, operation]) => {
        if (!operation || typeof operation.build !== 'function') {
          throw new Error(`Math operation ${name} failed to create valid node`);
        }
      });

      return {
        name: 'TSL Math Operations',
        passed: true,
        details: `Tested ${Object.keys(mathTests).length} math operations`,
        operations: Object.keys(mathTests)
      };
    } catch (error) {
      return {
        name: 'TSL Math Operations',
        passed: false,
        error: error.message
      };
    }
  }

  testComputeShaders() {
    try {
      const { storage, float, vec3, instanceIndex } = THREE;
      
      // ストレージバッファとコンピュートシェーダーのテスト
      const positionBuffer = storage(new THREE.StorageBufferAttribute(1000, 3), 'vec3', 1000);
      const velocityBuffer = storage(new THREE.StorageBufferAttribute(1000, 3), 'vec3', 1000);
      
      // 基本的なパーティクルアップデート関数
      const computeFunction = Fn(() => {
        const index = instanceIndex;
        const position = positionBuffer.element(index);
        const velocity = velocityBuffer.element(index);
        
        // 位置更新
        const newPosition = position.add(velocity.mul(0.016)); // 60fps仮定
        positionBuffer.element(index).assign(newPosition);
      });

      return {
        name: 'TSL Compute Shaders',
        passed: true,
        details: 'Compute shader creation successful',
        features: ['Storage Buffers', 'Instance Indexing', 'Buffer Updates']
      };
    } catch (error) {
      return {
        name: 'TSL Compute Shaders',
        passed: false,
        error: error.message
      };
    }
  }

  generateTestSummary(results) {
    const totalTests = results.length;
    const passedTests = results.filter(test => test.passed).length;
    
    return {
      total: totalTests,
      passed: passedTests,
      failed: totalTests - passedTests,
      successRate: (passedTests / totalTests) * 100
    };
  }
}
```

### 5.2 AI駆動テスト技術の実装

**機械学習ベースの視覚回帰テスト**

2025年以降、AI支援テストとして視覚QA回帰テスト用ML基盤画像比較やパフォーマンス予測用AIモデルの活用が注目されています。

```javascript
// AI駆動視覚テスト実装
class AIVisualTester {
  constructor() {
    this.modelCache = new Map();
    this.trainingData = [];
    this.anomalyThreshold = 0.85;
  }

  // 視覚的異常検出AI
  async initializeAnomalyDetectionModel() {
    if (this.modelCache.has('anomaly_detector')) {
      return this.modelCache.get('anomaly_detector');
    }

    // TensorFlow.js を使用したオートエンコーダーモデル
    const model = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [256 * 256 * 3], units: 512, activation: 'relu' }),
        tf.layers.dense({ units: 256, activation: 'relu' }),
        tf.layers.dense({ units: 64, activation: 'relu' }),
        tf.layers.dense({ units: 256, activation: 'relu' }),
        tf.layers.dense({ units: 512, activation: 'relu' }),
        tf.layers.dense({ units: 256 * 256 * 3, activation: 'sigmoid' })
      ]
    });

    model.compile({
      optimizer: 'adam',
      loss: 'meanSquaredError'
    });

    this.modelCache.set('anomaly_detector', model);
    return model;
  }

  // レンダリング結果の異常検出
  async detectRenderingAnomalies(imageData) {
    const model = await this.initializeAnomalyDetectionModel();
    
    // 画像前処理
    const preprocessed = this.preprocessImageForModel(imageData);
    
    // 予測実行
    const reconstruction = model.predict(preprocessed);
    
    // 再構成誤差計算
    const reconstructionError = tf.losses.meanSquaredError(preprocessed, reconstruction);
    const errorValue = await reconstructionError.data();
    
    const isAnomaly = errorValue[0] > this.anomalyThreshold;
    
    return {
      isAnomaly: isAnomaly,
      confidence: Math.min(errorValue[0] / this.anomalyThreshold, 1.0),
      reconstructionError: errorValue[0],
      analysis: this.analyzeAnomalyType(preprocessed, reconstruction)
    };
  }

  preprocessImageForModel(imageData) {
    // Canvas ImageData を TensorFlow.js テンソルに変換
    const tensor = tf.browser.fromPixels(imageData)
      .resizeNearestNeighbor([256, 256])
      .div(255.0)
      .expandDims(0)
      .reshape([1, 256 * 256 * 3]);
    
    return tensor;
  }

  analyzeAnomalyType(original, reconstruction) {
    // 異常の種類を分析
    const diff = tf.sub(original, reconstruction);
    const absDiff = tf.abs(diff);
    
    // 色チャンネル別の誤差分析
    const reshapedDiff = absDiff.reshape([256, 256, 3]);
    const channelErrors = tf.split(reshapedDiff, 3, 2);
    
    const analysis = {
      redChannelError: tf.mean(channelErrors[0]).dataSync()[0],
      greenChannelError: tf.mean(channelErrors[1]).dataSync()[0],
      blueChannelError: tf.mean(channelErrors[2]).dataSync()[0]
    };

    // エラータイプの推定
    if (analysis.redChannelError > analysis.greenChannelError && 
        analysis.redChannelError > analysis.blueChannelError) {
      analysis.primaryErrorType = 'red_channel_anomaly';
    } else if (analysis.greenChannelError > analysis.blueChannelError) {
      analysis.primaryErrorType = 'green_channel_anomaly';
    } else {
      analysis.primaryErrorType = 'blue_channel_anomaly';
    }

    return analysis;
  }

  // パフォーマンス予測AI
  async initializePerformancePredictionModel() {
    if (this.modelCache.has('performance_predictor')) {
      return this.modelCache.get('performance_predictor');
    }

    const model = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [10], units: 64, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 32, activation: 'relu' }),
        tf.layers.dense({ units: 16, activation: 'relu' }),
        tf.layers.dense({ units: 1, activation: 'linear' })
      ]
    });

    model.compile({
      optimizer: 'adam',
      loss: 'meanSquaredError',
      metrics: ['mae']
    });

    this.modelCache.set('performance_predictor', model);
    return model;
  }

  // シーン複雑度からパフォーマンス予測
  async predictPerformance(sceneMetrics) {
    const model = await this.initializePerformancePredictionModel();
    
    // シーンメトリクスを特徴量に変換
    const features = this.extractPerformanceFeatures(sceneMetrics);
    const inputTensor = tf.tensor2d([features]);
    
    const prediction = model.predict(inputTensor);
    const predictedFPS = await prediction.data();
    
    return {
      predictedFPS: predictedFPS[0],
      confidence: this.calculatePredictionConfidence(features),
      recommendations: this.generateOptimizationRecommendations(features, predictedFPS[0])
    };
  }

  extractPerformanceFeatures(metrics) {
    return [
      metrics.triangleCount / 100000,        // 正規化された三角形数
      metrics.textureCount / 100,            // テクスチャ数
      metrics.lightCount / 10,               // ライト数
      metrics.materialCount / 50,            // マテリアル数
      metrics.shaderComplexity || 0,         // シェーダー複雑度
      metrics.instanceCount / 1000,          // インスタンス数
      metrics.animationCount / 10,           // アニメーション数
      metrics.particleCount / 10000,         // パーティクル数
      metrics.screenResolution / 1000000,    // 解像度
      metrics.postProcessingPasses / 5       // ポストプロセシング数
    ];
  }

  calculatePredictionConfidence(features) {
    // 特徴量の分散から信頼度を計算
    const mean = features.reduce((a, b) => a + b) / features.length;
    const variance = features.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / features.length;
    
    // 分散が小さいほど予測の信頼度が高い
    return Math.max(0, Math.min(1, 1 - variance));
  }

  generateOptimizationRecommendations(features, predictedFPS) {
    const recommendations = [];
    
    if (predictedFPS < 30) {
      if (features[0] > 0.5) { // 高い三角形数
        recommendations.push({
          type: 'geometry',
          message: '三角形数が多すぎます。LOD（Level of Detail）システムの導入を検討してください。',
          priority: 'high'
        });
      }
      
      if (features[1] > 0.8) { // 多いテクスチャ数
        recommendations.push({
          type: 'texture',
          message: 'テクスチャ数が多すぎます。テクスチャアトラスの使用を検討してください。',
          priority: 'medium'
        });
      }
      
      if (features[2] > 0.7) { // 多いライト数
        recommendations.push({
          type: 'lighting',
          message: 'ライト数が多すぎます。ライトマップの使用を検討してください。',
          priority: 'medium'
        });
      }
    }
    
    return recommendations;
  }
}

// 自動テストケース生成AI
class AutomaticTestGenerator {
  constructor() {
    this.testPatterns = new Map();
    this.sceneTemplates = [];
  }

  // シーン設定から自動テストケース生成
  generateTestCases(sceneConfig) {
    const testCases = [];
    
    // 基本的なレンダリングテスト
    testCases.push(this.generateBasicRenderingTest(sceneConfig));
    
    // 境界値テスト
    testCases.push(...this.generateBoundaryTests(sceneConfig));
    
    // ストレステスト
    testCases.push(...this.generateStressTests(sceneConfig));
    
    // 回帰テスト
    testCases.push(...this.generateRegressionTests(sceneConfig));
    
    return testCases;
  }

  generateBasicRenderingTest(config) {
    return {
      name: `Basic Rendering - ${config.name}`,
      type: 'functional',
      setup: () => this.createSceneFromConfig(config),
      assertions: [
        { type: 'visual', threshold: 0.05 },
        { type: 'performance', minFPS: 30 },
        { type: 'memory', maxMemoryMB: 512 }
      ]
    };
  }

  generateBoundaryTests(config) {
    const tests = [];
    
    // 最大オブジェクト数テスト
    tests.push({
      name: `Max Objects - ${config.name}`,
      type: 'boundary',
      setup: () => {
        const scene = this.createSceneFromConfig(config);
        // オブジェクト数を段階的に増加
        return this.addObjectsUntilLimit(scene);
      },
      assertions: [
        { type: 'performance', minFPS: 15 },
        { type: 'stability', noErrors: true }
      ]
    });
    
    return tests;
  }
}
describe('WebGPU Migration Tests', () => {
  let migrationHelper;
  
  beforeEach(() => {
    migrationHelper = new WebGPUMigrationHelper();
  });

  test('should detect WebGPU capabilities', async () => {
    await migrationHelper.detectCapabilities();
    
    expect(typeof migrationHelper.capabilities.webgpu).toBe('boolean');
    expect(typeof migrationHelper.capabilities.webgl2).toBe('boolean');
    expect(typeof migrationHelper.capabilities.webgl).toBe('boolean');
  });

  test('should create optimal renderer based on capabilities', async () => {
    const canvas = document.createElement('canvas');
    const rendererInfo = await migrationHelper.createOptimalRenderer(canvas);
    
    expect(rendererInfo.renderer).toBeDefined();
    expect(['webgpu', 'webgl2', 'webgl']).toContain(rendererInfo.type);
    expect(rendererInfo.capabilities).toBeDefined();
  });

  test('should benchmark different renderer types', async () => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    
    // テストシーンの作成
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    const results = await migrationHelper.benchmarkRenderers(scene, camera, 50);
    
    expect(typeof results).toBe('object');
    Object.values(results).forEach(result => {
      expect(result.averageFrameTimeMs).toBeGreaterThan(0);
      expect(result.estimatedFPS).toBeGreaterThan(0);
    });
  });

  test('TSL shader manager should create and cache materials', () => {
    const tslManager = new TSLShaderManager();
    
    const config = {
      baseColor: 0xff0000,
      emissionColor: 0x000000,
      roughness: 0.3,
      animationStrength: 0.2
    };

    const material1 = tslManager.createTSLMaterial(config);
    const material2 = tslManager.createTSLMaterial(config);
    
    expect(material1).toBe(material2); // キャッシュされているべき
    expect(material1).toBeInstanceOf(THREE.NodeMaterial);
  });
});
```

### 5.3 Three.js進化動向と2025年の実装戦略

**Three.js r167+の新機能とテスト対応**

Three.jsプロジェクトは過去14年間で進化し、現在r167では実験的WebGPU対応、TSL（Three.js Shading Language）によるシェーダー統合、React R3Fフレームワークとの連携強化が主要な特徴となっています。

```javascript
// Three.js最新機能対応テストフレームワーク
class ThreeJSEvolutionTester {
  constructor() {
    this.supportedFeatures = new Map();
    this.migrationGuide = new Map();
  }

  // r167+ 機能検出とテスト
  async detectThreeJSCapabilities() {
    const capabilities = {
      webgpuRenderer: this.testWebGPURendererSupport(),
      tslShaderLanguage: this.testTSLSupport(),
      nodeBasedMaterials: this.testNodeMaterialSupport(),
      computeShaders: this.testComputeShaderSupport(),
      modernPostProcessing: this.testModernPostProcessing(),
      reactR3F: this.testReactR3FIntegration()
    };

    return capabilities;
  }

  testWebGPURendererSupport() {
    try {
      // WebGPURenderer availability check
      const isWebGPUSupported = typeof THREE.WebGPURenderer !== 'undefined';
      
      if (!isWebGPUSupported) {
        return {
          supported: false,
          reason: 'WebGPURenderer not available in current Three.js build',
          migration: 'Update to three/webgpu build or Three.js r167+'
        };
      }

      // Test WebGPURenderer creation
      const canvas = document.createElement('canvas');
      const renderer = new THREE.WebGPURenderer({ canvas });
      
      return {
        supported: true,
        version: renderer.capabilities?.version || 'unknown',
        features: {
          computeShaders: renderer.hasFeature?.('compute') || false,
          timestampQueries: renderer.hasFeature?.('timestamp-query') || false,
          multiDrawIndirect: renderer.hasFeature?.('multi-draw-indirect') || false
        }
      };
    } catch (error) {
      return {
        supported: false,
        error: error.message,
        migration: 'Check WebGPU browser support and Three.js version'
      };
    }
  }

  testTSLSupport() {
    try {
      // TSL basic node test
      const { positionLocal, normalLocal, float, vec3 } = THREE;
      
      if (!positionLocal || !normalLocal) {
        return {
          supported: false,
          reason: 'TSL nodes not available',
          migration: 'Import from three/tsl or update Three.js version'
        };
      }

      // Test node creation and basic operations
      const testNode = positionLocal.add(normalLocal.mul(float(0.1)));
      
      return {
        supported: true,
        features: {
          basicNodes: true,
          mathOperations: !!testNode.add,
          conditionalNodes: !!THREE.If,
          customFunctions: !!THREE.Fn,
          storageBuffers: !!THREE.storage
        }
      };
    } catch (error) {
      return {
        supported: false,
        error: error.message,
        migration: 'Ensure proper TSL imports: import { positionLocal } from "three/tsl"'
      };
    }
  }

  // 移行パス自動検出
  generateMigrationPath(currentVersion, targetVersion) {
    const migrationSteps = [];

    // WebGL to WebGPU migration
    if (targetVersion === 'webgpu') {
      migrationSteps.push({
        step: 1,
        title: 'Update Three.js Import',
        description: 'Change import from three to three/webgpu',
        code: `
// Before
import * as THREE from 'three';

// After  
import * as THREE from 'three/webgpu';
        `
      });

      migrationSteps.push({
        step: 2,
        title: 'Update Renderer Creation',
        description: 'Replace WebGLRenderer with WebGPURenderer',
        code: `
// Before
const renderer = new THREE.WebGLRenderer();

// After
const renderer = new THREE.WebGPURenderer();
await renderer.init();
        `
      });
    }

    return migrationSteps;
  }
}
```

### 5.4 実装優先順位とロードマップ（2025-2027年）

**即座実装優先事項（2025年Q1-Q2）**

1. **WebGPU フォールバック実装**
   - 優先度: 最高
   - 期間: 2-4週間
   - 技術的要件: WebGPU可用性検出と適切な処理

```javascript
// 優先実装項目の技術仕様
const PRIORITY_IMPLEMENTATION_2025_Q1 = {
  webgpuFallback: {
    priority: 'critical',
    estimatedWeeks: 3,
    dependencies: ['Three.js r167+', 'WebGPU browser support'],
    testCoverage: {
      unitTests: ['capability detection', 'fallback logic'],
      integrationTests: ['renderer switching', 'feature compatibility'],
      e2eTests: ['cross-browser support', 'performance comparison']
    }
  },
  
  cicdPipeline: {
    priority: 'high',
    estimatedWeeks: 2,
    dependencies: ['GitHub Actions', 'headless GPU support'],
    testCoverage: {
      automated: ['visual regression', 'performance benchmarks'],
      crossBrowser: ['Chrome', 'Firefox', 'Safari'],
      platforms: ['Windows', 'macOS', 'Linux']
    }
  }
};
```

**中期優先事項（2025年Q3-Q4）**

2. **TSL移行とテスト自動化**
   - 既存GLSL シェーダーのTSL変換テスト
   - ノードベースマテリアルの自動検証
   - シェーダーコンパイル時間とパフォーマンス測定

3. **AI支援テスト実装**
   - 視覚回帰テストでのML活用
   - 異常検出アルゴリズムの導入
   - パフォーマンス予測モデルの構築

**長期戦略的考慮事項（2026-2027年）**

4. **エッジコンピューティング対応**
   - 分散レンダリングテスト環境
   - CDN ベースのテストリソース配信
   - レイテンシを考慮したパフォーマンステスト

2. **ビジネス価値**
   - 開発効率の大幅向上とコスト削減
   - 製品品質の向上と顧客満足度の増加
   - 市場投入までの時間短縮

3. **戦略的価値**
   - 技術競争力の維持と向上
   - 将来技術への対応準備
   - チーム能力の継続的成長

この包括的なWebGLテスト専門ガイドにより、2025年以降の3Dウェブ開発における品質保証の新たな標準を確立し、技術的優位性を維持していくことが可能となります。継続的な学習と実践により、さらなる技術的進歩を遂げていきましょう。

## 参考資料

### 公式文書・仕様

1. **WebGL仕様**: [Khronos WebGL Registry](https://www.khronos.org/registry/webgl/)
2. **WebGPU仕様**: [W3C WebGPU Specification](https://www.w3.org/TR/webgpu/)
3. **Three.js公式ドキュメント**: [threejs.org](https://threejs.org/docs/)
4. **Three.js Shading Language**: [TSL Wiki](https://github.com/mrdoob/three.js/wiki/Three.js-Shading-Language)
5. **Canvas API仕様**: [W3C HTML Living Standard](https://html.spec.whatwg.org/multipage/canvas.html)

### テストツール・ライブラリ

6. **jest-canvas-mock**: [GitHub Repository](https://github.com/hustcc/jest-canvas-mock)
7. **Puppeteer**: [Official Documentation](https://pptr.dev/)
8. **Playwright**: [Microsoft Playwright](https://playwright.dev/)
9. **TensorFlow.js**: [Official Website](https://www.tensorflow.org/js)
10. **gl-matrix**: [GitHub Repository](https://github.com/toji/gl-matrix)

### 視覚回帰テストサービス

11. **Percy by BrowserStack**: [percy.io](https://percy.io/)
12. **Chromatic**: [chromatic.com](https://www.chromatic.com/)
13. **Applitools**: [applitools.com](https://applitools.com/)
14. **BackstopJS**: [GitHub Repository](https://github.com/garris/BackstopJS)

### 技術記事・研究

15. **WebGPU Best Practices**: [W3C WebGPU Working Group](https://gpuweb.github.io/gpuweb/)
16. **Three.js Performance Tips**: [Three.js Manual](https://threejs.org/manual/#en/optimize-lots-of-objects)
17. **TSL Tutorials**: [Three.js Shading Language Tutorials](https://sbcode.net/tsl/)
18. **Matrix Sentinels: TSL Particle Trails**: [Codrops Tutorial](https://tympanus.net/codrops/2025/05/05/matrix-sentinels-building-dynamic-particle-trails-with-tsl/)
19. **WebGL Best Practices**: [Mozilla Developer Network](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices)
20. **GPU Debugging Tools**: [Spector.js](https://spector.babylonjs.com/)

### プラットフォーム・ブラウザ対応

21. **ANGLE Project**: [Google ANGLE](https://github.com/google/angle)
22. **Mesa 3D Graphics**: [Mesa Project](https://www.mesa3d.org/)
23. **Metal Performance Shaders**: [Apple Metal](https://developer.apple.com/metal/)
24. **WebGL Extensions Registry**: [Khronos WebGL Extensions](https://www.khronos.org/registry/webgl/extensions/)
25. **WebGPU Browser Support**: [Can I Use WebGPU](https://caniuse.com/webgpu)

### AI・機械学習関連

26. **TensorFlow.js GPU Support**: [GPU Acceleration Guide](https://www.tensorflow.org/js/guide/platform_environment)
27. **WebGL Compute Shaders**: [Compute Shader Tutorial](https://webglfundamentals.org/webgl/lessons/webgl-compute-shaders.html)
28. **AI for Testing**: [AI-Driven Testing Research](https://research.google/pubs/pub49809/)

### コミュニティ・フォーラム

29. **Three.js Forum**: [discourse.threejs.org](https://discourse.threejs.org/)
30. **WebGL/WebGPU Discord**: [Graphics Programming Community](https://discord.gg/webgl)
31. **Stack Overflow**: [Three.js Questions](https://stackoverflow.com/questions/tagged/three.js)
32. **Reddit**: [r/WebGL](https://www.reddit.com/r/WebGL/) / [r/threejs](https://www.reddit.com/r/threejs/)
