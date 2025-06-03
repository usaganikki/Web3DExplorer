import { BrowserManager } from './BrowserManager.js';
import { EnvironmentInspector } from './EnvironmentInspector.js';
import { PerformanceTester } from './PerformanceTester.js';
import { HTMLGenerator } from './HTMLGenerator.js';

/**
 * PuppeteerManager
 * Three.js テスト用のPuppeteer関連機能を統括するクラス
 */
export class PuppeteerManager {
  /**
   * @param {Object} options - 設定オプション
   */
  constructor(options = {}) {
    this.browserManager = new BrowserManager(options);
    this.environmentInspector = new EnvironmentInspector(this.browserManager);
    this.performanceTester = new PerformanceTester(this.browserManager);
    this.htmlGenerator = new HTMLGenerator();
  }

  /**
   * Puppeteerブラウザを初期化する
   */
  async initialize() {
    await this.browserManager.initialize();
  }

  /**
   * ブラウザを終了し、リソースをクリーンアップする
   */
  async cleanup() {
    await this.browserManager.cleanup();
  }

  /**
   * ブラウザが初期化されているかチェック
   * @returns {boolean} 初期化状態
   */
  isInitialized() {
    return this.browserManager.isInitialized();
  }

  /**
   * pageオブジェクトを取得する
   * @returns {import('puppeteer').Page | null} PuppeteerのPageオブジェクト
   */
  get page() {
    return this.browserManager.page;
  }
  
  /**
   * browserオブジェクトを取得する
   * @returns {import('puppeteer').Browser | null} PuppeteerのBrowserオブジェクト
   */
  get browser() {
    return this.browserManager.browser;
  }

  /**
   * optionsオブジェクトを取得する
   * @returns {Object} 設定オプション
   */
  get options() {
    return this.browserManager.options;
  }


  /**
   * WebGLの情報と対応状況を取得する
   * @returns {Promise<import('./EnvironmentInspector').WebGLInfo>} WebGL情報オブジェクト
   */
  async getWebGLInfo() {
    return this.environmentInspector.getWebGLInfo();
  }

  /**
   * WebAssemblyの情報と対応状況を取得する
   * @returns {Promise<import('./EnvironmentInspector').WebAssemblyInfo>} WebAssembly情報オブジェクト
   */
  async getWebAssemblyInfo() {
    return this.environmentInspector.getWebAssemblyInfo();
  }

  /**
   * WebAssemblyのパフォーマンステストを実行する
   * @returns {Promise<import('./PerformanceTester').WebAssemblyPerformance>} パフォーマンス情報オブジェクト
   */
  async benchmarkWebAssembly() {
    return this.performanceTester.benchmarkWebAssembly();
  }

  /**
   * WebAssemblyとWebGLの連携機能情報を取得する
   * @returns {Promise<import('./EnvironmentInspector').HybridCapabilities>} 連携機能情報オブジェクト
   */
  async getHybridCapabilities() {
    return this.environmentInspector.getHybridCapabilities();
  }

  /**
   * WebAssemblyとWebGLの連携パフォーマンステストを実行する
   * @param {Object} options - テストオプション
   * @returns {Promise<import('./PerformanceTester').HybridPerformance>} パフォーマンス情報オブジェクト
   */
  async benchmarkHybridPerformance(options = {}) {
    return this.performanceTester.benchmarkHybridPerformance(options);
  }

  /**
   * Three.js用のHTMLテンプレートを生成する
   * @param {Function} userScript - ページに注入するユーザースクリプト
   * @param {Object} options - テンプレート生成オプション
   * @returns {string} 生成されたHTMLコンテンツ
   */
  generateTestHTML(userScript, options = {}) {
    return this.htmlGenerator.generateTestHTML(userScript, options);
  }

  /**
   * Three.jsシーンをロードし、指定されたセットアップ関数を実行する
   * @param {Function} sceneBuilderFunction - Three.jsのシーンをセットアップする関数
   * @param {Object} options - ロードオプション (title, threeJsVersion, timeoutなど)
   * @returns {Promise<void>}
   */
  async loadThreeScene(sceneBuilderFunction, options = {}) {
    if (!this.isInitialized()) {
      throw new Error('PuppeteerManager is not initialized');
    }
    if (typeof sceneBuilderFunction !== 'function') {
      throw new Error('sceneBuilderFunction must be a function');
    }

    // デフォルトのタイムアウト設定
    const defaultTimeout = 30000;
    const loadTimeout = options.timeout || defaultTimeout;

    try {
      // HTMLGenerator には、Three.jsライブラリをロードするだけの基本HTMLを生成させる
      // autoExecute: false を指定して、ユーザー提供スクリプトの自動実行を抑制
      const htmlContent = this.htmlGenerator.generateTestHTML(
        () => { /* このプレースホルダー関数は autoExecute:false のため実行されない */ }, 
        { ...options, autoExecute: false } 
      );

      await this.page.setContent(htmlContent, {
        waitUntil: 'networkidle0', 
        timeout: loadTimeout,
      });

      // Three.jsライブラリのロード確認
      await this._waitForThreeJsLoad(loadTimeout);

      // Three.jsがロードされた後、page.evaluateを使ってシーン構築関数を実行
      const executionResult = await this._executeSceneBuilder(sceneBuilderFunction);
      
      if (!executionResult.success) {
        const error = new Error(executionResult.error.message);
        if (executionResult.error.stack) {
          error.stack = executionResult.error.stack;
        }
        throw error;
      }

    } catch (error) {
      // エラーの詳細情報を保持しつつ再スロー
      if (error.message && error.message.includes('timeout')) {
        throw new Error(`Three.js scene loading timed out after ${loadTimeout}ms: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Three.jsライブラリのロードを待機する
   * @param {number} timeout - タイムアウト時間
   * @private
   */
  async _waitForThreeJsLoad(timeout) {
    try {
      // Dynamic script loading の完了を待機
      await this.page.waitForFunction(
        () => {
          // エラーフラグの確認
          if (window.threeJsLoadError) {
            throw new Error('Three.js CDN load failed');
          }
          
          // Three.jsライブラリの存在確認
          return typeof THREE !== 'undefined' && 
                 typeof THREE.WebGLRenderer === 'function' &&
                 typeof THREE.Scene === 'function' &&
                 typeof THREE.PerspectiveCamera === 'function' &&
                 window.threeJsLoaded === true; // Dynamic loading completion flag
        }, 
        { 
          timeout: timeout,
          polling: 'raf' // Use requestAnimationFrame for smoother polling
        }
      );
    } catch (error) {
      // ライブラリロードエラーのより詳細な診断
      const loadError = await this.page.evaluate(() => window.threeJsLoadError);
      const threeAvailable = await this.page.evaluate(() => typeof THREE !== 'undefined');
      
      if (loadError) {
        throw new Error('Three.js failed to load from CDN');
      } else if (!threeAvailable) {
        throw new Error(`Three.js did not load within ${timeout}ms`);
      } else if (error.message.includes('timeout')) {
        throw new Error(`Three.js loading timed out after ${timeout}ms`);
      }
      throw new Error(`Three.js loading error: ${error.message}`);
    }
  }

  /**
   * シーンビルダー関数を実行する
   * @param {Function} sceneBuilderFunction - シーンビルダー関数
   * @returns {Promise<Object>} 実行結果
   * @private
   */
  async _executeSceneBuilder(sceneBuilderFunction) {
    try {
      return await this.page.evaluate((builderFuncString) => {
        // このコードはブラウザのコンテキストで実行される
        try {
          // Three.jsの可用性を再度確認
          if (typeof THREE === 'undefined' || typeof THREE.WebGLRenderer !== 'function') {
            const error = {
              message: 'THREE or THREE.WebGLRenderer not available in execution context',
              code: 'THREE_NOT_AVAILABLE'
            };
            window.sceneError = error;
            return { success: false, error };
          }

          // ユーザー関数を実行
          const userFunction = new Function(`return (${builderFuncString})`)();
          userFunction(); 
          
          // 成功フラグを設定
          window.sceneReady = true; 
          return { success: true }; 
          
        } catch (error) {
          const errorInfo = { 
            message: error.message, 
            stack: error.stack,
            code: 'SCENE_EXECUTION_ERROR'
          };
          window.sceneError = errorInfo;
          console.error("Error in sceneBuilderFunction:", error);
          return { success: false, error: errorInfo };
        }
      }, sceneBuilderFunction.toString()); 

    } catch (error) {
      // page.evaluate 自体のエラー
      return {
        success: false,
        error: {
          message: `Scene execution failed: ${error.message}`,
          stack: error.stack,
          code: 'PAGE_EVALUATE_ERROR'
        }
      };
    }
  }
}