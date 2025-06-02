/**
 * EnvironmentInspector
 * ブラウザ環境の情報取得（WebGL, WebAssembly）を担当するクラス
 */
export class EnvironmentInspector {
  /**
   * @param {import('./BrowserManager').BrowserManager} browserManager - BrowserManagerのインスタンス
   */
  constructor(browserManager) {
    this.browserManager = browserManager;
  }

  /**
   * WebGLの情報と対応状況を取得する
   * @returns {Promise<WebGLInfo>} WebGL情報オブジェクト
   * @throws {Error} BrowserManagerが初期化されていない場合
   * 
   * @typedef {Object} WebGLInfo
   * @property {boolean} webglSupported - WebGLサポート状況
   * @property {boolean} webgl2Supported - WebGL2サポート状況
   * @property {string|null} vendor - WebGLベンダー情報
   * @property {string|null} renderer - レンダラー情報
   * @property {string|null} version - WebGLバージョン情報
   */
  async getWebGLInfo() {
    this.browserManager._validateInitialized();

    try {
      const webglInfo = await this.browserManager.page.evaluate(this._getWebGLInfoInBrowser);
      return webglInfo;
    } catch (error) {
      throw new Error(`Failed to get WebGL info: ${error.message}`);
    }
  }

  /**
   * WebAssemblyの情報と対応状況を取得する
   * @returns {Promise<WebAssemblyInfo>} WebAssembly情報オブジェクト
   * @throws {Error} BrowserManagerが初期化されていない場合
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
    this.browserManager._validateInitialized();

    try {
      const wasmInfo = await this.browserManager.page.evaluate(this._getWebAssemblyInfoInBrowser);
      return wasmInfo;
    } catch (error) {
      throw new Error(`Failed to get WebAssembly info: ${error.message}`);
    }
  }

  /**
   * WebAssemblyとWebGLの連携機能情報を取得する
   * @returns {Promise<HybridCapabilities>} 連携機能情報オブジェクト
   * @throws {Error} BrowserManagerが初期化されていない場合
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
    this.browserManager._validateInitialized();

    try {
      const capabilities = await this.browserManager.page.evaluate(this._getHybridCapabilitiesInBrowser);
      return capabilities;
    } catch (error) {
      throw new Error(`Failed to get hybrid capabilities: ${error.message}`);
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
}
