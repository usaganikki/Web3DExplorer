import puppeteer from 'puppeteer';

/**
 * PuppeteerManager
 * Three.js テスト用のPuppeteerブラウザを管理するクラス
 * WebGL と WebAssembly 両方の機能テストをサポート
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
   * WebAssemblyの情報と対応状況を取得する
   * @returns {Promise<WebAssemblyInfo>} WebAssembly情報オブジェクト
   * @throws {Error} PuppeteerManagerが初期化されていない場合
   * 
   * @typedef {Object} WebAssemblyInfo
   * @property {boolean} wasmSupported - WebAssembly基本サポート状況
   * @property {boolean} streamingSupported - ストリーミングコンパイルサポート状況
   * @property {boolean} memorySupported - WebAssembly.Memoryサポート状況
   * @property {boolean} tableSupported - WebAssembly.Tableサポート状況
   * @property {boolean} globalSupported - WebAssembly.Globalサポート状況
   * @property {boolean} sharedMemorySupported - SharedArrayBuffer + WebAssemblyサポート状況
   * @property {boolean} simdSupported - WASM SIMDサポート状況
   */
  async getWebAssemblyInfo() {
    this._validateInitialized();

    try {
      const wasmInfo = await this.page.evaluate(this._getWebAssemblyInfoInBrowser);
      return wasmInfo;
    } catch (error) {
      throw new Error(`Failed to get WebAssembly info: ${error.message}`);
    }
  }

  /**
   * WebAssemblyのパフォーマンステストを実行する
   * CPU集約的な処理性能とメモリアクセス性能を測定
   * @returns {Promise<WebAssemblyPerformance>} パフォーマンス情報オブジェクト
   * @throws {Error} PuppeteerManagerが初期化されていない場合
   * 
   * @typedef {Object} WebAssemblyPerformance
   * @property {number} executionTime - 実行時間（ミリ秒）
   * @property {number} operationsPerSecond - 秒間演算回数
   * @property {number} memoryPerformance - メモリアクセス性能（操作/秒）
   */
  async benchmarkWebAssembly() {
    this._validateInitialized();

    try {
      const performance = await this.page.evaluate(this._benchmarkWebAssemblyInBrowser);
      return performance;
    } catch (error) {
      throw new Error(`Failed to benchmark WebAssembly: ${error.message}`);
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

  /**
   * ブラウザ内でWebAssembly情報を取得する関数
   * 各種WebAssembly機能の対応状況を詳細に確認
   * @private
   * @returns {WebAssemblyInfo} WebAssembly情報オブジェクト
   */
  _getWebAssemblyInfoInBrowser() {
    const result = {
      wasmSupported: false,
      streamingSupported: false,
      memorySupported: false,
      tableSupported: false,
      globalSupported: false,
      sharedMemorySupported: false,
      simdSupported: false
    };

    // WebAssembly基本サポート確認
    if (typeof WebAssembly !== 'undefined') {
      result.wasmSupported = true;
      
      // ストリーミングコンパイルサポート確認
      result.streamingSupported = typeof WebAssembly.compileStreaming === 'function' &&
                                  typeof WebAssembly.instantiateStreaming === 'function';
      
      // Memory, Table, Globalサポート確認
      result.memorySupported = typeof WebAssembly.Memory === 'function';
      result.tableSupported = typeof WebAssembly.Table === 'function';
      result.globalSupported = typeof WebAssembly.Global === 'function';
      
      // SharedMemoryサポート確認
      // SecurityError対策のためtry-catchで囲む
      try {
        result.sharedMemorySupported = typeof SharedArrayBuffer !== 'undefined' && 
                                      result.memorySupported;
        
        // さらに詳細な確認: 実際にSharedMemoryが作成可能か
        if (result.sharedMemorySupported) {
          try {
            const testMemory = new WebAssembly.Memory({ 
              initial: 1, 
              maximum: 1, 
              shared: true 
            });
            // 正常に作成できればtrue、そうでなければfalse
            result.sharedMemorySupported = testMemory.buffer instanceof SharedArrayBuffer;
          } catch (e) {
            result.sharedMemorySupported = false;
          }
        }
      } catch (e) {
        result.sharedMemorySupported = false;
      }
      
      // SIMD対応確認（将来拡張用）
      // 現在は基本的な検査のみ。実際のSIMD命令セット対応確認は複雑
      result.simdSupported = false; // 現在は常にfalse（将来の拡張に備えて）
    }

    return result;
  }

  /**
   * ブラウザ内でWebAssemblyパフォーマンステストを実行する関数
   * 数値計算とメモリアクセスの両方の性能を測定
   * @private
   * @returns {Promise<WebAssemblyPerformance>} パフォーマンス情報オブジェクト
   */
  _benchmarkWebAssemblyInBrowser() {
    if (typeof WebAssembly === 'undefined') {
      throw new Error('WebAssembly is not supported');
    }

    // 簡単なWASMモジュール（addTwo関数: 2つの数値を加算）
    // WAT (WebAssembly Text format): 
    // (module
    //   (func $addTwo (param $p1 i32) (param $p2 i32) (result i32)
    //     local.get $p1
    //     local.get $p2
    //     i32.add)
    //   (export "addTwo" (func $addTwo)))
    const wasmBytes = new Uint8Array([
      0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00, 0x01, 0x07, 0x01, 0x60, 0x02, 0x7f, 0x7f, 0x01,
      0x7f, 0x03, 0x02, 0x01, 0x00, 0x07, 0x0a, 0x01, 0x06, 0x61, 0x64, 0x64, 0x54, 0x77, 0x6f, 0x00,
      0x00, 0x0a, 0x09, 0x01, 0x07, 0x00, 0x20, 0x00, 0x20, 0x01, 0x6a, 0x0b
    ]);

    return WebAssembly.instantiate(wasmBytes)
      .then(result => {
        const addTwo = result.instance.exports.addTwo;
        
        // CPU集約的処理のパフォーマンステスト
        const startTime = performance.now();
        const iterations = 100000;
        
        for (let i = 0; i < iterations; i++) {
          addTwo(i, i + 1);
        }
        
        const endTime = performance.now();
        const executionTime = endTime - startTime;
        const operationsPerSecond = Math.round((iterations / executionTime) * 1000);
        
        // メモリアクセス性能テスト
        const memoryStartTime = performance.now();
        let memoryPerformance = 0;
        
        try {
          const memory = new WebAssembly.Memory({ initial: 1 });
          const buffer = new Uint32Array(memory.buffer);
          const memoryOperations = 1000;
          
          for (let i = 0; i < memoryOperations; i++) {
            buffer[i] = i;
          }
          
          const memoryEndTime = performance.now();
          const memoryTime = memoryEndTime - memoryStartTime;
          memoryPerformance = Math.round((memoryOperations / memoryTime) * 1000);
        } catch (e) {
          // メモリアクセステストが失敗した場合は0を返す
          memoryPerformance = 0;
        }
        
        return {
          executionTime: Math.round(executionTime * 100) / 100, // 小数点以下2桁に丸める
          operationsPerSecond: operationsPerSecond,
          memoryPerformance: memoryPerformance
        };
      })
      .catch(error => {
        throw new Error(`WebAssembly benchmark failed: ${error.message}`);
      });
  }
}
