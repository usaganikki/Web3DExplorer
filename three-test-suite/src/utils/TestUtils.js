import MockBrowserManager from '../mocks/MockBrowserManager.js';

/**
 * テスト用の共通ユーティリティクラス
 * テスト間の独立性を確保し、一貫したセットアップ・クリーンアップを提供
 * MockBrowserManagerを使用して高速で独立したテスト環境を提供
 */
export class TestUtils {
  /**
   * テスト間でのグローバル状態をリセットする
   * @param {Object} page - MockBrowserManagerのpageオブジェクト
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
          'multiComponentTest', 'testScene', 'sceneBuilt', 'testId',
          'uniqueValue', 'testExecuted', 'integrationTest'
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

      // MockBrowserManagerのグローバルプロパティもクリア
      if (page._mockBrowserManager && typeof page._mockBrowserManager.clearGlobalProperties === 'function') {
        page._mockBrowserManager.clearGlobalProperties();
      }
    } catch (error) {
      // グローバル状態リセットでエラーが発生しても、テストを続行する
      console.warn('Global state reset failed:', error.message);
    }
  }

  /**
   * ブラウザインスタンスを独立して作成し、適切にセットアップする
   * MockBrowserManagerを使用して高速で独立したテスト環境を提供
   * @param {Object} options - MockBrowserManagerのオプション
   * @returns {MockBrowserManager} 設定済みのMockBrowserManagerインスタンス
   */
  static async createIsolatedBrowserInstance(options = {}) {
    const defaultOptions = {
      headless: true,
      width: 1024,
      height: 768,
      // MockBrowserManagerでは実際のPuppeteer引数は不要だが、
      // 互換性のため保持
      args: [
        '--enable-webgl',
        '--disable-web-security',
        '--disable-dev-shm-usage',
        '--no-sandbox',
        '--disable-extensions-except',
        '--disable-extensions',
        '--memory-pressure-off',
        '--max_old_space_size=4096'
      ]
    };

    const mergedOptions = { ...defaultOptions, ...options };
    const browserManager = new MockBrowserManager(mergedOptions);
    
    await browserManager.initialize();
    
    // MockBrowserManagerとページの相互参照を設定
    if (browserManager.page) {
      browserManager.page._mockBrowserManager = browserManager;
    }
    
    // 初期状態でのグローバル状態をクリア
    await TestUtils.resetGlobalState(browserManager.page);
    
    return browserManager;
  }

  /**
   * 非同期処理を安全に待機し、タイムアウト・リトライ機能を提供
   * MockBrowserManagerに最適化されたバージョン
   * @param {Object} page - MockBrowserManagerのpageオブジェクト
   * @param {Function|string} condition - 待機する条件を返す関数または文字列
   * @param {Object} options - オプション設定
   * @returns {Promise} 条件が満たされた時点で解決
   */
  static async waitForCondition(page, condition, options = {}) {
    const {
      timeout = 5000,  // MockBrowserManagerでは短縮
      interval = 50,   // MockBrowserManagerでは短縮
      retries = 3,
      errorMessage = 'Condition not met within timeout'
    } = options;

    let attempt = 0;
    const timeoutPerAttempt = Math.floor(timeout / retries);
    
    while (attempt < retries) {
      try {
        // 文字列の場合と関数の場合で処理を分ける
        if (typeof condition === 'string') {
          await page.waitForFunction(condition, { 
            timeout: timeoutPerAttempt,
            polling: interval 
          });
        } else if (typeof condition === 'function') {
          await page.waitForFunction(condition, { 
            timeout: timeoutPerAttempt,
            polling: interval 
          });
        } else {
          throw new Error('Condition must be a function or string');
        }
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
      timeout = 5000  // MockBrowserManagerでは短縮
    } = options;

    try {
      const browserManager = await TestUtils.createIsolatedBrowserInstance(browserOptions);
      
      if (resetGlobalState) {
        await TestUtils.resetGlobalState(browserManager.page);
      }

      // MockBrowserManagerではsetDefaultTimeoutは不要だが、互換性のため保持
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
      // MockBrowserManagerではisInitialized()ではなくisInitializedプロパティ
      if (browserManager && browserManager.isInitialized) {
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
   * MockBrowserManagerに最適化されたThree.jsオブジェクトの正常性確認
   * @param {Object} page - MockBrowserManagerページオブジェクト
   */
  static async ensureThreeJsReady(page) {
    try {
      // MockBrowserManagerでは高速に条件が満たされる
      await TestUtils.waitForCondition(
        page,
        'typeof THREE !== "undefined" && THREE.Scene && THREE.WebGLRenderer',
        {
          timeout: 2000,  // 短縮
          interval: 50,   // 短縮
          retries: 2,     // 短縮
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
        // MockBrowserManagerでは基本的に成功するが、念のためチェック
        console.warn('Three.js core objects may not be fully available in mock environment');
      }
    } catch (error) {
      // MockBrowserManagerでは基本的にエラーにならないが、互換性のため保持
      console.warn(`Three.js readiness check warning: ${error.message}`);
    }
  }

  /**
   * MockBrowserManager特有のヘルパーメソッド
   * グローバルプロパティの設定・取得
   */
  static setMockGlobalProperty(browserManager, name, value) {
    if (browserManager && typeof browserManager.setGlobalProperty === 'function') {
      browserManager.setGlobalProperty(name, value);
    }
  }

  static getMockGlobalProperty(browserManager, name) {
    if (browserManager && typeof browserManager.getGlobalProperty === 'function') {
      return browserManager.getGlobalProperty(name);
    }
    return undefined;
  }

  /**
   * MockBrowserManagerの全インスタンスをクリーンアップ
   * テスト間の完全な独立性を確保
   */
  static async cleanupAllMockInstances() {
    if (MockBrowserManager && typeof MockBrowserManager.cleanupAll === 'function') {
      await MockBrowserManager.cleanupAll();
    }
  }
}

/**
 * よく使用されるテストパターンのためのヘルパー関数群
 * MockBrowserManagerに最適化されたバージョン
 */
export class TestPatterns {
  /**
   * 標準的なMockBrowserManagerテストパターン
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
   * MockBrowserManagerでの高速Three.js環境構築
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
      
      // MockBrowserManagerでの高速Three.js準備確認
      await TestUtils.ensureThreeJsReady(testEnv.page);
      
      // テストを実行
      await testFunction(testEnv.browserManager, testEnv.page);
    } finally {
      await TestUtils.cleanupTest(testEnv);
    }
  }

  /**
   * MockBrowserManager特有の並列テストパターン
   * 複数のテストを独立して並列実行
   * @param {Array<Function>} testFunctions - 並列実行するテスト関数の配列
   * @param {Object} options - オプション
   */
  static async withParallelTests(testFunctions, options = {}) {
    const testPromises = testFunctions.map(async (testFn) => {
      const testEnv = await TestUtils.setupTest(options);
      try {
        return await testFn(testEnv.browserManager, testEnv.page);
      } finally {
        await TestUtils.cleanupTest(testEnv);
      }
    });

    try {
      return await Promise.all(testPromises);
    } finally {
      // 全てのMockBrowserManagerインスタンスをクリーンアップ
      await TestUtils.cleanupAllMockInstances();
    }
  }
}