import { BrowserManager } from '../BrowserManager.js';

/**
 * テスト用の共通ユーティリティクラス
 * テスト間の独立性を確保し、一貫したセットアップ・クリーンアップを提供
 */
export class TestUtils {
  /**
   * テスト間でのグローバル状態をリセットする
   * @param {Object} page - Puppeteerのpageオブジェクト
   */
  static async resetGlobalState(page) {
    if (!page) {
      throw new Error('Page object is required for resetting global state');
    }

    try {
      await page.evaluate(() => {
        // window オブジェクトから テスト用プロパティを削除
        const testProperties = [
          'cubeRendered', 'sceneReady', 'setupComplete', 'animationComplete',
          'finalRotation', 'webglSupported', 'webglError', 'threeLoaded',
          'threeVersion', 'debugInfo', 'testResults', 'sceneInfo',
          'animationResult', 'shaderTest', 'modelLoaded', 'performanceResults',
          'heavyProcessComplete', 'webglInfo', 'customSceneLoaded',
          'legacyTestComplete', 'sceneObjects', 'sceneAnalysis',
          'userScript', 'scene', 'camera', 'renderer', 'testProperty',
          'testCondition', 'testComplete', 'integrationTestComplete',
          'multiComponentTest', 'testScene', 'sceneBuilt'
        ];

        testProperties.forEach(prop => {
          if (window.hasOwnProperty(prop)) {
            delete window[prop];
          }
        });

        // カスタムイベントリスナーをクリア
        if (window.removeEventListener) {
          // 一般的なテスト用イベントを削除
          ['load', 'DOMContentLoaded', 'resize', 'beforeunload'].forEach(eventType => {
            try {
              // すべてのイベントリスナーを完全に削除するのは困難なため、
              // 新しいページロードで対処する方針
            } catch (e) {
              // イベントリスナー削除でエラーが発生しても続行
            }
          });
        }

        // 動的に追加されたDOMエレメントをクリア
        const dynamicElements = document.querySelectorAll('[data-test-element]');
        dynamicElements.forEach(element => element.remove());

        // Canvasエレメントの状態をリセット
        const canvases = document.querySelectorAll('canvas');
        canvases.forEach(canvas => {
          const context = canvas.getContext('2d') || canvas.getContext('webgl') || canvas.getContext('webgl2');
          if (context && context.clear) {
            try {
              context.clear(context.COLOR_BUFFER_BIT | context.DEPTH_BUFFER_BIT);
            } catch (e) {
              // WebGLコンテキストクリアでエラーが発生しても続行
            }
          }
        });

        // Three.jsオブジェクトの参照をクリア
        if (window.THREE) {
          // グローバルなThree.jsオブジェクトの参照をクリア
          ['scene', 'camera', 'renderer', 'controls'].forEach(prop => {
            if (window[prop]) {
              try {
                if (typeof window[prop].dispose === 'function') {
                  window[prop].dispose();
                }
                delete window[prop];
              } catch (e) {
                // dispose失敗時も続行
                delete window[prop];
              }
            }
          });
        }
      });
    } catch (error) {
      // グローバル状態リセットでエラーが発生しても、テストを続行する
      console.warn('Global state reset failed:', error.message);
    }
  }

  /**
   * ブラウザインスタンスを独立して作成し、適切にセットアップする
   * @param {Object} options - BrowserManagerのオプション
   * @returns {BrowserManager} 設定済みのBrowserManagerインスタンス
   */
  static async createIsolatedBrowserInstance(options = {}) {
    const defaultOptions = {
      headless: true,
      width: 1024,
      height: 768,
      args: [
        '--enable-webgl',
        '--disable-web-security',
        '--disable-dev-shm-usage',
        '--no-sandbox',
        // 各テストで独立したプロセスを使用
        '--disable-extensions-except',
        '--disable-extensions',
        // メモリ使用量を抑制
        '--memory-pressure-off',
        '--max_old_space_size=4096'
      ]
    };

    const mergedOptions = { ...defaultOptions, ...options };
    const browserManager = new BrowserManager(mergedOptions);
    
    await browserManager.initialize();
    
    // 初期状態でのグローバル状態をクリア
    await TestUtils.resetGlobalState(browserManager.page);
    
    return browserManager;
  }

  /**
   * 非同期処理を安全に待機し、タイムアウト・リトライ機能を提供
   * @param {Function} condition - 待機する条件を返す関数
   * @param {Object} options - オプション設定
   * @returns {Promise} 条件が満たされた時点で解決
   */
  static async waitForCondition(page, condition, options = {}) {
    const {
      timeout = 10000,
      interval = 100,
      retries = 3,
      errorMessage = 'Condition not met within timeout'
    } = options;

    let attempt = 0;
    
    while (attempt < retries) {
      try {
        await page.waitForFunction(condition, { 
          timeout: timeout / retries,
          polling: interval 
        });
        return; // 成功時は即座に返る
      } catch (error) {
        attempt++;
        if (attempt >= retries) {
          throw new Error(`${errorMessage} (after ${retries} attempts): ${error.message}`);
        }
        
        // リトライ前に短時間待機
        await new Promise(resolve => setTimeout(resolve, interval));
      }
    }
  }

  /**
   * 統一的なテストセットアップヘルパー
   * beforeEach で使用することを想定
   * @param {Object} options - セットアップオプション
   * @returns {Object} セットアップされたテスト環境
   */
  static async setupTest(options = {}) {
    const {
      browserOptions = {},
      resetGlobalState = true,
      timeout = 30000
    } = options;

    try {
      const browserManager = await TestUtils.createIsolatedBrowserInstance(browserOptions);
      
      if (resetGlobalState) {
        await TestUtils.resetGlobalState(browserManager.page);
      }

      // デフォルトのタイムアウトを設定
      if (browserManager.page.setDefaultTimeout) {
        await browserManager.page.setDefaultTimeout(timeout);
      }

      return {
        browserManager,
        page: browserManager.page,
        browser: browserManager.browser
      };
    } catch (error) {
      throw new Error(`Test setup failed: ${error.message}`);
    }
  }

  /**
   * 統一的なテストクリーンアップヘルパー
   * afterEach で使用することを想定
   * @param {Object} testEnvironment - setupTestで作成された環境オブジェクト
   */
  static async cleanupTest(testEnvironment) {
    if (!testEnvironment) {
      return; // 何もしない
    }

    const { browserManager, page } = testEnvironment;

    try {
      // グローバル状態をリセット
      if (page && !page.isClosed()) {
        await TestUtils.resetGlobalState(page);
      }
    } catch (error) {
      console.warn('Global state cleanup failed:', error.message);
    }

    try {
      // ブラウザインスタンスをクリーンアップ
      if (browserManager && browserManager.isInitialized()) {
        await browserManager.cleanup();
      }
    } catch (error) {
      console.warn('Browser cleanup failed:', error.message);
    }

    // プロパティをクリア
    if (testEnvironment.page) {
      testEnvironment.page = null;
    }
    if (testEnvironment.browser) {
      testEnvironment.browser = null;
    }
    if (testEnvironment.browserManager) {
      testEnvironment.browserManager = null;
    }
  }

  /**
   * エラー耐性のあるクリーンアップ処理
   * 複数のクリーンアップ処理を順番に実行し、エラーが発生しても続行
   * @param {Array<Function>} cleanupFunctions - クリーンアップ関数の配列
   */
  static async safeCleanup(...cleanupFunctions) {
    const errors = [];

    for (const cleanupFn of cleanupFunctions) {
      try {
        if (typeof cleanupFn === 'function') {
          await cleanupFn();
        }
      } catch (error) {
        errors.push(error);
        console.warn('Cleanup function failed:', error.message);
      }
    }

    // エラーが発生したが、すべてのクリーンアップを試行した
    if (errors.length > 0) {
      console.warn(`${errors.length} cleanup errors occurred, but all cleanup attempts were made`);
    }
  }

  /**
   * テスト用のランダムポート生成
   * 複数のテストが同時実行される際のポート競合を回避
   * @param {number} min - 最小ポート番号
   * @param {number} max - 最大ポート番号
   * @returns {number} ランダムなポート番号
   */
  static generateRandomPort(min = 8000, max = 9999) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Three.js固有のテスト前準備
   * Three.jsオブジェクトの正常性を確認
   * @param {Object} page - Puppeteerページオブジェクト
   */
  static async ensureThreeJsReady(page) {
    try {
      await TestUtils.waitForCondition(
        page,
        'typeof THREE !== "undefined" && THREE.Scene && THREE.WebGLRenderer',
        {
          timeout: 15000,
          interval: 200,
          retries: 3,
          errorMessage: 'Three.js failed to load properly'
        }
      );

      // Three.jsの基本オブジェクトが利用可能であることを確認
      const threeJsReady = await page.evaluate(() => {
        return typeof THREE !== 'undefined' &&
               typeof THREE.Scene === 'function' &&
               typeof THREE.WebGLRenderer === 'function' &&
               typeof THREE.PerspectiveCamera === 'function';
      });

      if (!threeJsReady) {
        throw new Error('Three.js core objects are not available');
      }
    } catch (error) {
      throw new Error(`Three.js readiness check failed: ${error.message}`);
    }
  }
}

/**
 * よく使用されるテストパターンのためのヘルパー関数群
 */
export class TestPatterns {
  /**
   * 標準的なBrowserManagerテストパターン
   * @param {Function} testFunction - 実際のテスト関数
   * @param {Object} options - オプション
   */
  static async withBrowserManager(testFunction, options = {}) {
    const testEnv = await TestUtils.setupTest(options);
    
    try {
      await testFunction(testEnv.browserManager, testEnv.page);
    } finally {
      await TestUtils.cleanupTest(testEnv);
    }
  }

  /**
   * Three.jsシーンを使用するテストパターン
   * @param {Function} sceneBuilder - Three.jsシーンを構築する関数
   * @param {Function} testFunction - テスト関数
   * @param {Object} options - オプション
   */
  static async withThreeJsScene(sceneBuilder, testFunction, options = {}) {
    const testEnv = await TestUtils.setupTest(options);
    
    try {
      // HTMLGeneratorを使用してThree.js環境を構築
      const { HTMLGenerator } = await import('../HTMLGenerator.js');
      const htmlGenerator = new HTMLGenerator();
      
      const html = htmlGenerator.generateTestHTML(sceneBuilder);
      await testEnv.page.setContent(html);
      
      // Three.jsの準備を確認
      await TestUtils.ensureThreeJsReady(testEnv.page);
      
      // テストを実行
      await testFunction(testEnv.browserManager, testEnv.page);
    } finally {
      await TestUtils.cleanupTest(testEnv);
    }
  }
}