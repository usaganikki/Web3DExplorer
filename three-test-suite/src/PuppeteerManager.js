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
   * WebAssemblyとWebGLの連携機能情報を取得する
   * @returns {Promise<HybridCapabilities>} 連携機能情報オブジェクト
   * @throws {Error} PuppeteerManagerが初期化されていない場合
   * 
   * @typedef {Object} HybridCapabilities
   * @property {boolean} wasmSupported - WebAssembly対応状況
   * @property {boolean} webglSupported - WebGL対応状況
   * @property {boolean} hybridReady - 連携機能準備完了
   * @property {Object} performanceProfile - 性能プロファイル
   * @property {number} performanceProfile.cpuScore - CPU性能スコア
   * @property {number} performanceProfile.gpuScore - GPU性能スコア
   * @property {number} performanceProfile.memoryBandwidth - メモリ帯域幅
   * @property {string} recommendedStrategy - 推奨処理戦略
   */
  async getHybridCapabilities() {
    this._validateInitialized();

    try {
      const capabilities = await this.page.evaluate(this._getHybridCapabilitiesInBrowser);
      return capabilities;
    } catch (error) {
      throw new Error(`Failed to get hybrid capabilities: ${error.message}`);
    }
  }

  /**
   * WebAssemblyとWebGLの連携パフォーマンステストを実行する
   * @param {Object} options - テストオプション
   * @param {number} options.dataSize - テストデータサイズ (デフォルト: 1000)
   * @param {number} options.iterations - 反復回数 (デフォルト: 10)
   * @returns {Promise<HybridPerformance>} パフォーマンス情報オブジェクト
   * @throws {Error} PuppeteerManagerが初期化されていない場合
   * 
   * @typedef {Object} HybridPerformance
   * @property {number} wasmComputeTime - WASM計算時間（ミリ秒）
   * @property {number} webglRenderTime - WebGL描画時間（ミリ秒）
   * @property {number} dataTransferTime - データ転送時間（ミリ秒）
   * @property {number} totalTime - 総実行時間（ミリ秒）
   * @property {number} efficiency - 処理効率（0-1）
   * @property {number} throughput - スループット（データ/秒）
   */
  async benchmarkHybridPerformance(options = {}) {
    this._validateInitialized();

    try {
      const performance = await this.page.evaluate(this._benchmarkHybridPerformanceInBrowser, options);
      return performance;
    } catch (error) {
      throw new Error(`Failed to benchmark hybrid performance: ${error.message}`);
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

  /**
   * ブラウザ内でWebAssemblyとWebGLの連携機能情報を取得する関数
   * @private
   * @returns {HybridCapabilities} 連携機能情報オブジェクト
   */
  _getHybridCapabilitiesInBrowser() {
    // WebAssembly対応確認
    const wasmSupported = typeof WebAssembly !== 'undefined';
    
    // WebGL対応確認
    const canvas = document.createElement('canvas');
    const webglContext = canvas.getContext('webgl');
    const webglSupported = webglContext !== null;
    
    // 連携機能準備完了判定
    const hybridReady = wasmSupported && webglSupported;
    
    // 性能プロファイル計算
    let cpuScore = 0;
    let gpuScore = 0;
    let memoryBandwidth = 0;
    
    if (wasmSupported) {
      // 簡易CPU性能スコア算出
      const startTime = performance.now();
      let sum = 0;
      for (let i = 0; i < 100000; i++) {
        sum += i * 2;
      }
      const endTime = performance.now();
      cpuScore = Math.round(100000 / (endTime - startTime));
    }
    
    if (webglSupported) {
      // 簡易GPU性能スコア算出（テクスチャサイズベース）
      const maxTextureSize = webglContext.getParameter(webglContext.MAX_TEXTURE_SIZE);
      gpuScore = Math.min(maxTextureSize / 1024, 100); // 最大100点
      
      // メモリ帯域幅推定（簡易計算）
      const maxViewportDims = webglContext.getParameter(webglContext.MAX_VIEWPORT_DIMS);
      memoryBandwidth = Math.round((maxViewportDims[0] * maxViewportDims[1]) / 1000000); // MB/s推定
    }
    
    // 推奨処理戦略の決定
    let recommendedStrategy = 'cpu-only';
    if (hybridReady) {
      if (cpuScore > 50000 && gpuScore > 50) {
        recommendedStrategy = 'balanced-hybrid';
      } else if (cpuScore > 50000) {
        recommendedStrategy = 'cpu-heavy';
      } else if (gpuScore > 50) {
        recommendedStrategy = 'gpu-heavy';
      } else {
        recommendedStrategy = 'simple-hybrid';
      }
    } else if (webglSupported) {
      recommendedStrategy = 'gpu-only';
    }
    
    return {
      wasmSupported,
      webglSupported,
      hybridReady,
      performanceProfile: {
        cpuScore,
        gpuScore,
        memoryBandwidth
      },
      recommendedStrategy
    };
  }

  /**
   * ブラウザ内でWebAssemblyとWebGLの連携パフォーマンステストを実行する関数
   * @private
   * @param {Object} options - テストオプション
   * @returns {Promise<HybridPerformance>} パフォーマンス情報オブジェクト
   */
  _benchmarkHybridPerformanceInBrowser(options) {
    const config = {
      dataSize: 1000,
      iterations: 10,
      ...options
    };

    if (typeof WebAssembly === 'undefined') {
      throw new Error('WebAssembly is not supported');
    }

    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl');
    if (!gl) {
      throw new Error('WebGL is not supported');
    }

    // WASMモジュール（データ処理用）
    const wasmBytes = new Uint8Array([
      0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00, 0x01, 0x07, 0x01, 0x60, 0x02, 0x7f, 0x7f, 0x01,
      0x7f, 0x03, 0x02, 0x01, 0x00, 0x07, 0x0a, 0x01, 0x06, 0x61, 0x64, 0x64, 0x54, 0x77, 0x6f, 0x00,
      0x00, 0x0a, 0x09, 0x01, 0x07, 0x00, 0x20, 0x00, 0x20, 0x01, 0x6a, 0x0b
    ]);

    return WebAssembly.instantiate(wasmBytes)
      .then(result => {
        const addTwo = result.instance.exports.addTwo;
        
        const totalStartTime = performance.now();
        
        let totalWasmTime = 0;
        let totalWebglTime = 0;
        let totalDataTransferTime = 0;
        
        for (let iter = 0; iter < config.iterations; iter++) {
          // WASM計算フェーズ
          const wasmStartTime = performance.now();
          const vertices = [];
          for (let i = 0; i < config.dataSize; i++) {
            vertices.push(addTwo(i % 100, (i + 1) % 100));
          }
          const wasmEndTime = performance.now();
          totalWasmTime += (wasmEndTime - wasmStartTime);
          
          // データ転送フェーズ
          const transferStartTime = performance.now();
          const vertexData = new Float32Array(vertices);
          const transferEndTime = performance.now();
          totalDataTransferTime += (transferEndTime - transferStartTime);
          
          // WebGL描画フェーズ
          const webglStartTime = performance.now();
          const buffer = gl.createBuffer();
          gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
          gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW);
          
          // ダミー描画操作（実際の描画は行わない）
          gl.clear(gl.COLOR_BUFFER_BIT);
          const webglEndTime = performance.now();
          totalWebglTime += (webglEndTime - webglStartTime);
          
          // リソースクリーンアップ
          gl.deleteBuffer(buffer);
        }
        
        const totalEndTime = performance.now();
        const totalTime = totalEndTime - totalStartTime;
        
        // 平均時間計算
        const wasmComputeTime = Math.round((totalWasmTime / config.iterations) * 100) / 100;
        const webglRenderTime = Math.round((totalWebglTime / config.iterations) * 100) / 100;
        const dataTransferTime = Math.round((totalDataTransferTime / config.iterations) * 100) / 100;
        
        // 効率計算（理想的な並列処理に対する実際の性能比）
        const idealTime = Math.max(wasmComputeTime, webglRenderTime);
        const actualTime = wasmComputeTime + dataTransferTime + webglRenderTime;
        const efficiency = Math.min(idealTime / actualTime, 1.0);
        
        // スループット計算（データ/秒）
        const throughput = Math.round((config.dataSize * config.iterations * 1000) / totalTime);
        
        return {
          wasmComputeTime,
          webglRenderTime,
          dataTransferTime,
          totalTime: Math.round(totalTime * 100) / 100,
          efficiency: Math.round(efficiency * 1000) / 1000,
          throughput
        };
      })
      .catch(error => {
        throw new Error(`Hybrid performance benchmark failed: ${error.message}`);
      });
  }
}
