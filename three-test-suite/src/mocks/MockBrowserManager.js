/**
 * BrowserManagerのモック実装
 * テスト間の依存関係を排除し、独立性を確保するためのモッククラス
 */
class MockBrowserManager {
  constructor(options = {}) {
    this.options = {
      headless: true,
      width: 1024,
      height: 768,
      ...options
    };
    this.browser = null;
    this.page = null;
    this.isInitialized = false;
    this.instances = new Set(); // アクティブなインスタンス追跡
  }

  /**
   * 初期化処理（モック版）
   * 実際のPuppeteerは起動せず、モックオブジェクトを作成
   */
  async initialize() {
    if (this.isInitialized) {
      throw new Error('BrowserManager already initialized');
    }

    // モックブラウザオブジェクト
    this.browser = this.createMockBrowser();
    
    // モックページオブジェクト
    this.page = this.createMockPage();
    
    this.isInitialized = true;
    this.instances.add(this);
    
    return this;
  }

  /**
   * モックブラウザオブジェクトの作成
   */
  createMockBrowser() {
    return {
      newPage: async () => this.createMockPage(),
      close: async () => {
        this.isInitialized = false;
        this.instances.delete(this);
      },
      isConnected: () => this.isInitialized,
      pages: async () => [this.page].filter(Boolean),
      version: () => 'MockBrowser/1.0.0'
    };
  }

  /**
   * モックページオブジェクトの作成
   */
  createMockPage() {
    const mockPage = {
      // ナビゲーション関連
      goto: async (url) => {
        mockPage._currentUrl = url;
        return { status: () => 200 };
      },
      
      setContent: async (content) => {
        mockPage._content = content;
        // HTMLコンテンツの解析をシミュレート
        await this.simulateContentParsing(content);
      },
      
      content: async () => mockPage._content || '',
      
      url: () => mockPage._currentUrl || 'about:blank',
      
      // 評価関連
      evaluate: async (fn, ...args) => {
        // JavaScriptの評価をシミュレート
        return this.simulateEvaluation(fn, args);
      },
      
      evaluateHandle: async (fn, ...args) => {
        const result = await mockPage.evaluate(fn, ...args);
        return { jsonValue: async () => result };
      },
      
      // 待機関数
      waitForFunction: async (fn, options = {}) => {
        const timeout = options.timeout || 30000;
        const startTime = Date.now();
        
        while (Date.now() - startTime < timeout) {
          try {
            const result = await mockPage.evaluate(fn);
            if (result) return result;
          } catch (e) {
            // 評価エラーは無視
          }
          await this.delay(100);
        }
        throw new Error(`waitForFunction timeout after ${timeout}ms`);
      },
      
      waitForSelector: async (selector, options = {}) => {
        // セレクターの存在をシミュレート
        await this.delay(10);
        return { click: async () => {}, type: async () => {} };
      },
      
      // ビューポート関連
      setViewport: async (viewport) => {
        mockPage._viewport = viewport;
      },
      
      viewport: () => mockPage._viewport || this.options,
      
      // スクリーンショット
      screenshot: async (options = {}) => {
        // ダミーのスクリーンショットデータ
        return Buffer.from('mock-screenshot-data');
      },
      
      // ログ記録
      on: (event, handler) => {
        mockPage._listeners = mockPage._listeners || {};
        mockPage._listeners[event] = mockPage._listeners[event] || [];
        mockPage._listeners[event].push(handler);
      },
      
      removeListener: (event, handler) => {
        if (mockPage._listeners && mockPage._listeners[event]) {
          const index = mockPage._listeners[event].indexOf(handler);
          if (index > -1) {
            mockPage._listeners[event].splice(index, 1);
          }
        }
      },
      
      // クリーンアップ
      close: async () => {
        mockPage._closed = true;
      },
      
      isClosed: () => mockPage._closed || false,
      
      // 内部状態
      _content: '',
      _currentUrl: '',
      _viewport: null,
      _closed: false,
      _listeners: {}
    };
    
    return mockPage;
  }

  /**
   * HTMLコンテンツの解析をシミュレート
   */
  async simulateContentParsing(content) {
    // Three.jsスクリプトの検出
    if (content.includes('three.min.js') || content.includes('THREE')) {
      // Three.js環境の初期化をシミュレート
      await this.delay(50);
      
      // グローバルオブジェクトの設定をシミュレート
      this.setGlobalProperty('THREE', this.createMockThreeJS());
      this.setGlobalProperty('window.THREE', this.createMockThreeJS());
    }
    
    // WebGLの初期化をシミュレート
    if (content.includes('WebGLRenderer') || content.includes('canvas')) {
      this.setGlobalProperty('WebGLRenderingContext', this.createMockWebGLContext());
    }
  }

  /**
   * JavaScript評価のシミュレート
   */
  async simulateEvaluation(fn, args) {
    // 関数の文字列化と解析
    const fnString = fn.toString();
    
    // Three.jsオブジェクトの作成をシミュレート
    if (fnString.includes('new THREE.Scene')) {
      return { type: 'Scene', children: [] };
    }
    
    if (fnString.includes('new THREE.Mesh')) {
      return { type: 'Mesh', geometry: {}, material: {} };
    }
    
    if (fnString.includes('window.')) {
      // window オブジェクトへのアクセスをシミュレート
      const match = fnString.match(/window\.(\w+)/);
      if (match) {
        return this.getGlobalProperty(match[1]);
      }
    }
    
    // デフォルトの戻り値
    return true;
  }

  /**
   * モックThree.JSオブジェクトの作成
   */
  createMockThreeJS() {
    return {
      Scene: class MockScene {
        constructor() {
          this.children = [];
          this.type = 'Scene';
        }
        add(object) { this.children.push(object); }
        remove(object) { 
          const index = this.children.indexOf(object);
          if (index > -1) this.children.splice(index, 1);
        }
      },
      
      Mesh: class MockMesh {
        constructor(geometry, material) {
          this.geometry = geometry || {};
          this.material = material || {};
          this.type = 'Mesh';
          this.position = { x: 0, y: 0, z: 0 };
          this.rotation = { x: 0, y: 0, z: 0 };
          this.scale = { x: 1, y: 1, z: 1 };
        }
      },
      
      BoxGeometry: class MockBoxGeometry {
        constructor(width = 1, height = 1, depth = 1) {
          this.type = 'BoxGeometry';
          this.parameters = { width, height, depth };
        }
      },
      
      MeshBasicMaterial: class MockMeshBasicMaterial {
        constructor(parameters = {}) {
          this.type = 'MeshBasicMaterial';
          this.color = parameters.color || 0xffffff;
        }
      },
      
      PerspectiveCamera: class MockPerspectiveCamera {
        constructor(fov = 50, aspect = 1, near = 0.1, far = 2000) {
          this.type = 'PerspectiveCamera';
          this.fov = fov;
          this.aspect = aspect;
          this.near = near;
          this.far = far;
          this.position = { x: 0, y: 0, z: 0 };
        }
      },
      
      WebGLRenderer: class MockWebGLRenderer {
        constructor(parameters = {}) {
          this.type = 'WebGLRenderer';
          this.domElement = this.createMockCanvas();
          this.info = {
            render: { triangles: 0, calls: 0 },
            memory: { geometries: 0, textures: 0 }
          };
        }
        
        setSize(width, height) {
          this.domElement.width = width;
          this.domElement.height = height;
        }
        
        render(scene, camera) {
          // レンダリングをシミュレート
          this.info.render.calls++;
          this.info.render.triangles += scene.children.length * 2;
        }
        
        createMockCanvas() {
          return {
            width: 300,
            height: 150,
            getContext: (type) => {
              if (type === 'webgl' || type === 'experimental-webgl') {
                return this.createMockWebGLContext();
              }
              return null;
            }
          };
        }
        
        createMockWebGLContext() {
          return {
            getParameter: (param) => {
              const paramMap = {
                37445: 'Mock WebGL Vendor',  // VENDOR
                37446: 'Mock WebGL Renderer', // RENDERER
                7938: 'WebGL 1.0 Mock'       // VERSION
              };
              return paramMap[param] || 'Mock Value';
            },
            getExtension: () => null,
            getSupportedExtensions: () => []
          };
        }
      }
    };
  }

  /**
   * モックWebGLコンテキストの作成
   */
  createMockWebGLContext() {
    return function MockWebGLRenderingContext() {
      return {
        canvas: { width: 300, height: 150 },
        getParameter: (param) => 'Mock WebGL Value',
        getExtension: () => null,
        getSupportedExtensions: () => [],
        createProgram: () => ({}),
        createShader: () => ({}),
        compileShader: () => {},
        linkProgram: () => {},
        useProgram: () => {},
        clear: () => {},
        clearColor: () => {},
        viewport: () => {}
      };
    };
  }

  /**
   * グローバルプロパティの設定
   */
  setGlobalProperty(name, value) {
    this._globalProperties = this._globalProperties || {};
    this._globalProperties[name] = value;
  }

  /**
   * グローバルプロパティの取得
   */
  getGlobalProperty(name) {
    this._globalProperties = this._globalProperties || {};
    return this._globalProperties[name];
  }

  /**
   * 遅延処理
   */
  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * クリーンアップ処理
   */
  async cleanup() {
    if (this.page && !this.page.isClosed()) {
      await this.page.close();
    }
    
    if (this.browser) {
      await this.browser.close();
    }
    
    this.isInitialized = false;
    this.instances.delete(this);
    this._globalProperties = {};
  }

  /**
   * すべてのインスタンスのクリーンアップ
   */
  static async cleanupAll() {
    const cleanupPromises = Array.from(MockBrowserManager.instances).map(
      instance => instance.cleanup()
    );
    await Promise.all(cleanupPromises);
    MockBrowserManager.instances.clear();
  }

  /**
   * アクティブなインスタンス数の取得
   */
  static getActiveInstanceCount() {
    return MockBrowserManager.instances.size;
  }
}

// 静的プロパティの初期化
MockBrowserManager.instances = new Set();

module.exports = MockBrowserManager;
