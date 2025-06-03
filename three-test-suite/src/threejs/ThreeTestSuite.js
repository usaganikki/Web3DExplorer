/**
 * ThreeTestSuite
 * Three.jsテスト機能を統括するメインクラス
 * PuppeteerManagerから分離されたThree.js専用の機能を提供
 */
export class ThreeTestSuite {
  constructor(browserManager) {
    if (!browserManager) {
      throw new Error('BrowserManager instance is required');
    }
    this.browserManager = browserManager;
    this.sceneInspector = null;
  }

  /**
   * ThreeTestSuiteの初期化
   * 各コンポーネントの初期化を行う
   */
  async initialize() {
    // 必要に応じて将来的にSceneInspectorなどのコンポーネントを初期化
    // 現在は何もしないが、拡張時にここで初期化処理を追加
  }

  /**
   * SceneInspectorインスタンスを取得
   * 遅延初期化パターンを使用
   */
  getSceneInspector() {
    if (!this.sceneInspector) {
      // 動的importを使用してSceneInspectorをロード
      // 現在はnullを返すが、実装時に適切に初期化
      this.sceneInspector = null; // TODO: SceneInspectorの実装後に初期化
    }
    return this.sceneInspector;
  }

  /**
   * Three.jsシーンをロードし、指定されたセットアップ関数を実行する
   * PuppeteerManagerから移行されたメソッド
   * @param {Function} sceneBuilderFunction - Three.jsのシーンをセットアップする関数
   * @param {Object} options - ロードオプション (title, threeJsVersion, timeoutなど)
   * @returns {Promise<void>}
   */
  async loadThreeScene(sceneBuilderFunction, options = {}) {
    if (!this.browserManager.isInitialized()) {
      throw new Error('BrowserManager is not initialized');
    }
    if (typeof sceneBuilderFunction !== 'function') {
      throw new Error('sceneBuilderFunction must be a function');
    }

    const defaultTimeout = 30000;
    const loadTimeout = options.timeout || defaultTimeout;

    try {
      // HTMLGeneratorを使用してHTMLコンテンツを生成
      const htmlContent = this._generateThreeJsHTML(options);

      await this.browserManager.page.setContent(htmlContent, {
        waitUntil: 'networkidle0', 
        timeout: loadTimeout,
      });

      await this._waitForThreeJsLoad(loadTimeout);

      const executionResult = await this._executeSceneBuilder(sceneBuilderFunction);
      
      if (!executionResult.success) {
        const error = new Error(executionResult.error.message);
        if (executionResult.error.stack) {
          error.stack = executionResult.error.stack;
        }
        throw error;
      }

    } catch (error) {
      if (error.message && error.message.includes('timeout')) {
        throw new Error(`Three.js scene loading timed out after ${loadTimeout}ms: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Three.js用のHTMLコンテンツを生成
   * @param {Object} options - 生成オプション
   * @returns {string} HTMLコンテンツ
   */
  _generateThreeJsHTML(options = {}) {
    const threeJsVersion = options.threeJsVersion || '0.163.0';
    const title = options.title || 'Three.js Test Scene';
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            overflow: hidden;
            background-color: #000;
        }
        canvas {
            display: block;
        }
    </style>
</head>
<body>
    <script>
        window.threeJsLoaded = false;
        window.threeJsLoadError = null;
        window.sceneReady = false;
        window.sceneError = null;
    </script>
    <script 
        src="https://cdnjs.cloudflare.com/ajax/libs/three.js/${threeJsVersion}/three.min.js"
        onload="window.threeJsLoaded = true;"
        onerror="window.threeJsLoadError = 'Failed to load Three.js from CDN';"
    ></script>
</body>
</html>`;
  }

  /**
   * Three.jsの読み込み完了を待機
   * @param {number} timeout - タイムアウト時間（ミリ秒）
   */
  async _waitForThreeJsLoad(timeout) {
    try {
      await this.browserManager.page.waitForFunction(
        () => {
          if (window.threeJsLoadError) {
            throw new Error('Three.js CDN load failed');
          }
          
          return typeof THREE !== 'undefined' && 
                 typeof THREE.WebGLRenderer === 'function' &&
                 typeof THREE.Scene === 'function' &&
                 typeof THREE.PerspectiveCamera === 'function' &&
                 window.threeJsLoaded === true;
        }, 
        { 
          timeout: timeout,
          polling: 'raf'
        }
      );
    } catch (error) {
      const loadError = await this.browserManager.page.evaluate(() => window.threeJsLoadError);
      const threeAvailable = await this.browserManager.page.evaluate(() => typeof THREE !== 'undefined');
      
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
   * シーンビルダー関数を実行
   * @param {Function} sceneBuilderFunction - 実行する関数
   * @returns {Promise<Object>} 実行結果
   */
  async _executeSceneBuilder(sceneBuilderFunction) {
    try {
      return await this.browserManager.page.evaluate((builderFuncString) => {
        try {
          if (typeof THREE === 'undefined' || typeof THREE.WebGLRenderer !== 'function') {
            const error = {
              message: 'THREE or THREE.WebGLRenderer not available in execution context',
              code: 'THREE_NOT_AVAILABLE'
            };
            window.sceneError = error;
            return { success: false, error };
          }

          const userFunction = new Function(`return (${builderFuncString})`)();
          userFunction(); 
          
          window.sceneReady = true; 
          return { success: true }; 
          
        } catch (error) {
          const errorInfo = { 
            message: error.message, 
            stack: error.stack,
            code: 'SCENE_EXECUTION_ERROR'
          };
          window.sceneError = errorInfo;
          console.error('Error in sceneBuilderFunction:', error);
          return { success: false, error: errorInfo };
        }
      }, sceneBuilderFunction.toString()); 

    } catch (error) {
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

  /**
   * 包括的なThree.jsテストを実行
   * 将来的にSceneInspector等を使用した総合テスト機能
   * @returns {Promise<Object>} テスト結果
   */
  async runComprehensiveTest() {
    // TODO: Phase2以降で実装
    // SceneInspector、ObjectAnalyzer等を使用した包括的テスト
    return {
      success: true,
      message: 'Comprehensive test not yet implemented - Phase2 feature',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 表示中のオブジェクトを取得
   * 将来的にObjectAnalyzerで実装予定
   * @returns {Promise<Array>} 表示中のオブジェクト一覧
   */
  async getVisibleObjects() {
    // TODO: Phase2以降でObjectAnalyzerを使用して実装
    return [];
  }

  /**
   * レンダリング検証を実行
   * 将来的にRenderingValidatorで実装予定
   * @returns {Promise<Object>} レンダリング結果
   */
  async validateRendering() {
    // TODO: Phase3以降でRenderingValidatorを使用して実装
    return {
      success: true,
      message: 'Rendering validation not yet implemented - Phase3 feature'
    };
  }
}