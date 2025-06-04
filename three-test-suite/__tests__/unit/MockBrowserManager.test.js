/**
 * MockBrowserManager の単体テスト
 * テスト間の独立性を確保するモック実装の動作確認
 */

import MockBrowserManager from '../../src/mocks/MockBrowserManager.js';

describe('MockBrowserManager - 基本機能', () => {
  let mockBrowserManager;

  afterEach(async () => {
    if (mockBrowserManager) {
      await mockBrowserManager.cleanup();
      mockBrowserManager = null;
    }
    // 全インスタンスのクリーンアップ（念のため）
    await MockBrowserManager.cleanupAll();
  });

  test('正常に初期化できる', async () => {
    mockBrowserManager = new MockBrowserManager();
    
    expect(mockBrowserManager.isInitialized).toBe(false);
    expect(mockBrowserManager.browser).toBeNull();
    expect(mockBrowserManager.page).toBeNull();

    await mockBrowserManager.initialize();

    expect(mockBrowserManager.isInitialized).toBe(true);
    expect(mockBrowserManager.browser).toBeDefined();
    expect(mockBrowserManager.page).toBeDefined();
  });

  test('ページオブジェクトが正しく作成される', async () => {
    mockBrowserManager = new MockBrowserManager();
    await mockBrowserManager.initialize();

    const page = mockBrowserManager.page;
    
    expect(page).toBeDefined();
    expect(typeof page.setContent).toBe('function');
    expect(typeof page.evaluate).toBe('function');
    expect(typeof page.waitForFunction).toBe('function');
    expect(typeof page.goto).toBe('function');
    expect(typeof page.screenshot).toBe('function');
    expect(typeof page.setViewport).toBe('function');
    expect(typeof page.content).toBe('function');
    expect(typeof page.url).toBe('function');
    expect(typeof page.close).toBe('function');
  });

  test('ブラウザオブジェクトが正しく作成される', async () => {
    mockBrowserManager = new MockBrowserManager();
    await mockBrowserManager.initialize();

    const browser = mockBrowserManager.browser;
    
    expect(browser).toBeDefined();
    expect(typeof browser.newPage).toBe('function');
    expect(typeof browser.close).toBe('function');
    expect(typeof browser.isConnected).toBe('function');
    expect(typeof browser.pages).toBe('function');
    expect(typeof browser.version).toBe('function');
  });

  test('初期化状態を正しく管理する', async () => {
    mockBrowserManager = new MockBrowserManager();
    
    // 初期化前
    expect(mockBrowserManager.isInitialized).toBe(false);
    
    // 初期化後
    await mockBrowserManager.initialize();
    expect(mockBrowserManager.isInitialized).toBe(true);
    
    // クリーンアップ後
    await mockBrowserManager.cleanup();
    expect(mockBrowserManager.isInitialized).toBe(false);
  });

  test('クリーンアップが正常に動作する', async () => {
    mockBrowserManager = new MockBrowserManager();
    await mockBrowserManager.initialize();
    
    expect(mockBrowserManager.isInitialized).toBe(true);
    expect(MockBrowserManager.getActiveInstanceCount()).toBeGreaterThan(0);
    
    await mockBrowserManager.cleanup();
    
    expect(mockBrowserManager.isInitialized).toBe(false);
    expect(mockBrowserManager.browser).toBeNull();
    expect(mockBrowserManager.page).toBeNull();
  });

  test('オプション設定が正しく適用される', () => {
    const options = {
      headless: false,
      width: 800,
      height: 600
    };
    
    mockBrowserManager = new MockBrowserManager(options);
    
    expect(mockBrowserManager.options.headless).toBe(false);
    expect(mockBrowserManager.options.width).toBe(800);
    expect(mockBrowserManager.options.height).toBe(600);
  });
});

describe('MockBrowserManager - API互換性', () => {
  let mockBrowserManager;

  beforeEach(async () => {
    mockBrowserManager = new MockBrowserManager();
    await mockBrowserManager.initialize();
  });

  afterEach(async () => {
    if (mockBrowserManager) {
      await mockBrowserManager.cleanup();
      mockBrowserManager = null;
    }
    await MockBrowserManager.cleanupAll();
  });

  test('BrowserManagerと同じメソッドシグネチャを持つ', () => {
    // 基本メソッドの存在確認
    expect(typeof mockBrowserManager.initialize).toBe('function');
    expect(typeof mockBrowserManager.cleanup).toBe('function');
    expect(mockBrowserManager.isInitialized).toBeDefined();
    expect(mockBrowserManager.browser).toBeDefined();
    expect(mockBrowserManager.page).toBeDefined();
  });

  test('initialize()の戻り値が正しい', async () => {
    const cleanManager = new MockBrowserManager();
    const result = await cleanManager.initialize();
    
    expect(result).toBe(cleanManager);
    
    await cleanManager.cleanup();
  });

  test('cleanup()が正常に完了する', async () => {
    expect(mockBrowserManager.isInitialized).toBe(true);
    
    const cleanupPromise = mockBrowserManager.cleanup();
    await expect(cleanupPromise).resolves.toBeUndefined();
    
    expect(mockBrowserManager.isInitialized).toBe(false);
  });
});

describe('MockBrowserManager - モックページ機能', () => {
  let mockBrowserManager;

  beforeEach(async () => {
    mockBrowserManager = new MockBrowserManager();
    await mockBrowserManager.initialize();
  });

  afterEach(async () => {
    if (mockBrowserManager) {
      await mockBrowserManager.cleanup();
      mockBrowserManager = null;
    }
    await MockBrowserManager.cleanupAll();
  });

  test('page.setContent()が正常動作', async () => {
    const testHtml = '<html><body><h1>Test Page</h1></body></html>';
    
    await expect(mockBrowserManager.page.setContent(testHtml)).resolves.toBeUndefined();
    
    const content = await mockBrowserManager.page.content();
    expect(content).toBe(testHtml);
  });

  test('page.evaluate()が正常動作', async () => {
    const result = await mockBrowserManager.page.evaluate(() => {
      return 2 + 3;
    });
    
    expect(result).toBe(true); // モック実装では基本的にtrueを返す
  });

  test('page.waitForFunction()が正常動作', async () => {
    const startTime = Date.now();
    
    const result = await mockBrowserManager.page.waitForFunction(() => true);
    const endTime = Date.now();
    
    expect(result).toBeDefined();
    expect(endTime - startTime).toBeLessThan(1000); // 高速実行確認
  });

  test('page.goto()が正常動作', async () => {
    const testUrl = 'https://example.com/test';
    
    const response = await mockBrowserManager.page.goto(testUrl);
    
    expect(response).toBeDefined();
    expect(typeof response.status).toBe('function');
    expect(response.status()).toBe(200);
    expect(mockBrowserManager.page.url()).toBe(testUrl);
  });

  test('page.screenshot()が正常動作', async () => {
    const screenshot = await mockBrowserManager.page.screenshot();
    
    expect(screenshot).toBeInstanceOf(Buffer);
    expect(screenshot.toString()).toContain('mock-screenshot-data');
  });

  test('page.setViewport()が正常動作', async () => {
    const viewport = { width: 1920, height: 1080 };
    
    await expect(mockBrowserManager.page.setViewport(viewport)).resolves.toBeUndefined();
    
    const currentViewport = mockBrowserManager.page.viewport();
    expect(currentViewport.width).toBe(1920);
    expect(currentViewport.height).toBe(1080);
  });

  test('page.on()でイベントリスナーが設定できる', () => {
    const handler = jest.fn();
    
    mockBrowserManager.page.on('console', handler);
    
    expect(mockBrowserManager.page._listeners).toBeDefined();
    expect(mockBrowserManager.page._listeners.console).toContain(handler);
  });

  test('page.close()が正常動作', async () => {
    expect(mockBrowserManager.page.isClosed()).toBe(false);
    
    await mockBrowserManager.page.close();
    
    expect(mockBrowserManager.page.isClosed()).toBe(true);
  });
});

describe('MockBrowserManager - モックブラウザ機能', () => {
  let mockBrowserManager;

  beforeEach(async () => {
    mockBrowserManager = new MockBrowserManager();
    await mockBrowserManager.initialize();
  });

  afterEach(async () => {
    if (mockBrowserManager) {
      await mockBrowserManager.cleanup();
      mockBrowserManager = null;
    }
    await MockBrowserManager.cleanupAll();
  });

  test('browser.newPage()が正常動作', async () => {
    const newPage = await mockBrowserManager.browser.newPage();
    
    expect(newPage).toBeDefined();
    expect(typeof newPage.setContent).toBe('function');
    expect(typeof newPage.evaluate).toBe('function');
  });

  test('browser.close()が正常動作', async () => {
    expect(mockBrowserManager.browser.isConnected()).toBe(true);
    
    await mockBrowserManager.browser.close();
    
    expect(mockBrowserManager.browser.isConnected()).toBe(false);
    expect(mockBrowserManager.isInitialized).toBe(false);
  });

  test('browser.isConnected()が正しい状態を返す', () => {
    expect(mockBrowserManager.browser.isConnected()).toBe(true);
  });

  test('browser.pages()が正しいページ一覧を返す', async () => {
    const pages = await mockBrowserManager.browser.pages();
    
    expect(Array.isArray(pages)).toBe(true);
    expect(pages).toContain(mockBrowserManager.page);
  });

  test('browser.version()が正しいバージョン情報を返す', () => {
    const version = mockBrowserManager.browser.version();
    
    expect(typeof version).toBe('string');
    expect(version).toContain('MockBrowser');
  });
});

describe('MockBrowserManager - テスト独立性', () => {
  let manager1, manager2;

  afterEach(async () => {
    if (manager1) {
      await manager1.cleanup();
      manager1 = null;
    }
    if (manager2) {
      await manager2.cleanup();
      manager2 = null;
    }
    await MockBrowserManager.cleanupAll();
  });

  test('複数インスタンスが干渉しない', async () => {
    manager1 = new MockBrowserManager();
    manager2 = new MockBrowserManager();
    
    await manager1.initialize();
    await manager2.initialize();
    
    expect(manager1.isInitialized).toBe(true);
    expect(manager2.isInitialized).toBe(true);
    expect(manager1.page).not.toBe(manager2.page);
    expect(manager1.browser).not.toBe(manager2.browser);
  });

  test('グローバル状態が各インスタンスで分離される', async () => {
    manager1 = new MockBrowserManager();
    manager2 = new MockBrowserManager();
    
    await manager1.initialize();
    await manager2.initialize();
    
    manager1.setGlobalProperty('test1', 'value1');
    manager2.setGlobalProperty('test2', 'value2');
    
    expect(manager1.getGlobalProperty('test1')).toBe('value1');
    expect(manager1.getGlobalProperty('test2')).toBeUndefined();
    expect(manager2.getGlobalProperty('test2')).toBe('value2');
    expect(manager2.getGlobalProperty('test1')).toBeUndefined();
  });

  test('インスタンス間でページが独立している', async () => {
    manager1 = new MockBrowserManager();
    manager2 = new MockBrowserManager();
    
    await manager1.initialize();
    await manager2.initialize();
    
    await manager1.page.setContent('<h1>Page 1</h1>');
    await manager2.page.setContent('<h1>Page 2</h1>');
    
    const content1 = await manager1.page.content();
    const content2 = await manager2.page.content();
    
    expect(content1).toBe('<h1>Page 1</h1>');
    expect(content2).toBe('<h1>Page 2</h1>');
  });

  test('クリーンアップ後に状態がリセットされる', async () => {
    manager1 = new MockBrowserManager();
    await manager1.initialize();
    
    manager1.setGlobalProperty('testProp', 'testValue');
    expect(manager1.getGlobalProperty('testProp')).toBe('testValue');
    
    await manager1.cleanup();
    
    // 再初期化
    await manager1.initialize();
    expect(manager1.getGlobalProperty('testProp')).toBeUndefined();
  });
});

describe('MockBrowserManager - Three.js環境シミュレーション', () => {
  let mockBrowserManager;

  beforeEach(async () => {
    mockBrowserManager = new MockBrowserManager();
    await mockBrowserManager.initialize();
  });

  afterEach(async () => {
    if (mockBrowserManager) {
      await mockBrowserManager.cleanup();
      mockBrowserManager = null;
    }
    await MockBrowserManager.cleanupAll();
  });

  test('THREE オブジェクトがモック化される', async () => {
    const html = '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>';
    await mockBrowserManager.page.setContent(html);
    
    const three = mockBrowserManager.getGlobalProperty('THREE');
    expect(three).toBeDefined();
    expect(three.Scene).toBeDefined();
    expect(three.Mesh).toBeDefined();
    expect(three.BoxGeometry).toBeDefined();
  });

  test('WebGLコンテキストがシミュレートされる', async () => {
    const html = '<canvas id="test-canvas"></canvas>';
    await mockBrowserManager.page.setContent(html);
    
    const webglContext = mockBrowserManager.getGlobalProperty('WebGLRenderingContext');
    expect(webglContext).toBeDefined();
  });

  test('Three.jsシーン作成がシミュレートされる', async () => {
    const result = await mockBrowserManager.page.evaluate(() => {
      return 'new THREE.Scene()';
    });
    
    expect(result).toBeDefined();
  });

  test('Three.jsオブジェクトの基本操作が動作する', async () => {
    const html = '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>';
    await mockBrowserManager.page.setContent(html);
    
    const three = mockBrowserManager.getGlobalProperty('THREE');
    
    // Scene作成テスト
    const scene = new three.Scene();
    expect(scene.type).toBe('Scene');
    expect(Array.isArray(scene.children)).toBe(true);
    
    // Mesh作成テスト
    const geometry = new three.BoxGeometry();
    const material = new three.MeshBasicMaterial({ color: 0xff0000 });
    const mesh = new three.Mesh(geometry, material);
    
    expect(mesh.type).toBe('Mesh');
    expect(mesh.geometry).toBe(geometry);
    expect(mesh.material).toBe(material);
  });
});

describe('MockBrowserManager - エラーハンドリング', () => {
  let mockBrowserManager;

  afterEach(async () => {
    if (mockBrowserManager) {
      await mockBrowserManager.cleanup();
      mockBrowserManager = null;
    }
    await MockBrowserManager.cleanupAll();
  });

  test('重複初期化時に適切なエラーを投げる', async () => {
    mockBrowserManager = new MockBrowserManager();
    await mockBrowserManager.initialize();
    
    await expect(mockBrowserManager.initialize()).rejects.toThrow('BrowserManager already initialized');
  });

  test('未初期化状態でのページアクセス時の動作', () => {
    mockBrowserManager = new MockBrowserManager();
    
    expect(mockBrowserManager.page).toBeNull();
    expect(mockBrowserManager.browser).toBeNull();
  });

  test('クリーンアップ後の操作時の動作', async () => {
    mockBrowserManager = new MockBrowserManager();
    await mockBrowserManager.initialize();
    await mockBrowserManager.cleanup();
    
    expect(mockBrowserManager.isInitialized).toBe(false);
    expect(mockBrowserManager.page).toBeNull();
    expect(mockBrowserManager.browser).toBeNull();
  });

  test('page.waitForFunction()のタイムアウト処理', async () => {
    mockBrowserManager = new MockBrowserManager();
    await mockBrowserManager.initialize();
    
    // タイムアウトが短い場合のテスト
    await expect(
      mockBrowserManager.page.waitForFunction(() => false, { timeout: 100 })
    ).rejects.toThrow('waitForFunction timeout after 100ms');
  });

  test('不正な引数でのevaluate処理', async () => {
    mockBrowserManager = new MockBrowserManager();
    await mockBrowserManager.initialize();
    
    // 不正な関数でもエラーを投げずに処理する（モック実装）
    const result = await mockBrowserManager.page.evaluate('invalid function');
    expect(result).toBeDefined();
  });
});

describe('MockBrowserManager - 静的メソッド', () => {
  let managers = [];

  afterEach(async () => {
    // 個別クリーンアップ
    for (const manager of managers) {
      if (manager.isInitialized) {
        await manager.cleanup();
      }
    }
    managers = [];
    
    // 全体クリーンアップ
    await MockBrowserManager.cleanupAll();
  });

  test('cleanupAll()がすべてのインスタンスをクリーンアップ', async () => {
    // 複数のインスタンスを作成
    for (let i = 0; i < 3; i++) {
      const manager = new MockBrowserManager();
      await manager.initialize();
      managers.push(manager);
    }
    
    expect(MockBrowserManager.getActiveInstanceCount()).toBe(3);
    
    // 全体クリーンアップ
    await MockBrowserManager.cleanupAll();
    
    expect(MockBrowserManager.getActiveInstanceCount()).toBe(0);
    
    // 各インスタンスが正しくクリーンアップされているか確認
    for (const manager of managers) {
      expect(manager.isInitialized).toBe(false);
    }
  });

  test('getActiveInstanceCount()が正確なインスタンス数を返す', async () => {
    expect(MockBrowserManager.getActiveInstanceCount()).toBe(0);
    
    const manager1 = new MockBrowserManager();
    await manager1.initialize();
    managers.push(manager1);
    expect(MockBrowserManager.getActiveInstanceCount()).toBe(1);
    
    const manager2 = new MockBrowserManager();
    await manager2.initialize();
    managers.push(manager2);
    expect(MockBrowserManager.getActiveInstanceCount()).toBe(2);
    
    await manager1.cleanup();
    expect(MockBrowserManager.getActiveInstanceCount()).toBe(1);
    
    await manager2.cleanup();
    expect(MockBrowserManager.getActiveInstanceCount()).toBe(0);
  });

  test('インスタンス追跡が正しく動作する', async () => {
    const manager = new MockBrowserManager();
    
    // 初期化前はインスタンス数に含まれない
    expect(MockBrowserManager.getActiveInstanceCount()).toBe(0);
    
    // 初期化後はインスタンス数に含まれる
    await manager.initialize();
    managers.push(manager);
    expect(MockBrowserManager.getActiveInstanceCount()).toBe(1);
    
    // クリーンアップ後はインスタンス数から除外される
    await manager.cleanup();
    expect(MockBrowserManager.getActiveInstanceCount()).toBe(0);
  });
});
