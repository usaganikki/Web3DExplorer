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
   * @returns {Promise<WebGLInfo>} WebGL情報オブジェクト
   * @throws {Error} PuppeteerManagerが初期化されていない場合
   * 
   * @typedef {Object} WebGLInfo
   * @property {boolean} webglSupported - WebGLサポート状況
   * @property {boolean} webgl2Supported - WebGL2サポート状況
   * @property {string|null} vendor - WebGLベンダー情報
   * @property {string|null} renderer - レンダラー情報
   * @property {string|null} version - WebGLバージョン情報
   */
  async getWebGLInfo() {
    this._validateInitialized();

    try {
      const webglInfo = await this.page.evaluate(this._getWebGLInfoInBrowser);
      return webglInfo;
    } catch (error) {
      throw new Error(`Failed to get WebGL info: ${error.message}`);
    }
  }

  /**
   * Three.js用のHTMLテンプレートを生成する
   * @param {Function} userScript - ページに注入するユーザースクリプト
   * @param {Object} options - テンプレート生成オプション
   * @param {string} options.title - ページタイトル (デフォルト: 'Three.js Test Environment')
   * @param {string} options.threeJsVersion - Three.jsのバージョン (デフォルト: 'r128')
   * @param {boolean} options.autoExecute - スクリプトの自動実行 (デフォルト: true)
   * @returns {string} 生成されたHTMLコンテンツ
   * @throws {Error} ユーザースクリプトが無効な場合
   */
  generateTestHTML(userScript, options = {}) {
    // 引数の検証
    if (typeof userScript !== 'function') {
      throw new Error('userScript must be a function');
    }

    const config = {
      title: 'Three.js Test Environment',
      threeJsVersion: 'r128',
      autoExecute: true,
      ...options
    };

    const userScriptString = userScript.toString();
    const threeJsUrl = `https://cdnjs.cloudflare.com/ajax/libs/three.js/${config.threeJsVersion}/three.min.js`;

    // スクリプト実行部分を生成
    const scriptExecution = config.autoExecute
      ? `
        // Wait for Three.js to load
        window.addEventListener('load', function() {
            // Execute user script
            (${userScriptString})();
        });`
      : `
        // User script is available but not auto-executed
        window.userScript = ${userScriptString};`;

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${config.title}</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            overflow: hidden;
            background-color: #000;
            font-family: Arial, sans-serif;
        }
        #three-canvas {
            display: block;
            width: 100vw;
            height: 100vh;
        }
        .debug-info {
            position: absolute;
            top: 10px;
            left: 10px;
            color: white;
            background: rgba(0, 0, 0, 0.7);
            padding: 10px;
            border-radius: 5px;
            font-size: 12px;
            z-index: 1000;
            display: none;
        }
    </style>
</head>
<body>
    <canvas id="three-canvas"></canvas>
    <div class="debug-info" id="debug-info">
        Debug info will appear here
    </div>
    
    <!-- Three.js CDN -->
    <script src="${threeJsUrl}"></script>
    
    <!-- User Script -->
    <script>${scriptExecution}
    </script>
</body>
</html>`;
  }

  /**
   * 初期化状態を検証する
   * @private
   * @throws {Error} 初期化されていない場合
   */
  _validateInitialized() {
    if (!this.isInitialized()) {
      throw new Error('PuppeteerManager is not initialized');
    }
  }

  /**
   * ブラウザ内でWebGL情報を取得する関数
   * @private
   * @returns {WebGLInfo} WebGL情報オブジェクト
   */
  _getWebGLInfoInBrowser() {
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
  }
}
