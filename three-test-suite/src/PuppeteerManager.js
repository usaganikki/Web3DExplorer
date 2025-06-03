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

    // HTMLGenerator には、Three.jsライブラリをロードするだけの基本HTMLを生成させる
    // autoExecute: false を指定して、ユーザー提供スクリプトの自動実行を抑制
    const htmlContent = this.htmlGenerator.generateTestHTML(
      () => { /* このプレースホルダー関数は autoExecute:false のため実行されない */ }, 
      { ...options, autoExecute: false } 
    );

    await this.page.setContent(htmlContent, {
      waitUntil: 'networkidle0', 
      timeout: options.timeout || 30000,
    });

    // Three.jsの主要オブジェクトが利用可能になるまで待機
    try {
      await this.page.waitForFunction(() => typeof THREE !== 'undefined' && typeof THREE.WebGLRenderer === 'function', { timeout: options.timeout || 10000 });
    } catch (e) {
      throw new Error(`Three.js did not load correctly: ${e.message}`);
    }

    // Three.jsがロードされた後、page.evaluateを使ってシーン構築関数を実行
    try {
      const executionResult = await this.page.evaluate((builderFuncString) => {
        // このコードはブラウザのコンテキストで実行される
        if (typeof THREE === 'undefined' || typeof THREE.WebGLRenderer !== 'function') {
          console.error('THREE or THREE.WebGLRenderer not available in evaluate context');
          window.sceneError = { message: 'THREE or THREE.WebGLRenderer not available' };
          return { success: false, error: window.sceneError };
        }
        try {
          const userFunction = new Function(`return (${builderFuncString})`)();
          userFunction(); 
          window.sceneReady = true; 
          return { success: true }; 
        } catch (e) {
          window.sceneError = { message: e.message, stack: e.stack };
          console.error("Error in evaluated sceneBuilderFunction:", e.message, e.stack);
          return { success: false, error: window.sceneError };
        }
      }, sceneBuilderFunction.toString()); 

      if (executionResult && !executionResult.success && executionResult.error) {
        const error = new Error(executionResult.error.message);
        error.stack = executionResult.error.stack;
        throw error;
      }
      // もし page.evaluate 自体が失敗した場合 (executionResult が null や undefined の場合など)
      // または予期せぬ形で失敗した場合
      if (!executionResult || typeof executionResult.success === 'undefined') {
         // sceneErrorを再度確認
        const sceneErrorCheck = await this.page.evaluate(() => window.sceneError);
        if (sceneErrorCheck) {
            const error = new Error(sceneErrorCheck.message);
            error.stack = sceneErrorCheck.stack;
            throw error;
        }
        // それでも不明な場合は汎用エラー
        throw new Error('Scene execution failed for an unknown reason.');
      }

    } catch (e) {
      // page.evaluate 自体のエラー、または上記でスローされたエラー
      throw e; // そのままスローしてテスト側でキャッチさせる
    }
  }
}
