/**
 * 統合テスト用のヘルパーユーティリティ
 * Phase2で作成したモックとデータジェネレーターを統合し、
 * テスト間の完全な独立性を確保する
 */

import MockBrowserManager from '../mocks/MockBrowserManager.js';
import { TestDataGenerator, testDataFactory } from '../utils/TestDataGenerator.js';
import { initializeTestMocks, setupWebGLMocks } from '../mocks/MockWebGL.js';

/**
 * テスト独立性確保のためのヘルパークラス
 */
class TestIsolationHelper {
  constructor(testName = 'default', options = {}) {
    this.testName = testName;
    this.options = {
      seed: Date.now() + Math.random(),
      autoCleanup: true,
      enablePerformanceTracking: false,
      enableResourceTracking: true,
      ...options
    };
    
    this.dataGenerator = new TestDataGenerator(this.options.seed);
    this.browserManager = null;
    this.resourceTracker = new ResourceTracker();
    this.performanceTracker = new PerformanceTracker();
    this.isSetup = false;
  }

  /**
   * テスト環境のセットアップ
   */
  async setup() {
    if (this.isSetup) {
      throw new Error('TestIsolationHelper already setup');
    }

    // モック環境の初期化
    initializeTestMocks();
    
    // ブラウザマネージャーの作成
    const testConfig = this.dataGenerator.generateTestSuiteConfig(this.testName);
    this.browserManager = new MockBrowserManager(testConfig.viewport);
    
    await this.browserManager.initialize();
    
    // リソース追跡の開始
    if (this.options.enableResourceTracking) {
      this.resourceTracker.startTracking();
    }
    
    // パフォーマンス追跡の開始
    if (this.options.enablePerformanceTracking) {
      this.performanceTracker.startTracking();
    }
    
    this.isSetup = true;
    return this;
  }

  /**
   * テスト環境のクリーンアップ
   */
  async cleanup() {
    if (!this.isSetup) {
      return;
    }

    try {
      // パフォーマンス追跡の停止
      if (this.options.enablePerformanceTracking) {
        this.performanceTracker.stopTracking();
      }
      
      // リソース追跡の停止
      if (this.options.enableResourceTracking) {
        this.resourceTracker.stopTracking();
      }
      
      // ブラウザマネージャーのクリーンアップ
      if (this.browserManager) {
        await this.browserManager.cleanup();
        this.browserManager = null;
      }
      
      // データジェネレーターのリセット
      this.dataGenerator.resetCounters();
      
    } finally {
      this.isSetup = false;
    }
  }

  /**
   * Three.jsシーンのテスト用HTMLを生成
   */
  generateThreeJSTestHTML(sceneSetupFunction, options = {}) {
    if (!this.isSetup) {
      throw new Error('TestIsolationHelper not setup. Call setup() first.');
    }

    const config = {
      threeJsVersion: 'r128',
      title: `Three.js Test - ${this.testName}`,
      autoExecute: true,
      enableWebGL: true,
      ...options
    };

    const sceneScript = sceneSetupFunction.toString();
    
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${config.title}</title>
        <style>
          body { margin: 0; padding: 0; overflow: hidden; background: #000; }
          canvas { display: block; width: 100vw; height: 100vh; }
        </style>
      </head>
      <body>
        <canvas id="three-canvas"></canvas>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/${config.threeJsVersion}/three.min.js"></script>
        <script>
          // テスト独立性確保のための初期化
          window.testIsolation = {
            testName: '${this.testName}',
            seed: ${this.options.seed},
            startTime: performance.now()
          };
          
          // WebGLコンテキストの初期化確認
          function ensureWebGLContext() {
            const canvas = document.getElementById('three-canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            if (!gl) {
              throw new Error('WebGL not supported');
            }
            return gl;
          }
          
          // Three.js環境の確認
          function ensureThreeJS() {
            if (typeof THREE === 'undefined') {
              throw new Error('THREE.js not loaded');
            }
            return THREE;
          }
          
          ${config.autoExecute ? `
            window.addEventListener('load', function() {
              try {
                ensureWebGLContext();
                ensureThreeJS();
                
                // ユーザー定義のシーンセットアップ関数を実行
                (${sceneScript})();
                
                window.testIsolation.endTime = performance.now();
                window.testIsolation.duration = window.testIsolation.endTime - window.testIsolation.startTime;
                window.testIsolation.success = true;
                
              } catch (error) {
                window.testIsolation.error = error.message;
                window.testIsolation.success = false;
                console.error('Test execution error:', error);
              }
            });
          ` : ''}
        </script>
      </body>
      </html>
    `;
  }

  /**
   * テストデータの生成
   */
  generateTestData(type, complexity = 'medium') {
    switch (type) {
      case 'scene':
        return this.dataGenerator.generateSceneData(complexity);
      case 'mesh':
        return this.dataGenerator.generateMeshData();
      case 'material':
        return this.dataGenerator.generateMaterialData();
      case 'geometry':
        return this.dataGenerator.generateGeometryData();
      case 'light':
        return this.dataGenerator.generateLightData();
      case 'camera':
        return this.dataGenerator.generateCameraData();
      case 'texture':
        return this.dataGenerator.generateTextureData();
      case 'performance':
        return this.dataGenerator.generatePerformanceTestData();
      case 'error':
        return this.dataGenerator.generateErrorTestData();
      default:
        throw new Error(`Unknown test data type: ${type}`);
    }
  }

  /**
   * ページでのスクリプト実行
   */
  async executeScript(script) {
    if (!this.browserManager || !this.browserManager.page) {
      throw new Error('Browser manager not initialized');
    }

    return await this.browserManager.page.evaluate(script);
  }

  /**
   * テスト結果の取得
   */
  async getTestResult() {
    return await this.executeScript(() => window.testIsolation);
  }

  /**
   * リソース使用状況の取得
   */
  getResourceUsage() {
    return this.resourceTracker.getUsage();
  }

  /**
   * パフォーマンス情報の取得
   */
  getPerformanceInfo() {
    return this.performanceTracker.getInfo();
  }

  /**
   * テストの状態をアサート
   */
  async assertTestState(expectations = {}) {
    const result = await this.getTestResult();
    
    if (expectations.shouldSucceed !== false && !result.success) {
      throw new Error(`Test failed: ${result.error}`);
    }
    
    if (expectations.maxDuration && result.duration > expectations.maxDuration) {
      throw new Error(`Test took too long: ${result.duration}ms > ${expectations.maxDuration}ms`);
    }
    
    if (expectations.minDuration && result.duration < expectations.minDuration) {
      throw new Error(`Test completed too quickly: ${result.duration}ms < ${expectations.minDuration}ms`);
    }
    
    return result;
  }
}

/**
 * リソース使用状況の追跡
 */
class ResourceTracker {
  constructor() {
    this.isTracking = false;
    this.startSnapshot = null;
    this.usage = {
      browserInstances: 0,
      memoryEstimate: 0,
      startTime: null,
      endTime: null
    };
  }

  startTracking() {
    this.isTracking = true;
    this.startSnapshot = {
      browserInstances: MockBrowserManager.getActiveInstanceCount(),
      timestamp: Date.now()
    };
    this.usage.startTime = this.startSnapshot.timestamp;
  }

  stopTracking() {
    if (!this.isTracking) return;
    
    this.usage.endTime = Date.now();
    this.usage.browserInstances = MockBrowserManager.getActiveInstanceCount() - this.startSnapshot.browserInstances;
    this.usage.memoryEstimate = this.estimateMemoryUsage();
    this.isTracking = false;
  }

  estimateMemoryUsage() {
    // メモリ使用量の簡易推定（モック環境）
    const activeInstances = MockBrowserManager.getActiveInstanceCount();
    return activeInstances * 50; // 1インスタンスあたり約50MBと仮定
  }

  getUsage() {
    return { ...this.usage };
  }
}

/**
 * パフォーマンス情報の追跡
 */
class PerformanceTracker {
  constructor() {
    this.isTracking = false;
    this.metrics = {
      startTime: null,
      endTime: null,
      duration: null,
      cpuUsage: [],
      memorySnapshots: [],
      frameTimings: []
    };
  }

  startTracking() {
    this.isTracking = true;
    this.metrics.startTime = performance.now();
    
    // パフォーマンス監視の開始（モック環境では簡易実装）
    this.monitoringInterval = setInterval(() => {
      if (this.isTracking) {
        this.collectMetrics();
      }
    }, 100);
  }

  stopTracking() {
    if (!this.isTracking) return;
    
    this.metrics.endTime = performance.now();
    this.metrics.duration = this.metrics.endTime - this.metrics.startTime;
    this.isTracking = false;
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  collectMetrics() {
    const now = performance.now();
    
    // CPU使用率の簡易推定（モック環境）
    this.metrics.cpuUsage.push({
      timestamp: now,
      usage: Math.random() * 100 // 0-100%のランダム値
    });
    
    // メモリ使用量の簡易推定
    this.metrics.memorySnapshots.push({
      timestamp: now,
      used: MockBrowserManager.getActiveInstanceCount() * 50,
      total: 1000 // 1GB仮定
    });
    
    // フレームタイミングの記録
    this.metrics.frameTimings.push({
      timestamp: now,
      frameTime: 16.67 + (Math.random() - 0.5) * 2 // 60fps ± 1ms
    });
  }

  getInfo() {
    return {
      ...this.metrics,
      averageCpuUsage: this.calculateAverage(this.metrics.cpuUsage, 'usage'),
      averageMemoryUsage: this.calculateAverage(this.metrics.memorySnapshots, 'used'),
      averageFrameTime: this.calculateAverage(this.metrics.frameTimings, 'frameTime')
    };
  }

  calculateAverage(array, property) {
    if (array.length === 0) return 0;
    const sum = array.reduce((acc, item) => acc + item[property], 0);
    return sum / array.length;
  }
}

/**
 * テスト用のファクトリー関数
 */
function createTestIsolation(testName, options = {}) {
  return new TestIsolationHelper(testName, options);
}

/**
 * Jest用のセットアップ・クリーンアップヘルパー
 */
function setupTestIsolation(describe, beforeEach, afterEach) {
  let testHelper;

  beforeEach(async () => {
    testHelper = createTestIsolation(expect.getState().currentTestName);
    await testHelper.setup();
  });

  afterEach(async () => {
    if (testHelper) {
      await testHelper.cleanup();
      testHelper = null;
    }
  });

  return () => testHelper;
}

/**
 * Three.jsオブジェクトの検証ヘルパー
 */
class ThreeJSTestValidator {
  static async validateScene(browserManager, expectations = {}) {
    const result = await browserManager.page.evaluate(() => {
      if (!window.THREE || !window.testScene) {
        return { error: 'Scene not found' };
      }

      const scene = window.testScene;
      return {
        type: scene.type,
        childrenCount: scene.children.length,
        objects: scene.children.map(child => ({
          type: child.type,
          name: child.name,
          visible: child.visible,
          position: child.position,
          rotation: child.rotation,
          scale: child.scale
        }))
      };
    });

    if (result.error) {
      throw new Error(result.error);
    }

    if (expectations.minObjects && result.childrenCount < expectations.minObjects) {
      throw new Error(`Expected at least ${expectations.minObjects} objects, got ${result.childrenCount}`);
    }

    if (expectations.maxObjects && result.childrenCount > expectations.maxObjects) {
      throw new Error(`Expected at most ${expectations.maxObjects} objects, got ${result.childrenCount}`);
    }

    if (expectations.exactObjects && result.childrenCount !== expectations.exactObjects) {
      throw new Error(`Expected exactly ${expectations.exactObjects} objects, got ${result.childrenCount}`);
    }

    return result;
  }

  static async validateRenderer(browserManager, expectations = {}) {
    const result = await browserManager.page.evaluate(() => {
      if (!window.THREE || !window.testRenderer) {
        return { error: 'Renderer not found' };
      }

      const renderer = window.testRenderer;
      return {
        type: renderer.type,
        domElement: {
          width: renderer.domElement.width,
          height: renderer.domElement.height
        },
        info: renderer.info
      };
    });

    if (result.error) {
      throw new Error(result.error);
    }

    if (expectations.minWidth && result.domElement.width < expectations.minWidth) {
      throw new Error(`Canvas width too small: ${result.domElement.width} < ${expectations.minWidth}`);
    }

    if (expectations.minHeight && result.domElement.height < expectations.minHeight) {
      throw new Error(`Canvas height too small: ${result.domElement.height} < ${expectations.minHeight}`);
    }

    return result;
  }

  static async validateWebGLContext(browserManager) {
    const result = await browserManager.page.evaluate(() => {
      const canvas = document.getElementById('three-canvas') || document.querySelector('canvas');
      if (!canvas) {
        return { error: 'Canvas not found' };
      }

      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        return { error: 'WebGL context not available' };
      }

      return {
        vendor: gl.getParameter(gl.VENDOR),
        renderer: gl.getParameter(gl.RENDERER),
        version: gl.getParameter(gl.VERSION),
        extensions: gl.getSupportedExtensions()
      };
    });

    if (result.error) {
      throw new Error(result.error);
    }

    return result;
  }
}

/**
 * テストデータの整合性検証
 */
class TestDataValidator {
  static validateTestDataIntegrity(testData) {
    const errors = [];

    try {
      // 基本構造の検証
      if (!testData || typeof testData !== 'object') {
        errors.push('Test data must be an object');
        return errors;
      }

      // IDの一意性検証
      const ids = new Set();
      const checkIds = (obj, path = '') => {
        if (obj && typeof obj === 'object') {
          if (obj.id) {
            if (ids.has(obj.id)) {
              errors.push(`Duplicate ID found: ${obj.id} at ${path}`);
            } else {
              ids.add(obj.id);
            }
          }

          Object.keys(obj).forEach(key => {
            if (Array.isArray(obj[key])) {
              obj[key].forEach((item, index) => {
                checkIds(item, `${path}.${key}[${index}]`);
              });
            } else if (typeof obj[key] === 'object') {
              checkIds(obj[key], `${path}.${key}`);
            }
          });
        }
      };

      checkIds(testData);

      // 数値範囲の検証
      const validateNumericRanges = (obj) => {
        if (obj && typeof obj === 'object') {
          Object.keys(obj).forEach(key => {
            const value = obj[key];
            
            if (typeof value === 'number') {
              if (key.includes('color') && (value < 0 || value > 0xffffff)) {
                errors.push(`Invalid color value: ${value} at ${key}`);
              }
              if (key.includes('opacity') && (value < 0 || value > 1)) {
                errors.push(`Invalid opacity value: ${value} at ${key}`);
              }
              if (key.includes('intensity') && value < 0) {
                errors.push(`Invalid intensity value: ${value} at ${key}`);
              }
            } else if (typeof value === 'object') {
              validateNumericRanges(value);
            } else if (Array.isArray(value)) {
              value.forEach(item => validateNumericRanges(item));
            }
          });
        }
      };

      validateNumericRanges(testData);

    } catch (error) {
      errors.push(`Validation error: ${error.message}`);
    }

    return errors;
  }

  static async validateTestExecution(testResult) {
    const errors = [];

    if (!testResult) {
      errors.push('Test result is null or undefined');
      return errors;
    }

    if (testResult.success === false && !testResult.error) {
      errors.push('Test failed but no error message provided');
    }

    if (testResult.duration && testResult.duration < 0) {
      errors.push('Invalid test duration: negative value');
    }

    if (testResult.startTime && testResult.endTime && testResult.endTime < testResult.startTime) {
      errors.push('Invalid timing: end time before start time');
    }

    return errors;
  }
}

/**
 * エクスポート
 */
export {
  TestIsolationHelper,
  ResourceTracker,
  PerformanceTracker,
  ThreeJSTestValidator,
  TestDataValidator,
  createTestIsolation,
  setupTestIsolation
};

// デフォルトエクスポート
export default TestIsolationHelper;
