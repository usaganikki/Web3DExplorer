import puppeteer from 'puppeteer';

/**
 * PuppeteerManager
 * Three.js テスト用のPuppeteerブラウザを管理するクラス
 */
export class PuppeteerManager {
  /**
   * @param {Object} options - 設定オプション
   * @param {boolean} options.headless - ヘッドレスモード (デフォルト: true)
   * @param {number} options.width - ビューポート幅 (デフォルト: 1024)
   * @param {number} options.height - ビューポート高さ (デフォルト: 768)
   * @param {string[]} options.args - Chromium起動引数
   */
  constructor(options = {}) {
    this.options = {
      headless: true,
      width: 1024,
      height: 768,
      args: [
        '--enable-webgl',
        '--disable-web-security',
        '--allow-running-insecure-content',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ],
      ...options
    };
    
    this.browser = null;
    this.page = null;
  }

  /**
   * Puppeteerブラウザを初期化する
   */
  async initialize() {
    // 既に初期化済みの場合は何もしない
    if (this.browser) {
      return;
    }

    try {
      this.browser = await puppeteer.launch({
        headless: this.options.headless,
        args: this.options.args
      });

      this.page = await this.browser.newPage();
      
      await this.page.setViewport({
        width: this.options.width,
        height: this.options.height
      });

    } catch (error) {
      throw new Error(`PuppeteerManager initialization failed: ${error.message}`);
    }
  }

  /**
   * ブラウザを終了し、リソースをクリーンアップする
   */
  async cleanup() {
    if (!this.browser) {
      return;
    }

    try {
      await this.browser.close();
      this.browser = null;
      this.page = null;
    } catch (error) {
      // ログ出力はせず、静かに失敗させる
      console.warn(`Cleanup warning: ${error.message}`);
    }
  }

  /**
   * ブラウザが初期化されているかチェック
   * @returns {boolean} 初期化状態
   */
  isInitialized() {
    return this.browser !== null && this.page !== null;
  }

  /**
   * WebGLの情報と対応状況を取得する
   * @returns {Promise<Object>} WebGL情報オブジェクト
   * @throws {Error} PuppeteerManagerが初期化されていない場合
   */
  async getWebGLInfo() {
    if (!this.isInitialized()) {
      throw new Error('PuppeteerManager is not initialized');
    }

    try {
      const webglInfo = await this.page.evaluate(() => {
        // WebGLサポート確認
        const canvas = document.createElement('canvas');
        const webglContext = canvas.getContext('webgl');
        const webgl2Context = canvas.getContext('webgl2');

        const result = {
          webglSupported: webglContext !== null,
          webgl2Supported: webgl2Context !== null,
          vendor: null,
          renderer: null,
          version: null
        };

        // WebGL基本情報を取得
        if (webglContext) {
          result.vendor = webglContext.getParameter(webglContext.VENDOR);
          result.renderer = webglContext.getParameter(webglContext.RENDERER);
          result.version = webglContext.getParameter(webglContext.VERSION);
        }

        return result;
      });

      return webglInfo;
    } catch (error) {
      throw new Error(`Failed to get WebGL info: ${error.message}`);
    }
  }
}