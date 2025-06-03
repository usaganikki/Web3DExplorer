import { BrowserManager } from './BrowserManager.js';
import { EnvironmentInspector } from './EnvironmentInspector.js';
import { PerformanceTester } from './PerformanceTester.js';
import { HTMLGenerator } from './HTMLGenerator.js';
import { ThreeTestSuite } from './threejs/ThreeTestSuite.js';

/**
 * PuppeteerManager
 * Three.js テスト用のPuppeteer関連機能を統括するクラス
 * Three.js機能はThreeTestSuiteに移行済み（Issue #18 Phase1対応）
 */
export class PuppeteerManager {
  constructor(options = {}) {
    this.browserManager = new BrowserManager(options);
    this.environmentInspector = new EnvironmentInspector(this.browserManager);
    this.performanceTester = new PerformanceTester(this.browserManager);
    this.htmlGenerator = new HTMLGenerator();
    
    // Three.js専用テストスイートを追加
    this.threeTestSuite = new ThreeTestSuite(this.browserManager);
  }

  async initialize() {
    await this.browserManager.initialize();
    await this.threeTestSuite.initialize();
  }

  async cleanup() {
    await this.browserManager.cleanup();
  }

  isInitialized() {
    return this.browserManager.isInitialized();
  }

  get page() {
    return this.browserManager.page;
  }
  
  get browser() {
    return this.browserManager.browser;
  }

  get options() {
    return this.browserManager.options;
  }

  // === 既存の環境・パフォーマンス関連メソッド ===
  async getWebGLInfo() {
    return this.environmentInspector.getWebGLInfo();
  }

  async getWebAssemblyInfo() {
    return this.environmentInspector.getWebAssemblyInfo();
  }

  async benchmarkWebAssembly() {
    return this.performanceTester.benchmarkWebAssembly();
  }

  async getHybridCapabilities() {
    return this.environmentInspector.getHybridCapabilities();
  }

  async benchmarkHybridPerformance(options = {}) {
    return this.performanceTester.benchmarkHybridPerformance(options);
  }

  generateTestHTML(userScript, options = {}) {
    return this.htmlGenerator.generateTestHTML(userScript, options);
  }

  // === Three.js関連メソッド（ThreeTestSuiteへの委任） ===
  
  /**
   * Three.jsシーンをロードし、指定されたセットアップ関数を実行する
   * @deprecated このメソッドはThreeTestSuite.loadThreeSceneに移行されました
   * 互換性のため残されていますが、直接threeTestSuite.loadThreeScene()を使用することを推奨
   * @param {Function} sceneBuilderFunction - Three.jsのシーンをセットアップする関数
   * @param {Object} options - ロードオプション (title, threeJsVersion, timeoutなど)
   * @returns {Promise<void>}
   */
  async loadThreeScene(sceneBuilderFunction, options = {}) {
    return this.threeTestSuite.loadThreeScene(sceneBuilderFunction, options);
  }

  /**
   * 包括的なThree.jsテストを実行
   * ThreeTestSuiteに委任
   * @returns {Promise<Object>} テスト結果
   */
  async runComprehensiveTest() {
    return this.threeTestSuite.runComprehensiveTest();
  }

  /**
   * 表示中のオブジェクトを取得
   * ThreeTestSuiteに委任（将来的にObjectAnalyzerで実装予定）
   * @returns {Promise<Array>} 表示中のオブジェクト一覧
   */
  async getVisibleObjects() {
    return this.threeTestSuite.getVisibleObjects();
  }

  /**
   * レンダリング検証を実行
   * ThreeTestSuiteに委任（将来的にRenderingValidatorで実装予定）
   * @returns {Promise<Object>} レンダリング結果
   */
  async validateRendering() {
    return this.threeTestSuite.validateRendering();
  }

  /**
   * ThreeTestSuiteインスタンスを取得
   * 直接Three.js機能にアクセスしたい場合に使用
   * @returns {ThreeTestSuite} ThreeTestSuiteインスタンス
   */
  getThreeTestSuite() {
    return this.threeTestSuite;
  }
}