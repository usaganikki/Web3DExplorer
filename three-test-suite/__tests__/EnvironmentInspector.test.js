import { BrowserManager } from '../src/BrowserManager.js';
import { EnvironmentInspector } from '../src/EnvironmentInspector.js';

describe('EnvironmentInspector - WebGL機能', () => {
  let browserManager;

  beforeEach(async () => {
    browserManager = new BrowserManager();
    await browserManager.initialize();
  });

  afterEach(async () => {
    await browserManager.cleanup();
  });

  test('WebGLコンテキストが取得できる', async () => {
    const webglSupported = await browserManager.page.evaluate(() => {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl');
      return gl !== null;
    });
    expect(webglSupported).toBe(true);
  });

  test('WebGL2も利用可能', async () => {
    const webgl2Supported = await browserManager.page.evaluate(() => {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2');
      return gl !== null;
    });
    expect(webgl2Supported).toBe(true);
  });

  test('WebGLの基本情報が取得できる', async () => {
    const webglInfo = await browserManager.page.evaluate(() => {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl');
      if (!gl) return null;
      
      return {
        vendor: gl.getParameter(gl.VENDOR),
        renderer: gl.getParameter(gl.RENDERER),
        version: gl.getParameter(gl.VERSION)
      };
    });
    
    expect(webglInfo).not.toBeNull();
    expect(webglInfo.vendor).toBeDefined();
    expect(webglInfo.renderer).toBeDefined();
    expect(webglInfo.version).toBeDefined();
  });

  test('getWebGLInfo()メソッドでWebGL情報を取得できる', async () => {
    const inspector = new EnvironmentInspector(browserManager);
    const webglInfo = await inspector.getWebGLInfo();
    
    expect(webglInfo).toBeDefined();
    expect(webglInfo.webglSupported).toBe(true);
    expect(webglInfo.webgl2Supported).toBeDefined();
    expect(webglInfo.vendor).toBeDefined();
    expect(webglInfo.renderer).toBeDefined();
    expect(webglInfo.version).toBeDefined();
  });

  test('getWebGLInfo()は初期化前に呼ぶとエラーを投げる', async () => {
    const uninitializedBrowserManager = new BrowserManager();
    // Note: We are not calling initialize()
    const inspector = new EnvironmentInspector(uninitializedBrowserManager);
    await expect(inspector.getWebGLInfo()).rejects.toThrow('BrowserManager is not initialized');
  });
});

describe('EnvironmentInspector - WebAssembly機能', () => {
  let browserManager;
  let inspector;

  beforeEach(async () => {
    browserManager = new BrowserManager();
    await browserManager.initialize();
    inspector = new EnvironmentInspector(browserManager);
  });

  afterEach(async () => {
    await browserManager.cleanup();
  });

  test('WebAssemblyオブジェクトが利用可能', async () => {
    const wasmSupported = await browserManager.page.evaluate(() => {
      return typeof WebAssembly !== 'undefined' && 
             typeof WebAssembly.instantiate === 'function';
    });
    expect(wasmSupported).toBe(true);
  });

  test('WebAssembly.compileStreamingが利用可能', async () => {
    const streamingSupported = await browserManager.page.evaluate(() => {
      return typeof WebAssembly.compileStreaming === 'function';
    });
    expect(streamingSupported).toBe(true);
  });

  test('簡単なWASMモジュールが実行できる', async () => {
    const wasmResult = await browserManager.page.evaluate(() => {
      const wasmBytes = new Uint8Array([
        0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00, 0x01, 0x07, 0x01, 0x60, 0x02, 0x7f, 0x7f, 0x01,
        0x7f, 0x03, 0x02, 0x01, 0x00, 0x07, 0x0a, 0x01, 0x06, 0x61, 0x64, 0x64, 0x54, 0x77, 0x6f, 0x00,
        0x00, 0x0a, 0x09, 0x01, 0x07, 0x00, 0x20, 0x00, 0x20, 0x01, 0x6a, 0x0b
      ]);
      return WebAssembly.instantiate(wasmBytes)
        .then(result => result.instance.exports.addTwo(5, 3));
    });
    expect(wasmResult).toBe(8);
  });

  test('getWebAssemblyInfo()メソッドでWASM情報を取得できる', async () => {
    const wasmInfo = await inspector.getWebAssemblyInfo();
    expect(wasmInfo).toBeDefined();
    expect(wasmInfo.wasmSupported).toBe(true);
    expect(wasmInfo.streamingSupported).toBeDefined();
    // SIMD is not reliably detectable this way, so we check if it's defined.
    // Depending on the environment, it might be false.
    expect(wasmInfo.simdSupported).toBeDefined(); 
  });

  test('getWebAssemblyInfo()は初期化前に呼ぶとエラーを投げる', async () => {
    const uninitializedBrowserManager = new BrowserManager();
    const uninitInspector = new EnvironmentInspector(uninitializedBrowserManager);
    await expect(uninitInspector.getWebAssemblyInfo()).rejects.toThrow('BrowserManager is not initialized');
  });
});

describe('EnvironmentInspector - WASM + WebGL連携機能', () => {
  let browserManager;
  let inspector;

  beforeEach(async () => {
    browserManager = new BrowserManager();
    await browserManager.initialize();
    inspector = new EnvironmentInspector(browserManager);
  });

  afterEach(async () => {
    await browserManager.cleanup();
  });

  test('WebAssemblyとWebGLが同時に利用可能', async () => {
    const capabilities = await inspector.getHybridCapabilities();
    expect(capabilities.wasmSupported).toBe(true);
    expect(capabilities.webglSupported).toBe(true);
    expect(capabilities.hybridReady).toBe(true);
  });
  
  test('getHybridCapabilities()メソッドで連携情報を取得できる', async () => {
    const capabilities = await inspector.getHybridCapabilities();
    expect(capabilities).toBeDefined();
    expect(capabilities.wasmSupported).toBeDefined();
    expect(capabilities.webglSupported).toBeDefined();
    expect(capabilities.hybridReady).toBeDefined();
    expect(capabilities.performanceProfile).toBeDefined();
    expect(capabilities.recommendedStrategy).toBeDefined();
  });

  test('getHybridCapabilities()は初期化前に呼ぶとエラーを投げる', async () => {
    const uninitializedBrowserManager = new BrowserManager();
    const uninitInspector = new EnvironmentInspector(uninitializedBrowserManager);
    await expect(uninitInspector.getHybridCapabilities()).rejects.toThrow('BrowserManager is not initialized');
  });
});
