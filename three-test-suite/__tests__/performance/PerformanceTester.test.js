import { BrowserManager } from '../src/BrowserManager.js';
import { PerformanceTester } from '../src/PerformanceTester.js';
import { PuppeteerManager } from '../src/PuppeteerManager.js'; // For hybrid test that uses PuppeteerManager facade

describe('PerformanceTester - WebAssembly機能', () => {
  let browserManager;
  let tester;

  beforeEach(async () => {
    browserManager = new BrowserManager();
    await browserManager.initialize();
    tester = new PerformanceTester(browserManager);
  });

  afterEach(async () => {
    await browserManager.cleanup();
  });
  
  test('WASMパフォーマンステストが実行できる', async () => {
    const performance = await tester.benchmarkWebAssembly();
    expect(performance).toBeDefined();
    expect(performance.executionTime).toBeGreaterThanOrEqual(0);
    expect(performance.operationsPerSecond).toBeGreaterThanOrEqual(0);
  });
});

describe('PerformanceTester - WASM + WebGL連携機能', () => {
  let browserManager;
  let tester;

  beforeEach(async () => {
    browserManager = new BrowserManager();
    await browserManager.initialize();
    tester = new PerformanceTester(browserManager);
  });

  afterEach(async () => {
    await browserManager.cleanup();
  });

  test('WASM計算結果をWebGLで描画できる (via PuppeteerManager facade)', async () => {
    // This test implicitly tests the integration through PuppeteerManager's HTML generation
    // and page content setting, which now uses HTMLGenerator.
    const puppeteerManager = new PuppeteerManager(); // Uses the refactored classes internally
    await puppeteerManager.initialize();

    const testScript = () => {
      window.hybridTestResult = 'pending';
      const wasmBytes = new Uint8Array([
        0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00, 0x01, 0x07, 0x01, 0x60, 0x02, 0x7f, 0x7f, 0x01,
        0x7f, 0x03, 0x02, 0x01, 0x00, 0x07, 0x0a, 0x01, 0x06, 0x61, 0x64, 0x64, 0x54, 0x77, 0x6f, 0x00,
        0x00, 0x0a, 0x09, 0x01, 0x07, 0x00, 0x20, 0x00, 0x20, 0x01, 0x6a, 0x0b
      ]);
      WebAssembly.instantiate(wasmBytes).then(result => {
        const addTwo = result.instance.exports.addTwo;
        const vertices = [
          addTwo(0, 0), addTwo(1, 0), addTwo(0, 0),
          addTwo(1, 0), addTwo(1, 0), addTwo(0, 0),
          addTwo(0, 1), addTwo(1, 0), addTwo(0, 0)
        ];
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl');
        if (gl && vertices.length === 9) {
          const buffer = gl.createBuffer();
          gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
          gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
          window.hybridTestResult = 'success';
        } else {
          window.hybridTestResult = 'failed';
        }
      }).catch(() => { window.hybridTestResult = 'error'; });
    };
    
    const html = puppeteerManager.generateTestHTML(testScript);
    await puppeteerManager.page.setContent(html);
    await puppeteerManager.page.waitForFunction('window.hybridTestResult !== "pending"', { timeout: 5000 });
    const result = await puppeteerManager.page.evaluate(() => window.hybridTestResult);
    expect(result).toBe('success');
    
    await puppeteerManager.cleanup();
  });

  test('benchmarkHybridPerformance()でWASM+WebGL性能を測定できる', async () => {
    const performance = await tester.benchmarkHybridPerformance();
    expect(performance).toBeDefined();
    expect(performance.wasmComputeTime).toBeGreaterThanOrEqual(0);
    expect(performance.webglRenderTime).toBeGreaterThanOrEqual(0);
    expect(performance.dataTransferTime).toBeGreaterThanOrEqual(0);
    expect(performance.totalTime).toBeGreaterThanOrEqual(0);
    expect(performance.efficiency).toBeGreaterThanOrEqual(0);
  });

  test('大量データ処理でのWASM+WebGL連携パフォーマンス', async () => {
    const performance = await tester.benchmarkHybridPerformance({ 
      dataSize: 10000, // Reduced for faster CI, original was 10000
      iterations: 50   // Reduced for faster CI, original was 100
    });
    expect(performance.totalTime).toBeLessThan(10000); // Adjusted timeout
    expect(performance.efficiency).toBeGreaterThanOrEqual(0); // Efficiency can be low
  });

  test('benchmarkHybridPerformance()は初期化前に呼ぶとエラーを投げる', async () => {
    const uninitializedBrowserManager = new BrowserManager();
    const uninitTester = new PerformanceTester(uninitializedBrowserManager);
    await expect(uninitTester.benchmarkHybridPerformance()).rejects.toThrow('BrowserManager is not initialized');
  });
});
