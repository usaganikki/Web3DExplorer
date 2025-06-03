import puppeteer from 'puppeteer';

/**
 * BrowserManager
 * Puppeteerブラウザのライフサイクルを管理するクラス
 */
export class BrowserManager {
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
   * @throws {Error} 初期化に失敗した場合
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

      // Forward browser console logs to Node console
      this.page.on('console', msg => {
        const type = msg.type();
        const text = msg.text();
        // Jestのテスト出力と区別しやすくするためにプレフィックスを付ける
        // また、エラーや警告は適切に Node の console.error/warn にマッピングする
        if (type === 'error') {
          console.error(`PAGE LOG (Error): ${text}`);
        } else if (type === 'warning') {
          console.warn(`PAGE LOG (Warning): ${text}`);
        } else {
          console.log(`PAGE LOG (${type}): ${text}`);
        }
      });
      
      await this.page.setViewport({
        width: this.options.width,
        height: this.options.height
      });

    } catch (error) {
      throw new Error(`BrowserManager initialization failed: ${error.message}`);
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
   * 初期化状態を検証する
   * @private
   * @throws {Error} 初期化されていない場合
   */
  _validateInitialized() {
    if (!this.isInitialized()) {
      throw new Error('BrowserManager is not initialized');
    }
  }
}
