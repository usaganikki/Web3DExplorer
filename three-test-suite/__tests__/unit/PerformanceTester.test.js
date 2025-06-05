import { jest } from '@jest/globals';

// ES Modules環境でBrowserManagerをモック
jest.unstable_mockModule('../../src/BrowserManager', () => ({
  BrowserManager: jest.fn().mockImplementation(() => ({
    // pageオブジェクトのモック
    page: {
      evaluate: jest.fn()
    },
    // _validateInitializedメソッドのモック
    _validateInitialized: jest.fn(),
    // その他必要なメソッドがあれば追加
    initialize: jest.fn(),
    cleanup: jest.fn()
  }))
}));

describe('PerformanceTester', () => {
  let PerformanceTester;
  let BrowserManager;
  let browserManagerMockInstance;
  let performanceTester;

  beforeAll(async () => {
    // モック設定後に動的インポート
    const performanceTesterModule = await import('../../src/PerformanceTester');
    const browserManagerModule = await import('../../src/BrowserManager');
    
    PerformanceTester = performanceTesterModule.PerformanceTester;
    BrowserManager = browserManagerModule.BrowserManager;
    
    console.log('Imported BrowserManager (mocked):', BrowserManager);
  });

  beforeEach(() => {
    // 各テスト前にモックをクリア
    jest.clearAllMocks();
    
    // 新しいモックインスタンスを作成
    browserManagerMockInstance = new BrowserManager();
    
    console.log('browserManagerMockInstance:', browserManagerMockInstance);
    console.log('page object:', browserManagerMockInstance.page);
    console.log('_validateInitialized:', browserManagerMockInstance._validateInitialized);
    
    performanceTester = new PerformanceTester(browserManagerMockInstance);
  });

  describe('constructor', () => {
    test('should correctly set the browserManager instance', () => {
      expect(performanceTester.browserManager).toBe(browserManagerMockInstance);
    });
  });

  describe('benchmarkWebAssembly', () => {
    test('should return performance data on successful evaluation', async () => {
      const mockPerformanceData = {
        executionTime: 100.5,
        operationsPerSecond: 10000,
        memoryPerformance: 5000,
      };
      
      // モックの戻り値を設定
      browserManagerMockInstance.page.evaluate.mockResolvedValue(mockPerformanceData);

      const result = await performanceTester.benchmarkWebAssembly();
      
      expect(result).toEqual(mockPerformanceData);
      expect(browserManagerMockInstance._validateInitialized).toHaveBeenCalledTimes(1);
      expect(browserManagerMockInstance.page.evaluate).toHaveBeenCalledTimes(1);
      expect(browserManagerMockInstance.page.evaluate).toHaveBeenCalledWith(
        performanceTester._benchmarkWebAssemblyInBrowser
      );
    });

    test('should throw an error if BrowserManager is not initialized', async () => {
      browserManagerMockInstance._validateInitialized.mockImplementation(() => {
        throw new Error('BrowserManager not initialized');
      });

      await expect(performanceTester.benchmarkWebAssembly()).rejects.toThrow(
        'BrowserManager not initialized'
      );
    });

    test('should throw an error if page.evaluate fails', async () => {
      browserManagerMockInstance.page.evaluate.mockRejectedValue(
        new Error('Evaluation failed')
      );

      await expect(performanceTester.benchmarkWebAssembly()).rejects.toThrow(
        'Failed to benchmark WebAssembly: Evaluation failed'
      );
    });
  });

  describe('benchmarkHybridPerformance', () => {
    const mockHybridPerformanceData = {
      wasmComputeTime: 50.25,
      webglRenderTime: 150.75,
      dataTransferTime: 10.5,
      totalTime: 211.5,
      efficiency: 0.714,
      throughput: 100000,
    };

    test('should return hybrid performance data on successful evaluation with default options', async () => {
      browserManagerMockInstance.page.evaluate.mockResolvedValue(mockHybridPerformanceData);

      const result = await performanceTester.benchmarkHybridPerformance();
      
      expect(result).toEqual(mockHybridPerformanceData);
      expect(browserManagerMockInstance._validateInitialized).toHaveBeenCalledTimes(1);
      expect(browserManagerMockInstance.page.evaluate).toHaveBeenCalledTimes(1);
      expect(browserManagerMockInstance.page.evaluate).toHaveBeenCalledWith(
        performanceTester._benchmarkHybridPerformanceInBrowser,
        {} // デフォルトオプション
      );
    });

    test('should return hybrid performance data with custom options', async () => {
      const customOptions = { dataSize: 10000, iterations: 30 };
      browserManagerMockInstance.page.evaluate.mockResolvedValue(mockHybridPerformanceData);

      const result = await performanceTester.benchmarkHybridPerformance(customOptions);
      
      expect(result).toEqual(mockHybridPerformanceData);
      expect(browserManagerMockInstance.page.evaluate).toHaveBeenCalledWith(
        performanceTester._benchmarkHybridPerformanceInBrowser,
        customOptions
      );
    });

    test('should throw an error if BrowserManager is not initialized', async () => {
      browserManagerMockInstance._validateInitialized.mockImplementation(() => {
        throw new Error('BrowserManager not initialized');
      });

      await expect(performanceTester.benchmarkHybridPerformance()).rejects.toThrow(
        'BrowserManager not initialized'
      );
    });

    test('should throw an error if page.evaluate fails', async () => {
      browserManagerMockInstance.page.evaluate.mockRejectedValue(
        new Error('Hybrid evaluation failed')
      );

      await expect(performanceTester.benchmarkHybridPerformance()).rejects.toThrow(
        'Failed to benchmark hybrid performance: Hybrid evaluation failed'
      );
    });
  });
});