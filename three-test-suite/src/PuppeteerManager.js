import { BrowserManager } from './BrowserManager.js';
import { EnvironmentInspector } from './EnvironmentInspector.js';
import { PerformanceTester } from './PerformanceTester.js';
import { HTMLGenerator } from './HTMLGenerator.js';

/**
 * PuppeteerManager
 * Three.js テスト用のPuppeteer関連機能を統括するクラス
 */
export class PuppeteerManager {
  constructor(options = {}) {
    this.browserManager = new BrowserManager(options);
    this.environmentInspector = new EnvironmentInspector(this.browserManager);
    this.performanceTester = new PerformanceTester(this.browserManager);
    this.htmlGenerator = new HTMLGenerator();
  }

  async initialize() {
    await this.browserManager.initialize();
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

    const defaultTimeout = 30000;
    const loadTimeout = options.timeout || defaultTimeout;

    try {
      const htmlContent = this.htmlGenerator.generateTestHTML(
        () => {}, 
        { ...options, autoExecute: false } 
      );

      await this.page.setContent(htmlContent, {
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

  async _waitForThreeJsLoad(timeout) {
    try {
      await this.page.waitForFunction(
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
      const loadError = await this.page.evaluate(() => window.threeJsLoadError);
      const threeAvailable = await this.page.evaluate(() => typeof THREE !== 'undefined');
      
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

  async _executeSceneBuilder(sceneBuilderFunction) {
    try {
      return await this.page.evaluate((builderFuncString) => {
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
          console.error(\"Error in sceneBuilderFunction:\", error);
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
}"