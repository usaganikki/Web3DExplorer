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
}
