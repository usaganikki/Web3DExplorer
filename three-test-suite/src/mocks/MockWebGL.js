/**
 * @file WebGLコンテキストのモック実装
 * Three.jsテストでWebGL機能を完全にシミュレートし、テスト間の独立性を確保
 */

/**
 * @typedef {object} InternalMockCanvas
 * @property {number} width
 * @property {number} height
 * @property {number} clientWidth
 * @property {number} clientHeight
 * @property {() => MockWebGLRenderingContext} getContext - このモックコンテキストのインスタンスを返します。
 * @property {() => void} addEventListener
 * @property {() => void} removeEventListener
 */
class MockWebGLRenderingContext {
  /** @type {InternalMockCanvas} */
  canvas;

  /**
   * @param {InternalMockCanvas} [canvas] - オプションのキャンバスオブジェクト。
   */
  constructor(canvas) {
    this.canvas = canvas || this.createMockCanvas();
    this.programs = new Map();
    this.shaders = new Map();
    this.buffers = new Map();
    this.textures = new Map();
    this.framebuffers = new Map();
    this.renderbuffers = new Map();
    
    // WebGL定数の定義
    this.initializeConstants();
    
    // 状態管理
    this.state = {
      viewport: [0, 0, this.canvas.width, this.canvas.height],
      clearColor: [0, 0, 0, 1],
      activeTexture: this.TEXTURE0,
      currentProgram: null,
      blend: false,
      depthTest: true,
      cullFace: false
    };
    
    // リソースカウンター
    this.resourceCounters = {
      programs: 0,
      shaders: 0,
      buffers: 0,
      textures: 0,
      framebuffers: 0,
      renderbuffers: 0
    };
  }

  /**
   * WebGL定数の初期化
   */
  initializeConstants() {
    // バッファターゲット
    this.ARRAY_BUFFER = 34962;
    this.ELEMENT_ARRAY_BUFFER = 34963;
    
    // データ型
    this.BYTE = 5120;
    this.UNSIGNED_BYTE = 5121;
    this.SHORT = 5122;
    this.UNSIGNED_SHORT = 5123;
    this.INT = 5124;
    this.UNSIGNED_INT = 5125;
    this.FLOAT = 5126;
    
    // シェーダータイプ
    this.VERTEX_SHADER = 35633;
    this.FRAGMENT_SHADER = 35632;
    
    // テクスチャターゲット
    this.TEXTURE_2D = 3553;
    this.TEXTURE_CUBE_MAP = 34067;
    
    // テクスチャユニット
    this.TEXTURE0 = 33984;
    this.TEXTURE1 = 33985;
    
    // フレームバッファ
    this.FRAMEBUFFER = 36160;
    this.RENDERBUFFER = 36161;
    
    // アタッチメント
    this.COLOR_ATTACHMENT0 = 36064;
    this.DEPTH_ATTACHMENT = 36096;
    this.STENCIL_ATTACHMENT = 36128;
    
    // 描画モード
    this.POINTS = 0;
    this.LINES = 1;
    this.TRIANGLES = 4;
    
    // ブレンドファクター
    this.ZERO = 0;
    this.ONE = 1;
    this.SRC_ALPHA = 770;
    this.ONE_MINUS_SRC_ALPHA = 771;
    
    // テスト関数
    this.NEVER = 512;
    this.LESS = 513;
    this.LEQUAL = 515;
    this.GREATER = 516;
    this.GEQUAL = 518;
    this.ALWAYS = 519;
    
    // エラーコード
    this.NO_ERROR = 0;
    this.INVALID_ENUM = 1280;
    this.INVALID_VALUE = 1281;
    this.INVALID_OPERATION = 1282;
    this.OUT_OF_MEMORY = 1285;
    
    // その他の定数
    this.VENDOR = 7936;
    this.RENDERER = 7937;
    this.VERSION = 7938;
    this.SHADING_LANGUAGE_VERSION = 35724;
    this.COMPILE_STATUS = 35713;
    this.LINK_STATUS = 35714;
    this.BLEND = 3042;
    this.DEPTH_TEST = 2929;
    this.CULL_FACE = 2884;
  }

  /**
   * モックCanvasの作成
   * @returns {InternalMockCanvas}
   */
  createMockCanvas() {
    return {
      width: 300,
      height: 150,
      clientWidth: 300,
      clientHeight: 150,
      getContext: () => this,
      addEventListener: () => {},
      removeEventListener: () => {}
    };
  }

  // === バッファ管理 ===
  
  createBuffer() {
    const id = ++this.resourceCounters.buffers;
    const buffer = { id, data: null, target: null };
    this.buffers.set(id, buffer);
    return buffer;
  }

  deleteBuffer(buffer) {
    if (buffer && this.buffers.has(buffer.id)) {
      this.buffers.delete(buffer.id);
    }
  }

  bindBuffer(target, buffer) {
    if (buffer) {
      buffer.target = target;
    }
  }

  bufferData(target, data, usage) {
    // データの保存をシミュレート
    const buffer = Array.from(this.buffers.values()).find(b => b.target === target);
    if (buffer) {
      buffer.data = data;
      buffer.usage = usage;
    }
  }

  // === シェーダー管理 ===
  
  createShader(type) {
    const id = ++this.resourceCounters.shaders;
    const shader = { id, type, source: '', compiled: false };
    this.shaders.set(id, shader);
    return shader;
  }

  deleteShader(shader) {
    if (shader && this.shaders.has(shader.id)) {
      this.shaders.delete(shader.id);
    }
  }

  shaderSource(shader, source) {
    if (shader && this.shaders.has(shader.id)) {
      shader.source = source;
    }
  }

  compileShader(shader) {
    if (shader && this.shaders.has(shader.id)) {
      shader.compiled = true;
      // シェーダーコンパイルの成功をシミュレート
    }
  }

  getShaderParameter(shader, pname) {
    if (pname === this.COMPILE_STATUS) {
      return true; // 常にコンパイル成功
    }
    return null;
  }

  getShaderInfoLog(shader) {
    return ''; // エラーなし
  }

  // === プログラム管理 ===
  
  createProgram() {
    const id = ++this.resourceCounters.programs;
    const program = { id, shaders: [], linked: false };
    this.programs.set(id, program);
    return program;
  }

  deleteProgram(program) {
    if (program && this.programs.has(program.id)) {
      this.programs.delete(program.id);
    }
  }

  attachShader(program, shader) {
    if (program && shader) {
      program.shaders.push(shader);
    }
  }

  linkProgram(program) {
    if (program) {
      program.linked = true;
    }
  }

  useProgram(program) {
    this.state.currentProgram = program;
  }

  getProgramParameter(program, pname) {
    if (pname === this.LINK_STATUS) {
      return true; // 常にリンク成功
    }
    return null;
  }

  getProgramInfoLog(program) {
    return ''; // エラーなし
  }

  // === 属性・ユニフォーム管理 ===
  
  getAttribLocation(program, name) {
    // 属性名に基づいて一意のロケーションを返す
    return name.length % 16; // 0-15の範囲
  }

  getUniformLocation(program, name) {
    // ユニフォーム名に基づいて一意のロケーションオブジェクトを返す
    return { name, program };
  }

  enableVertexAttribArray(index) {
    // 属性配列の有効化をシミュレート
  }

  vertexAttribPointer(index, size, type, normalized, stride, offset) {
    // 頂点属性ポインターの設定をシミュレート
  }

  uniform1f(location, value) {
    // float ユニフォームの設定をシミュレート
  }

  uniform1i(location, value) {
    // int ユニフォームの設定をシミュレート
  }

  uniform3fv(location, value) {
    // vec3 ユニフォームの設定をシミュレート
  }

  uniform4fv(location, value) {
    // vec4 ユニフォームの設定をシミュレート
  }

  uniformMatrix4fv(location, transpose, value) {
    // mat4 ユニフォームの設定をシミュレート
  }

  // === テクスチャ管理 ===
  
  createTexture() {
    const id = ++this.resourceCounters.textures;
    const texture = { id, target: null, image: null };
    this.textures.set(id, texture);
    return texture;
  }

  deleteTexture(texture) {
    if (texture && this.textures.has(texture.id)) {
      this.textures.delete(texture.id);
    }
  }

  bindTexture(target, texture) {
    if (texture) {
      texture.target = target;
    }
  }

  texImage2D(target, level, internalformat, width, height, border, format, type, data) {
    // テクスチャデータの設定をシミュレート
  }

  texParameteri(target, pname, param) {
    // テクスチャパラメータの設定をシミュレート
  }

  activeTexture(texture) {
    this.state.activeTexture = texture;
  }

  // === フレームバッファ管理 ===
  
  createFramebuffer() {
    const id = ++this.resourceCounters.framebuffers;
    const framebuffer = { id, attachments: {} };
    this.framebuffers.set(id, framebuffer);
    return framebuffer;
  }

  deleteFramebuffer(framebuffer) {
    if (framebuffer && this.framebuffers.has(framebuffer.id)) {
      this.framebuffers.delete(framebuffer.id);
    }
  }

  bindFramebuffer(target, framebuffer) {
    // フレームバッファのバインドをシミュレート
  }

  framebufferTexture2D(target, attachment, textarget, texture, level) {
    // フレームバッファへのテクスチャアタッチメントをシミュレート
  }

  // === レンダーバッファ管理 ===
  
  createRenderbuffer() {
    const id = ++this.resourceCounters.renderbuffers;
    const renderbuffer = { id };
    this.renderbuffers.set(id, renderbuffer);
    return renderbuffer;
  }

  deleteRenderbuffer(renderbuffer) {
    if (renderbuffer && this.renderbuffers.has(renderbuffer.id)) {
      this.renderbuffers.delete(renderbuffer.id);
    }
  }

  bindRenderbuffer(target, renderbuffer) {
    // レンダーバッファのバインドをシミュレート
  }

  renderbufferStorage(target, internalformat, width, height) {
    // レンダーバッファストレージの設定をシミュレート
  }

  // === 描画関数 ===
  
  clear(mask) {
    // 画面クリアをシミュレート
  }

  clearColor(red, green, blue, alpha) {
    this.state.clearColor = [red, green, blue, alpha];
  }

  drawArrays(mode, first, count) {
    // 配列描画をシミュレート
  }

  drawElements(mode, count, type, offset) {
    // インデックス描画をシミュレート
  }

  // === 状態管理 ===
  
  viewport(x, y, width, height) {
    this.state.viewport = [x, y, width, height];
  }

  enable(cap) {
    switch (cap) {
      case this.BLEND:
        this.state.blend = true;
        break;
      case this.DEPTH_TEST:
        this.state.depthTest = true;
        break;
      case this.CULL_FACE:
        this.state.cullFace = true;
        break;
    }
  }

  disable(cap) {
    switch (cap) {
      case this.BLEND:
        this.state.blend = false;
        break;
      case this.DEPTH_TEST:
        this.state.depthTest = false;
        break;
      case this.CULL_FACE:
        this.state.cullFace = false;
        break;
    }
  }

  blendFunc(sfactor, dfactor) {
    this.state.blendFunc = [sfactor, dfactor];
  }

  depthFunc(func) {
    this.state.depthFunc = func;
  }

  cullFace(mode) {
    this.state.cullFaceMode = mode;
  }

  // === 情報取得 ===
  
  getParameter(pname) {
    switch (pname) {
      case this.VENDOR:
        return 'Mock WebGL Vendor';
      case this.RENDERER:
        return 'Mock WebGL Renderer';
      case this.VERSION:
        return 'WebGL 1.0 Mock';
      case this.SHADING_LANGUAGE_VERSION:
        return 'WebGL GLSL ES 1.0 Mock';
      case this.MAX_TEXTURE_SIZE:
      case 3379:
        return 4096;
      case this.MAX_RENDERBUFFER_SIZE:
      case 34024:
        return 4096;
      case this.MAX_VERTEX_ATTRIBS:
      case 34921:
        return 16;
      default:
        return null;
    }
  }

  getError() {
    return this.NO_ERROR; // 常にエラーなし
  }

  getExtension(name) {
    // 基本的な拡張機能のモック
    const extensions = {
      'WEBGL_debug_renderer_info': {
        UNMASKED_VENDOR_WEBGL: 37445,
        UNMASKED_RENDERER_WEBGL: 37446
      },
      'OES_texture_float': {},
      'OES_texture_half_float': {},
      'WEBGL_lose_context': {
        loseContext: () => {},
        restoreContext: () => {}
      }
    };
    return extensions[name] || null;
  }

  getSupportedExtensions() {
    return [
      'WEBGL_debug_renderer_info',
      'OES_texture_float',
      'OES_texture_half_float',
      'WEBGL_lose_context'
    ];
  }

  // === リソース管理 ===
  
  /**
   * すべてのリソースをクリーンアップ
   */
  cleanup() {
    this.programs.clear();
    this.shaders.clear();
    this.buffers.clear();
    this.textures.clear();
    this.framebuffers.clear();
    this.renderbuffers.clear();
    
    // カウンターをリセット
    Object.keys(this.resourceCounters).forEach(key => {
      this.resourceCounters[key] = 0;
    });
    
    // 状態をリセット
    this.state = {
      viewport: [0, 0, this.canvas.width, this.canvas.height],
      clearColor: [0, 0, 0, 1],
      activeTexture: this.TEXTURE0,
      currentProgram: null,
      blend: false,
      depthTest: true,
      cullFace: false
    };
  }

  /**
   * リソース使用状況の取得
   */
  getResourceInfo() {
    return {
      programs: this.programs.size,
      shaders: this.shaders.size,
      buffers: this.buffers.size,
      textures: this.textures.size,
      framebuffers: this.framebuffers.size,
      renderbuffers: this.renderbuffers.size
    };
  }
}

/**
 * WebAssemblyランタイムのモック実装
 */
class MockWebAssembly {
  constructor() {
    this.instances = new Map();
    this.modules = new Map();
  }

  /**
   * WebAssemblyモジュールのコンパイル（モック）
   */
  static async compile(bytes) {
    return new MockWebAssemblyModule(bytes);
  }

  /**
   * WebAssemblyインスタンスの作成（モック）
   */
  static async instantiate(moduleOrBytes, importObject) {
    let module;
    if (moduleOrBytes instanceof MockWebAssemblyModule) {
      module = moduleOrBytes;
    } else {
      module = await MockWebAssembly.compile(moduleOrBytes);
    }
    
    const instance = new MockWebAssemblyInstance(module, importObject);
    return { module, instance };
  }

  /**
   * WebAssemblyの対応確認
   */
  static validate(bytes) {
    return true; // 常に有効とする
  }
}

/**
 * WebAssemblyモジュールのモック
 */
class MockWebAssemblyModule {
  constructor(bytes) {
    this.bytes = bytes;
    this.exports = ['memory', 'main', 'add', 'multiply']; // ダミーのエクスポート
  }

  static exports() {
    return ['memory', 'main', 'add', 'multiply'];
  }

  static imports() {
    return [];
  }
}

/**
 * WebAssemblyインスタンスのモック
 */
class MockWebAssemblyInstance {
  constructor(module, importObject) {
    this.module = module;
    this.importObject = importObject;
    
    // モックのエクスポート関数
    this.exports = {
      memory: new MockWebAssemblyMemory(),
      main: () => 0,
      add: (a, b) => a + b,
      multiply: (a, b) => a * b,
      // その他のダミー関数
      allocate: (size) => 1024, // ダミーポインタ
      deallocate: (ptr) => {},
      getString: (ptr, len) => 'mock string',
      setString: (ptr, str) => {}
    };
  }
}

/**
 * WebAssemblyメモリのモック
 */
class MockWebAssemblyMemory {
  constructor(descriptor = { initial: 1 }) {
    this.descriptor = descriptor;
    this.buffer = new ArrayBuffer(descriptor.initial * 65536); // 64KB pages
  }

  grow(delta) {
    const oldSize = this.buffer.byteLength;
    const newSize = oldSize + (delta * 65536);
    const newBuffer = new ArrayBuffer(newSize);
    new Uint8Array(newBuffer).set(new Uint8Array(this.buffer));
    this.buffer = newBuffer;
    return oldSize / 65536;
  }
}

/**
 * グローバルなWebGL/WebAssemblyモックの設定
 */
function setupWebGLMocks(global = globalThis) {
  // WebGLRenderingContextのモック
  global.WebGLRenderingContext = MockWebGLRenderingContext;
  
  // WebGL2RenderingContextのモック（WebGL2対応）
  global.WebGL2RenderingContext = class extends MockWebGLRenderingContext {
    constructor(canvas) {
      super(canvas);
      this.version = 2;
    }
    
    getParameter(pname) {
      if (pname === this.VERSION) {
        return 'WebGL 2.0 Mock';
      }
      return super.getParameter(pname);
    }
  };
  
  // HTMLCanvasElementのモック
  if (!global.HTMLCanvasElement) {
    global.HTMLCanvasElement = class MockHTMLCanvasElement {
      constructor() {
        this.width = 300;
        this.height = 150;
        this.clientWidth = 300;
        this.clientHeight = 150;
      }
      
      getContext(contextId, options) {
        if (contextId === 'webgl' || contextId === 'experimental-webgl') {
          return new MockWebGLRenderingContext(this);
        }
        if (contextId === 'webgl2') {
          return new global.WebGL2RenderingContext(this);
        }
        return null;
      }
      
      addEventListener() {}
      removeEventListener() {}
    };
  }
  
  // WebAssemblyのモック
  global.WebAssembly = MockWebAssembly;
  global.WebAssembly.Module = MockWebAssemblyModule;
  global.WebAssembly.Instance = MockWebAssemblyInstance;
  global.WebAssembly.Memory = MockWebAssemblyMemory;
  
  // ImageDataのモック
  if (!global.ImageData) {
    global.ImageData = class MockImageData {
      constructor(dataOrWidth, widthOrHeight, height) {
        if (typeof dataOrWidth === 'object') {
          this.data = dataOrWidth;
          this.width = widthOrHeight;
          this.height = height;
        } else {
          this.width = dataOrWidth;
          this.height = widthOrHeight;
          this.data = new Uint8ClampedArray(this.width * this.height * 4);
        }
      }
    };
  }
}

/**
 * テスト環境でのモック初期化
 */
function initializeTestMocks() {
  setupWebGLMocks();
  
  // documentオブジェクトのモック（必要に応じて）
  if (typeof document === 'undefined') {
    global.document = {
      createElement: (tagName) => {
        if (tagName === 'canvas') {
          return new global.HTMLCanvasElement();
        }
        return { tagName };
      },
      getElementById: () => new global.HTMLCanvasElement(),
      addEventListener: () => {},
      removeEventListener: () => {}
    };
  }
  
  // windowオブジェクトのモック（必要に応じて）
  if (typeof window === 'undefined') {
    global.window = {
      ...global,
      addEventListener: () => {},
      removeEventListener: () => {},
      innerWidth: 1024,
      innerHeight: 768,
      devicePixelRatio: 1
    };
  }
}

export {
  MockWebGLRenderingContext,
  MockWebAssembly,
  MockWebAssemblyModule,
  MockWebAssemblyInstance,
  MockWebAssemblyMemory,
  setupWebGLMocks,
  initializeTestMocks
};
