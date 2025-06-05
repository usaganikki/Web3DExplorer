import { jest } from '@jest/globals';
import {
  MockWebGLRenderingContext,
  MockWebAssembly,
  MockWebAssemblyModule,
  MockWebAssemblyInstance,
  MockWebAssemblyMemory,
  setupWebGLMocks,
  initializeTestMocks,
} from '../../src/mocks/MockWebGL.js';

describe('MockWebGL', () => {
  describe('MockWebGLRenderingContext', () => {
    let mockCanvas;
    let gl;

    beforeEach(() => {
      // 各テストの前にモックキャンバスとコンテキストを初期化
      mockCanvas = {
        width: 300,
        height: 150,
        clientWidth: 300,
        clientHeight: 150,
        getContext: jest.fn().mockImplementation(() => gl), // getContextがglを返すように
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      };
      gl = new MockWebGLRenderingContext(mockCanvas);
    });

    afterEach(() => {
      // 各テストの後にリソースをクリーンアップ
      if (gl && typeof gl.cleanup === 'function') {
        gl.cleanup();
      }
      jest.clearAllMocks();
    });

    // --- コンストラクタと初期化 ---
    describe('Constructor and Initialization', () => {
      test('should initialize with a given canvas', () => {
        expect(gl.canvas).toBe(mockCanvas);
        expect(gl.canvas.width).toBe(300);
        expect(gl.canvas.height).toBe(150);
      });

      test('should create a default mock canvas if none is provided', () => {
        const glWithoutCanvas = new MockWebGLRenderingContext();
        expect(glWithoutCanvas.canvas).toBeDefined();
        expect(glWithoutCanvas.canvas.width).toBe(300); // デフォルト値を確認
        expect(glWithoutCanvas.canvas.height).toBe(150); // デフォルト値を確認
        expect(typeof glWithoutCanvas.canvas.getContext).toBe('function');
      });

      test('should initialize WebGL constants', () => {
        expect(gl.ARRAY_BUFFER).toBe(34962);
        expect(gl.VERTEX_SHADER).toBe(35633);
        // 他の主要な定数も確認
        expect(gl.TEXTURE_2D).toBe(3553);
        expect(gl.FRAMEBUFFER).toBe(36160);
        expect(gl.COMPILE_STATUS).toBe(35713);
      });

      test('should initialize default state', () => {
        expect(gl.state.viewport).toEqual([0, 0, mockCanvas.width, mockCanvas.height]);
        expect(gl.state.clearColor).toEqual([0, 0, 0, 1]);
        expect(gl.state.activeTexture).toBe(gl.TEXTURE0);
        expect(gl.state.currentProgram).toBeNull();
        expect(gl.state.blend).toBe(false);
        expect(gl.state.depthTest).toBe(true);
        expect(gl.state.cullFace).toBe(false);
      });

      test('should initialize resource counters to zero', () => {
        expect(gl.resourceCounters.programs).toBe(0);
        expect(gl.resourceCounters.shaders).toBe(0);
        expect(gl.resourceCounters.buffers).toBe(0);
        expect(gl.resourceCounters.textures).toBe(0);
        expect(gl.resourceCounters.framebuffers).toBe(0);
        expect(gl.resourceCounters.renderbuffers).toBe(0);
      });
    });

    // --- リソース管理 (Buffer) ---
    describe('Buffer Management', () => {
      let buffer;
      beforeEach(() => {
        buffer = gl.createBuffer();
      });

      test('createBuffer should return a new buffer object and increment counter', () => {
        expect(buffer).toBeDefined();
        expect(buffer.id).toBe(1);
        expect(gl.buffers.size).toBe(1);
        expect(gl.resourceCounters.buffers).toBe(1);
        const buffer2 = gl.createBuffer();
        expect(buffer2.id).toBe(2);
        expect(gl.buffers.size).toBe(2);
        expect(gl.resourceCounters.buffers).toBe(2);
      });

      test('deleteBuffer should remove the buffer', () => {
        gl.deleteBuffer(buffer);
        expect(gl.buffers.has(buffer.id)).toBe(false);
        expect(gl.buffers.size).toBe(0);
        // 存在しないバッファを削除してもエラーにならない
        gl.deleteBuffer({ id: 999 });
        gl.deleteBuffer(null);
      });

      test('bindBuffer should set the target on the buffer', () => {
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        expect(buffer.target).toBe(gl.ARRAY_BUFFER);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
        expect(buffer.target).toBe(gl.ELEMENT_ARRAY_BUFFER);
        // nullバッファをバインドしてもエラーにならない
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
      });

      test('bufferData should store data and usage on the buffer', () => {
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer); // バインドが必要
        const data = new Float32Array([1, 2, 3]);
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
        const boundBuffer = Array.from(gl.buffers.values()).find(b => b.target === gl.ARRAY_BUFFER);
        expect(boundBuffer.data).toBe(data);
        expect(boundBuffer.usage).toBe(gl.STATIC_DRAW);
      });
    });

    // --- シェーダー管理 ---
    describe('Shader Management', () => {
      let vertexShader;
      let fragmentShader;

      beforeEach(() => {
        vertexShader = gl.createShader(gl.VERTEX_SHADER);
        fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
      });

      test('createShader should return a new shader object and increment counter', () => {
        expect(vertexShader).toBeDefined();
        expect(vertexShader.id).toBe(1);
        expect(vertexShader.type).toBe(gl.VERTEX_SHADER);
        expect(gl.shaders.size).toBe(2); // beforeEachで2つ作成
        expect(gl.resourceCounters.shaders).toBe(2);
      });

      test('deleteShader should remove the shader', () => {
        gl.deleteShader(vertexShader);
        expect(gl.shaders.has(vertexShader.id)).toBe(false);
        expect(gl.shaders.size).toBe(1);
        gl.deleteShader(null); // nullを渡してもエラーにならない
      });

      test('shaderSource should set the source on the shader', () => {
        const source = 'void main() {}';
        gl.shaderSource(vertexShader, source);
        expect(vertexShader.source).toBe(source);
      });

      test('compileShader should mark the shader as compiled', () => {
        gl.compileShader(vertexShader);
        expect(vertexShader.compiled).toBe(true);
      });

      test('getShaderParameter should return COMPILE_STATUS as true', () => {
        expect(gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)).toBe(true);
        expect(gl.getShaderParameter(vertexShader, 9999)).toBeNull(); // 未知のパラメータ
      });

      test('getShaderInfoLog should return an empty string', () => {
        expect(gl.getShaderInfoLog(vertexShader)).toBe('');
      });
    });

    // --- プログラム管理 ---
    describe('Program Management', () => {
      let program;
      let vertexShader;
      let fragmentShader;

      beforeEach(() => {
        program = gl.createProgram();
        vertexShader = gl.createShader(gl.VERTEX_SHADER);
        fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
      });

      test('createProgram should return a new program object and increment counter', () => {
        expect(program).toBeDefined();
        expect(program.id).toBe(1);
        expect(gl.programs.size).toBe(1);
        expect(gl.resourceCounters.programs).toBe(1);
      });

      test('deleteProgram should remove the program', () => {
        gl.deleteProgram(program);
        expect(gl.programs.has(program.id)).toBe(false);
        expect(gl.programs.size).toBe(0);
        gl.deleteProgram(null);
      });

      test('attachShader should add shader to program', () => {
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        expect(program.shaders).toContain(vertexShader);
        expect(program.shaders).toContain(fragmentShader);
        expect(program.shaders.length).toBe(2);
      });

      test('linkProgram should mark program as linked', () => {
        gl.linkProgram(program);
        expect(program.linked).toBe(true);
      });

      test('useProgram should set the current program state', () => {
        gl.useProgram(program);
        expect(gl.state.currentProgram).toBe(program);
        gl.useProgram(null);
        expect(gl.state.currentProgram).toBeNull();
      });

      test('getProgramParameter should return LINK_STATUS as true', () => {
        expect(gl.getProgramParameter(program, gl.LINK_STATUS)).toBe(true);
        expect(gl.getProgramParameter(program, 9999)).toBeNull(); // 未知のパラメータ
      });

      test('getProgramInfoLog should return an empty string', () => {
        expect(gl.getProgramInfoLog(program)).toBe('');
      });
    });

    // --- 属性・ユニフォーム管理 ---
    describe('Attribute and Uniform Management', () => {
      let program;
      beforeEach(() => {
        program = gl.createProgram();
      });

      test('getAttribLocation should return a number', () => {
        const loc = gl.getAttribLocation(program, 'a_position');
        expect(typeof loc).toBe('number');
        expect(loc).toBeGreaterThanOrEqual(0);
        expect(loc).toBeLessThanOrEqual(15);
      });

      test('getUniformLocation should return an object with name and program', () => {
        const loc = gl.getUniformLocation(program, 'u_matrix');
        expect(loc).toBeDefined();
        expect(loc.name).toBe('u_matrix');
        expect(loc.program).toBe(program);
      });

      test('enableVertexAttribArray should not throw', () => {
        expect(() => gl.enableVertexAttribArray(0)).not.toThrow();
      });

      test('vertexAttribPointer should not throw', () => {
        expect(() => gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0)).not.toThrow();
      });

      test('uniform setters should not throw', () => {
        const loc = gl.getUniformLocation(program, 'u_test');
        expect(() => gl.uniform1f(loc, 1.0)).not.toThrow();
        expect(() => gl.uniform1i(loc, 1)).not.toThrow();
        expect(() => gl.uniform3fv(loc, new Float32Array([1,0,0]))).not.toThrow();
        expect(() => gl.uniform4fv(loc, new Float32Array([1,0,0,1]))).not.toThrow();
        expect(() => gl.uniformMatrix4fv(loc, false, new Float32Array(16))).not.toThrow();
      });
    });

    // --- テクスチャ管理 ---
    describe('Texture Management', () => {
      let texture;
      beforeEach(() => {
        texture = gl.createTexture();
      });

      test('createTexture should return a new texture object and increment counter', () => {
        expect(texture).toBeDefined();
        expect(texture.id).toBe(1);
        expect(gl.textures.size).toBe(1);
        expect(gl.resourceCounters.textures).toBe(1);
      });

      test('deleteTexture should remove the texture', () => {
        gl.deleteTexture(texture);
        expect(gl.textures.has(texture.id)).toBe(false);
        gl.deleteTexture(null);
      });

      test('bindTexture should set the target on the texture', () => {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        expect(texture.target).toBe(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
        expect(texture.target).toBe(gl.TEXTURE_CUBE_MAP);
        gl.bindTexture(gl.TEXTURE_2D, null);
      });

      test('texImage2D should not throw', () => {
        expect(() => gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255,0,0,255]))).not.toThrow();
      });

      test('texParameteri should not throw', () => {
        expect(() => gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)).not.toThrow();
      });

      test('activeTexture should set the active texture state', () => {
        gl.activeTexture(gl.TEXTURE1);
        expect(gl.state.activeTexture).toBe(gl.TEXTURE1);
        gl.activeTexture(gl.TEXTURE0);
        expect(gl.state.activeTexture).toBe(gl.TEXTURE0);
      });
    });

    // --- フレームバッファ管理 ---
    describe('Framebuffer Management', () => {
      let framebuffer;
      beforeEach(() => {
        framebuffer = gl.createFramebuffer();
      });

      test('createFramebuffer should return a new framebuffer object and increment counter', () => {
        expect(framebuffer).toBeDefined();
        expect(framebuffer.id).toBe(1);
        expect(gl.framebuffers.size).toBe(1);
        expect(gl.resourceCounters.framebuffers).toBe(1);
      });

      test('deleteFramebuffer should remove the framebuffer', () => {
        gl.deleteFramebuffer(framebuffer);
        expect(gl.framebuffers.has(framebuffer.id)).toBe(false);
        gl.deleteFramebuffer(null);
      });

      test('bindFramebuffer should not throw', () => {
        expect(() => gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)).not.toThrow();
        expect(() => gl.bindFramebuffer(gl.FRAMEBUFFER, null)).not.toThrow();
      });

      test('framebufferTexture2D should not throw', () => {
        const texture = gl.createTexture();
        expect(() => gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0)).not.toThrow();
      });
    });

    // --- レンダーバッファ管理 ---
    describe('Renderbuffer Management', () => {
      let renderbuffer;
      beforeEach(() => {
        renderbuffer = gl.createRenderbuffer();
      });

      test('createRenderbuffer should return a new renderbuffer object and increment counter', () => {
        expect(renderbuffer).toBeDefined();
        expect(renderbuffer.id).toBe(1);
        expect(gl.renderbuffers.size).toBe(1);
        expect(gl.resourceCounters.renderbuffers).toBe(1);
      });

      test('deleteRenderbuffer should remove the renderbuffer', () => {
        gl.deleteRenderbuffer(renderbuffer);
        expect(gl.renderbuffers.has(renderbuffer.id)).toBe(false);
        gl.deleteRenderbuffer(null);
      });

      test('bindRenderbuffer should not throw', () => {
        expect(() => gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer)).not.toThrow();
        expect(() => gl.bindRenderbuffer(gl.RENDERBUFFER, null)).not.toThrow();
      });

      test('renderbufferStorage should not throw', () => {
        expect(() => gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, 100, 100)).not.toThrow();
      });
    });

    // --- 描画関数 ---
    describe('Drawing Functions', () => {
      test('clear should not throw', () => {
        expect(() => gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)).not.toThrow();
      });

      test('clearColor should update clearColor state', () => {
        gl.clearColor(0.5, 0.5, 0.5, 0.5);
        expect(gl.state.clearColor).toEqual([0.5, 0.5, 0.5, 0.5]);
      });

      test('drawArrays should not throw', () => {
        expect(() => gl.drawArrays(gl.TRIANGLES, 0, 3)).not.toThrow();
      });

      test('drawElements should not throw', () => {
        // ELEMENT_ARRAY_BUFFERをバインドしておく必要があるかもしれないが、モックなので省略
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0,1,2]), gl.STATIC_DRAW);
        expect(() => gl.drawElements(gl.TRIANGLES, 3, gl.UNSIGNED_SHORT, 0)).not.toThrow();
      });
    });

    // --- 状態管理 ---
    describe('State Management', () => {
      test('viewport should update viewport state', () => {
        gl.viewport(10, 20, 100, 200);
        expect(gl.state.viewport).toEqual([10, 20, 100, 200]);
      });

      test('enable should update corresponding state flag to true', () => {
        gl.enable(gl.BLEND);
        expect(gl.state.blend).toBe(true);
        gl.enable(gl.DEPTH_TEST);
        expect(gl.state.depthTest).toBe(true);
        gl.enable(gl.CULL_FACE);
        expect(gl.state.cullFace).toBe(true);
        gl.enable(9999); // 未知のキャップ
      });

      test('disable should update corresponding state flag to false', () => {
        gl.enable(gl.BLEND); // まず有効化
        gl.disable(gl.BLEND);
        expect(gl.state.blend).toBe(false);

        gl.enable(gl.DEPTH_TEST);
        gl.disable(gl.DEPTH_TEST);
        expect(gl.state.depthTest).toBe(false);

        gl.enable(gl.CULL_FACE);
        gl.disable(gl.CULL_FACE);
        expect(gl.state.cullFace).toBe(false);
        gl.disable(9999); // 未知のキャップ
      });

      test('blendFunc should update blendFunc state', () => {
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        expect(gl.state.blendFunc).toEqual([gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA]);
      });

      test('depthFunc should update depthFunc state', () => {
        gl.depthFunc(gl.LESS);
        expect(gl.state.depthFunc).toBe(gl.LESS);
      });

      test('cullFace should update cullFaceMode state', () => {
        gl.cullFace(gl.BACK);
        expect(gl.state.cullFaceMode).toBe(gl.BACK);
      });
    });

    // --- 情報取得 ---
    describe('Information Retrieval', () => {
      test('getParameter should return mocked values', () => {
        expect(gl.getParameter(gl.VENDOR)).toBe('Mock WebGL Vendor');
        expect(gl.getParameter(gl.RENDERER)).toBe('Mock WebGL Renderer');
        expect(gl.getParameter(gl.VERSION)).toBe('WebGL 1.0 Mock');
        expect(gl.getParameter(gl.SHADING_LANGUAGE_VERSION)).toBe('WebGL GLSL ES 1.0 Mock');
        expect(gl.getParameter(gl.MAX_TEXTURE_SIZE)).toBe(4096);
        expect(gl.getParameter(3379)).toBe(4096); // MAX_TEXTURE_SIZEのエイリアス
        expect(gl.getParameter(gl.MAX_RENDERBUFFER_SIZE)).toBe(4096);
        expect(gl.getParameter(34024)).toBe(4096); // MAX_RENDERBUFFER_SIZEのエイリアス
        expect(gl.getParameter(gl.MAX_VERTEX_ATTRIBS)).toBe(16);
        expect(gl.getParameter(34921)).toBe(16); // MAX_VERTEX_ATTRIBSのエイリアス
        expect(gl.getParameter(9999)).toBeNull(); // 未知のパラメータ
      });

      test('getError should return NO_ERROR', () => {
        expect(gl.getError()).toBe(gl.NO_ERROR);
      });

      test('getExtension should return mocked extension objects or null', () => {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        expect(debugInfo).toBeDefined();
        expect(debugInfo.UNMASKED_VENDOR_WEBGL).toBe(37445);

        const floatTex = gl.getExtension('OES_texture_float');
        expect(floatTex).toEqual({});

        const loseContext = gl.getExtension('WEBGL_lose_context');
        expect(loseContext).toBeDefined();
        expect(typeof loseContext.loseContext).toBe('function');

        expect(gl.getExtension('NON_EXISTENT_EXTENSION')).toBeNull();
      });

      test('getSupportedExtensions should return a list of mocked extensions', () => {
        const extensions = gl.getSupportedExtensions();
        expect(extensions).toContain('WEBGL_debug_renderer_info');
        expect(extensions).toContain('OES_texture_float');
        expect(extensions).toContain('WEBGL_lose_context');
      });
    });

    // --- リソースクリーンアップと情報取得 ---
    describe('Resource Cleanup and Info', () => {
      test('cleanup should clear all resources and reset counters and state', () => {
        // リソースを作成
        gl.createBuffer();
        gl.createShader(gl.VERTEX_SHADER);
        gl.createProgram();
        gl.createTexture();
        gl.createFramebuffer();
        gl.createRenderbuffer();

        gl.enable(gl.BLEND);
        gl.viewport(10,10,10,10);

        gl.cleanup();

        expect(gl.buffers.size).toBe(0);
        expect(gl.shaders.size).toBe(0);
        expect(gl.programs.size).toBe(0);
        expect(gl.textures.size).toBe(0);
        expect(gl.framebuffers.size).toBe(0);
        expect(gl.renderbuffers.size).toBe(0);

        expect(gl.resourceCounters.buffers).toBe(0);
        // ... 他のカウンターも0であるべき

        expect(gl.state.blend).toBe(false); // 初期状態に戻る
        expect(gl.state.viewport).toEqual([0, 0, mockCanvas.width, mockCanvas.height]); // 初期状態
      });

      test('getResourceInfo should return current resource counts', () => {
        gl.createBuffer();
        gl.createBuffer();
        gl.createShader(gl.VERTEX_SHADER);

        const info = gl.getResourceInfo();
        expect(info.buffers).toBe(2);
        expect(info.shaders).toBe(1);
        expect(info.programs).toBe(0);
        // ... 他のリソースも確認
      });
    });
  });

  describe('MockWebAssembly', () => {
    // --- MockWebAssembly 静的メソッド ---
    describe('Static Methods', () => {
      test('compile should return a MockWebAssemblyModule', async () => {
        const module = await MockWebAssembly.compile(new Uint8Array([0, 97, 115, 109])); // (magic \0asm)
        expect(module).toBeInstanceOf(MockWebAssemblyModule);
        expect(module.bytes).toBeDefined();
      });

      test('instantiate with module should return module and instance', async () => {
        const wasmModule = await MockWebAssembly.compile(new Uint8Array([0, 97, 115, 109]));
        const { module, instance } = await MockWebAssembly.instantiate(wasmModule, {});
        expect(module).toBe(wasmModule);
        expect(instance).toBeInstanceOf(MockWebAssemblyInstance);
        expect(instance.exports.add(1,2)).toBe(3); // ダミーエクスポートのテスト
      });

      test('instantiate with bytes should compile and return module and instance', async () => {
        const { module, instance } = await MockWebAssembly.instantiate(new Uint8Array([0, 97, 115, 109]), {});
        expect(module).toBeInstanceOf(MockWebAssemblyModule);
        expect(instance).toBeInstanceOf(MockWebAssemblyInstance);
      });

      test('validate should return true', () => {
        expect(MockWebAssembly.validate(new Uint8Array())).toBe(true);
      });
    });

    // --- MockWebAssemblyModule ---
    describe('MockWebAssemblyModule', () => {
      let module;
      beforeEach(async () => {
        module = await MockWebAssembly.compile(new Uint8Array());
      });

      test('constructor should store bytes and have dummy exports', () => {
        expect(module.bytes).toBeDefined();
        expect(module.exports).toEqual(expect.arrayContaining(['memory', 'main']));
      });

      test('static exports should return dummy exports', () => {
        expect(MockWebAssemblyModule.exports()).toEqual(expect.arrayContaining(['memory', 'main']));
      });

      test('static imports should return empty array', () => {
        expect(MockWebAssemblyModule.imports()).toEqual([]);
      });
    });

    // --- MockWebAssemblyInstance ---
    describe('MockWebAssemblyInstance', () => {
      let instance;
      let wasmModule;
      beforeEach(async () => {
        wasmModule = await MockWebAssembly.compile(new Uint8Array());
        const result = await MockWebAssembly.instantiate(wasmModule, { env: { imported_func: () => {} } });
        instance = result.instance;
      });

      test('constructor should store module and importObject, and have dummy exports', () => {
        expect(instance.module).toBe(wasmModule);
        expect(instance.importObject).toHaveProperty('env.imported_func');
        expect(instance.exports.memory).toBeInstanceOf(MockWebAssemblyMemory);
        expect(instance.exports.main()).toBe(0);
        expect(instance.exports.add(2, 3)).toBe(5);
        expect(instance.exports.multiply(2, 3)).toBe(6);
      });
    });

    // --- MockWebAssemblyMemory ---
    describe('MockWebAssemblyMemory', () => {
      let memory;
      beforeEach(() => {
        memory = new MockWebAssemblyMemory({ initial: 1 });
      });

      test('constructor should create an ArrayBuffer of initial size', () => {
        expect(memory.buffer).toBeInstanceOf(ArrayBuffer);
        expect(memory.buffer.byteLength).toBe(1 * 65536); // 1 page
      });

      test('grow should increase buffer size and return old size in pages', () => {
        const oldPages = memory.grow(1); // 1ページ追加
        expect(oldPages).toBe(1);
        expect(memory.buffer.byteLength).toBe(2 * 65536); // 2 pages
        const oldPages2 = memory.grow(2);
        expect(oldPages2).toBe(2);
        expect(memory.buffer.byteLength).toBe(4 * 65536);
      });
    });
  });

  describe('Setup Functions', () => {
    let originalWebGLContext;
    let originalWebGL2Context;
    let originalHTMLCanvasElement;
    let originalWebAssembly;
    let originalDocument;
    let originalWindow;
    let originalImageData;

    beforeEach(() => {
      // 元のグローバルオブジェクトを保存
      originalWebGLContext = global.WebGLRenderingContext;
      originalWebGL2Context = global.WebGL2RenderingContext;
      originalHTMLCanvasElement = global.HTMLCanvasElement;
      originalWebAssembly = global.WebAssembly;
      originalDocument = global.document;
      originalWindow = global.window;
      originalImageData = global.ImageData;

      // グローバルオブジェクトを一旦未定義にしてテストの独立性を高める
      delete global.WebGLRenderingContext;
      delete global.WebGL2RenderingContext;
      delete global.HTMLCanvasElement;
      delete global.WebAssembly;
      delete global.document;
      delete global.window;
      delete global.ImageData;
    });

    afterEach(() => {
      // グローバルオブジェクトを元に戻す
      global.WebGLRenderingContext = originalWebGLContext;
      global.WebGL2RenderingContext = originalWebGL2Context;
      global.HTMLCanvasElement = originalHTMLCanvasElement;
      global.WebAssembly = originalWebAssembly;
      global.document = originalDocument;
      global.window = originalWindow;
      global.ImageData = originalImageData;
    });

    describe('setupWebGLMocks', () => {
      test('should set WebGLRenderingContext and WebGL2RenderingContext mocks globally', () => {
        setupWebGLMocks(global);
        expect(global.WebGLRenderingContext).toBe(MockWebGLRenderingContext);
        expect(global.WebGL2RenderingContext).toBeDefined();
        const gl2 = new global.WebGL2RenderingContext();
        expect(gl2.getParameter(gl2.VERSION)).toBe('WebGL 2.0 Mock');
      });

      test('should set HTMLCanvasElement mock globally if not exists', () => {
        expect(global.HTMLCanvasElement).toBeUndefined();
        setupWebGLMocks(global);
        expect(global.HTMLCanvasElement).toBeDefined();
        const canvas = new global.HTMLCanvasElement();
        expect(canvas.getContext('webgl')).toBeInstanceOf(MockWebGLRenderingContext);
        expect(canvas.getContext('webgl2')).toBeInstanceOf(global.WebGL2RenderingContext);
        expect(canvas.getContext('2d')).toBeNull();
      });

      test('should not overwrite existing HTMLCanvasElement if present', () => {
        const MyCanvas = class {};
        global.HTMLCanvasElement = MyCanvas;
        setupWebGLMocks(global);
        expect(global.HTMLCanvasElement).toBe(MyCanvas); // 上書きされない
         // 元に戻す
        global.HTMLCanvasElement = originalHTMLCanvasElement;
        delete global.HTMLCanvasElement; // beforeEachで消しているので再度消す
        setupWebGLMocks(global); // 再度セットアップして他のテストに影響が出ないように
      });


      test('should set WebAssembly mocks globally', () => {
        setupWebGLMocks(global);
        expect(global.WebAssembly).toBe(MockWebAssembly);
        expect(global.WebAssembly.Module).toBe(MockWebAssemblyModule);
        expect(global.WebAssembly.Instance).toBe(MockWebAssemblyInstance);
        expect(global.WebAssembly.Memory).toBe(MockWebAssemblyMemory);
      });

      test('should set ImageData mock globally if not exists', () => {
        expect(global.ImageData).toBeUndefined();
        setupWebGLMocks(global);
        expect(global.ImageData).toBeDefined();
        const imgData = new global.ImageData(10, 10);
        expect(imgData.width).toBe(10);
        expect(imgData.height).toBe(10);
        expect(imgData.data).toBeInstanceOf(Uint8ClampedArray);
      });
    });

    describe('initializeTestMocks', () => {
      test('should call setupWebGLMocks', () => {
        // setupWebGLMocksが呼ばれることを確認するためにスパイする
        // ただし、モジュール内で直接呼び出されているため、ここでは結果で確認
        initializeTestMocks();
        expect(global.WebGLRenderingContext).toBe(MockWebGLRenderingContext);
        expect(global.WebAssembly).toBe(MockWebAssembly);
      });

      test('should set document mock globally if not exists', () => {
        expect(global.document).toBeUndefined();
        initializeTestMocks();
        expect(global.document).toBeDefined();
        expect(typeof global.document.createElement).toBe('function');
        const canvasEl = global.document.createElement('canvas');
        expect(canvasEl).toBeInstanceOf(global.HTMLCanvasElement); // HTMLCanvasElementもモックされているはず
        expect(global.document.createElement('div').tagName).toBe('div');
        expect(global.document.getElementById('test')).toBeInstanceOf(global.HTMLCanvasElement);
      });

      test('should set window mock globally if not exists', () => {
        expect(global.window).toBeUndefined();
        initializeTestMocks();
        expect(global.window).toBeDefined();
        expect(global.window.innerWidth).toBe(1024);
        expect(typeof global.window.addEventListener).toBe('function');
      });

      test('should not overwrite existing document or window', () => {
        const myDoc = { test: 'doc' };
        const myWin = { test: 'win' };
        global.document = myDoc;
        global.window = myWin;
        initializeTestMocks();
        expect(global.document).toBe(myDoc);
        expect(global.window).toBe(myWin);
      });
    });
  });
});
