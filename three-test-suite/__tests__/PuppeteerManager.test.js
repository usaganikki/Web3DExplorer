import { PuppeteerManager } from '../src/PuppeteerManager.js';
import { BrowserManager } from '../src/BrowserManager.js';
import { EnvironmentInspector } from '../src/EnvironmentInspector.js';
import { PerformanceTester } from '../src/PerformanceTester.js';
import { HTMLGenerator } from '../src/HTMLGenerator.js';

describe('PuppeteerManager - ファサードクラスとしてのテスト', () => {
  let manager;

  beforeEach(async () => {
    manager = new PuppeteerManager({ headless: true });
    await manager.initialize();
  });

  afterEach(async () => {
    if (manager) {
      await manager.cleanup();
      manager = null;
    }
  });

  test('initializeとcleanupがBrowserManagerに委譲される', () => {
    expect(manager.browserManager).toBeInstanceOf(BrowserManager);
    expect(manager.isInitialized()).toBe(true);
  });

  test('getWebGLInfoがEnvironmentInspectorに委譲される', async () => {
    const webglInfo = await manager.getWebGLInfo();
    expect(webglInfo).toBeDefined();
    expect(webglInfo.webglSupported).toBe(true);
  });

  test('benchmarkWebAssemblyがPerformanceTesterに委譲される', async () => {
    const perf = await manager.benchmarkWebAssembly();
    expect(perf).toBeDefined();
    expect(perf.executionTime).toBeGreaterThanOrEqual(0);
  });

  test('generateTestHTMLがHTMLGeneratorに委譲される', () => {
    const html = manager.generateTestHTML(() => {});
    expect(html).toContain('three.min.js');
  });
  
  test('page getterがBrowserManagerのpageを返す', () => {
    expect(manager.page).toBe(manager.browserManager.page);
  });

  test('browser getterがBrowserManagerのbrowserを返す', () => {
    expect(manager.browser).toBe(manager.browserManager.browser);
  });
  
  test('options getterがBrowserManagerのoptionsを返す', () => {
    expect(manager.options).toBe(manager.browserManager.options);
  });
});

describe('PuppeteerManager - Three.jsシーン注入', () => {
  let manager;

  beforeEach(async () => {
    manager = new PuppeteerManager({ headless: true });
    await manager.initialize();
  });

  afterEach(async () => {
    if (manager) {
      await manager.cleanup();
      manager = null;
    }
  });

  test('シーンセットアップ関数が実行される', async () => {
    await manager.loadThreeScene(() => {
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera();
      renderer = new THREE.WebGLRenderer();
      window.setupComplete = true;
    });
    
    const setupComplete = await manager.page.evaluate(() => window.setupComplete);
    expect(setupComplete).toBe(true);
  });

  test('window.sceneReadyが true になる', async () => {
    await manager.loadThreeScene(() => {
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera();
      renderer = new THREE.WebGLRenderer();
    });
    
    const sceneReady = await manager.page.evaluate(() => window.sceneReady);
    expect(sceneReady).toBe(true);
  });

  test('エラーが発生した場合の適切な処理', async () => {
    await expect(manager.loadThreeScene(() => {
      throw new Error('Test error');
    })).rejects.toThrow('Test error');
  });

  test('loadThreeScene()は初期化前に呼ぶとエラーを投げる', async () => {
    const uninitializedManager = new PuppeteerManager();
    
    await expect(uninitializedManager.loadThreeScene(() => {})).rejects.toThrow('PuppeteerManager is not initialized');
  });

  test('無効なシーン関数でエラーを投げる', async () => {
    await expect(manager.loadThreeScene('not a function')).rejects.toThrow('sceneBuilderFunction must be a function');
    await expect(manager.loadThreeScene(null)).rejects.toThrow('sceneBuilderFunction must be a function');
    await expect(manager.loadThreeScene(undefined)).rejects.toThrow('sceneBuilderFunction must be a function');
  });

  test('Three.jsオブジェクトが正しく作成される', async () => {
    await manager.loadThreeScene(() => {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('three-canvas') });
      
      const isValidWebGLRenderer = (
        renderer instanceof THREE.WebGLRenderer &&
        renderer.constructor === THREE.WebGLRenderer &&
        typeof renderer.render === 'function' &&
        typeof renderer.setSize === 'function'
      );
      
      window.sceneObjects = {
        sceneType: scene.type,
        cameraType: camera.type,
        isValidWebGLRenderer: isValidWebGLRenderer,
        rendererHasRenderMethod: typeof renderer.render === 'function',
        rendererHasSetSizeMethod: typeof renderer.setSize === 'function',
        sceneName: scene.name || 'Scene',
        threeAvailable: typeof THREE !== 'undefined',
        webglRendererAvailable: typeof THREE !== 'undefined' && typeof THREE.WebGLRenderer !== 'undefined',
        isRendererInstanceOfWebGL: renderer instanceof THREE.WebGLRenderer,
        rendererConstructorName: renderer.constructor.name
      };
    });
    
    const sceneObjects = await manager.page.evaluate(() => window.sceneObjects);
    
    expect(sceneObjects.threeAvailable).toBe(true);
    expect(sceneObjects.webglRendererAvailable).toBe(true);
    expect(sceneObjects.isRendererInstanceOfWebGL).toBe(true);
    expect(sceneObjects.isValidWebGLRenderer).toBe(true);
    expect(sceneObjects.rendererHasRenderMethod).toBe(true);
    expect(sceneObjects.rendererHasSetSizeMethod).toBe(true);
    expect(sceneObjects.sceneType).toBe('Scene');
    expect(sceneObjects.cameraType).toBe('PerspectiveCamera');
  });

  test('複雑なシーンセットアップが実行される', async () => {
    await manager.loadThreeScene(() => {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('three-canvas') });
      
      const geometry = new THREE.BoxGeometry();
      const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
      const cube = new THREE.Mesh(geometry, material);
      scene.add(cube);
      
      const light = new THREE.DirectionalLight(0xffffff, 1);
      scene.add(light);
      
      camera.position.z = 5;
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.render(scene, camera);
      
      window.sceneAnalysis = {
        objectCount: scene.children.length,
        hasLight: scene.children.some(child => child.type.includes('Light')),
        hasMesh: scene.children.some(child => child.type === 'Mesh'),
        cameraPosition: { x: camera.position.x, y: camera.position.y, z: camera.position.z }
      };
    });
    
    const analysis = await manager.page.evaluate(() => window.sceneAnalysis);
    expect(analysis.objectCount).toBe(2);
    expect(analysis.hasLight).toBe(true);
    expect(analysis.hasMesh).toBe(true);
    expect(analysis.cameraPosition.z).toBe(5);
  });

  test('カスタムオプションが適用される', async () => {
    await manager.loadThreeScene(() => {
      window.customSceneLoaded = true;
    }, {
      title: 'Custom Scene Test',
      threeJsVersion: 'r128',
      timeout: 15000
    });
    
    const customSceneLoaded = await manager.page.evaluate(() => window.customSceneLoaded);
    expect(customSceneLoaded).toBe(true);
    
    const title = await manager.page.title();
    expect(title).toBe('Custom Scene Test');
  });

  test('Three.js r140のロードテスト', async () => {
    await manager.loadThreeScene(() => {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera();
      const renderer = new THREE.WebGLRenderer();
      
      window.r140TestComplete = true;
      window.threeVersion = THREE.REVISION || 'unknown';
    }, {
      threeJsVersion: 'r140',
      timeout: 30000
    });
    
    const testComplete = await manager.page.evaluate(() => window.r140TestComplete);
    const threeVersion = await manager.page.evaluate(() => window.threeVersion);
    
    expect(testComplete).toBe(true);
    expect(threeVersion).toBeDefined();
  });
});
