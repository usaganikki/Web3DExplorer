/**
 * SceneInspector のテスト
 * Issue #18 Phase1で追加されたSceneInspectorクラスの単体テスト
 */
import { SceneInspector } from '../src/threejs/SceneInspector.js';
import { BrowserManager } from '../src/BrowserManager.js';
import { HTMLGenerator } from '../src/HTMLGenerator.js';

describe('SceneInspector', () => {
  let browserManager;
  let sceneInspector;
  let htmlGenerator;

  beforeEach(async () => {
    browserManager = new BrowserManager({
      headless: true,
      timeout: 10000
    });
    await browserManager.initialize();
    sceneInspector = new SceneInspector(browserManager);
    htmlGenerator = new HTMLGenerator();
  });

  afterEach(async () => {
    if (browserManager && browserManager.isInitialized()) {
      await browserManager.cleanup();
    }
  });

  describe('Constructor', () => {
    it('should create SceneInspector instance with BrowserManager', () => {
      expect(sceneInspector).toBeInstanceOf(SceneInspector);
      expect(sceneInspector.browserManager).toBe(browserManager);
    });

    it('should throw error when BrowserManager is not provided', () => {
      expect(() => {
        new SceneInspector();
      }).toThrow('BrowserManager instance is required');
    });

    it('should throw error when null BrowserManager is provided', () => {
      expect(() => {
        new SceneInspector(null);
      }).toThrow('BrowserManager instance is required');
    });
  });

  describe('Scene Information Retrieval', () => {
    beforeEach(async () => {
      // Three.jsシーンをセットアップ
      const htmlContent = htmlGenerator.generateTestHTML(() => {}, {
        threeJsVersion: '0.163.0',
        autoExecute: false
      });
      
      await browserManager.page.setContent(htmlContent, {
        waitUntil: 'networkidle0',
        timeout: 10000
      });

      // Three.jsの読み込み完了を待機
      await browserManager.page.waitForFunction(
        () => typeof THREE !== 'undefined' && typeof THREE.Scene === 'function',
        { timeout: 10000 }
      );
    });

    it('should throw error when BrowserManager is not initialized', async () => {
      const uninitializedBrowserManager = new BrowserManager();
      const uninitializedInspector = new SceneInspector(uninitializedBrowserManager);
      
      await expect(
        uninitializedInspector.getSceneInfo()
      ).rejects.toThrow('BrowserManager is not initialized');
    });

    it('should return unavailable status when scene is not found', async () => {
      const sceneInfo = await sceneInspector.getSceneInfo();
      
      expect(sceneInfo).toMatchObject({
        available: false,
        error: 'Scene not found in window.scene'
      });
    });

    it('should return scene information when scene exists', async () => {
      // シーンを作成
      await browserManager.page.evaluate(() => {
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x404040);
        window.scene = scene;
      });

      const sceneInfo = await sceneInspector.getSceneInfo();
      
      expect(sceneInfo).toMatchObject({
        available: true,
        children: 0,
        background: expect.any(String),
        fog: null,
        autoUpdate: true,
        matrixAutoUpdate: true,
        uuid: expect.any(String),
        type: 'Scene'
      });
    });

    it('should return scene with fog information', async () => {
      await browserManager.page.evaluate(() => {
        const scene = new THREE.Scene();
        scene.fog = new THREE.Fog(0xcccccc, 10, 15);
        window.scene = scene;
      });

      const sceneInfo = await sceneInspector.getSceneInfo();
      
      expect(sceneInfo.fog).toMatchObject({
        type: 'Fog',
        near: 10,
        far: 15,
        color: expect.any(Number)
      });
    });
  });

  describe('Camera Information Retrieval', () => {
    beforeEach(async () => {
      const htmlContent = htmlGenerator.generateTestHTML(() => {}, {
        threeJsVersion: '0.163.0',
        autoExecute: false
      });
      
      await browserManager.page.setContent(htmlContent, {
        waitUntil: 'networkidle0',
        timeout: 10000
      });

      await browserManager.page.waitForFunction(
        () => typeof THREE !== 'undefined',
        { timeout: 10000 }
      );
    });

    it('should return unavailable status when camera is not found', async () => {
      const cameraInfo = await sceneInspector.getCameraInfo();
      
      expect(cameraInfo).toMatchObject({
        available: false,
        error: 'Camera not found in window.camera'
      });
    });

    it('should return camera information when camera exists', async () => {
      await browserManager.page.evaluate(() => {
        const camera = new THREE.PerspectiveCamera(75, 16/9, 0.1, 1000);
        camera.position.set(0, 0, 5);
        window.camera = camera;
      });

      const cameraInfo = await sceneInspector.getCameraInfo();
      
      expect(cameraInfo).toMatchObject({
        available: true,
        type: 'PerspectiveCamera',
        position: {
          x: 0,
          y: 0,
          z: 5
        },
        rotation: {
          x: expect.any(Number),
          y: expect.any(Number),
          z: expect.any(Number)
        },
        fov: 75,
        aspect: expect.any(Number),
        near: 0.1,
        far: 1000,
        zoom: 1,
        uuid: expect.any(String)
      });
    });

    it('should handle orthographic camera', async () => {
      await browserManager.page.evaluate(() => {
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 1000);
        window.camera = camera;
      });

      const cameraInfo = await sceneInspector.getCameraInfo();
      
      expect(cameraInfo.type).toBe('OrthographicCamera');
      expect(cameraInfo.fov).toBeNull();
    });
  });

  describe('Renderer Information Retrieval', () => {
    beforeEach(async () => {
      const htmlContent = htmlGenerator.generateTestHTML(() => {}, {
        threeJsVersion: '0.163.0',
        autoExecute: false
      });
      
      await browserManager.page.setContent(htmlContent, {
        waitUntil: 'networkidle0',
        timeout: 10000
      });

      await browserManager.page.waitForFunction(
        () => typeof THREE !== 'undefined',
        { timeout: 10000 }
      );
    });

    it('should return unavailable status when renderer is not found', async () => {
      const rendererInfo = await sceneInspector.getRendererInfo();
      
      expect(rendererInfo).toMatchObject({
        available: false,
        error: 'Renderer not found in window.renderer'
      });
    });

    it('should return renderer information when renderer exists', async () => {
      await browserManager.page.evaluate(() => {
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(800, 600);
        window.renderer = renderer;
      });

      const rendererInfo = await sceneInspector.getRendererInfo();
      
      expect(rendererInfo).toMatchObject({
        available: true,
        type: 'WebGLRenderer',
        size: {
          width: expect.any(Number),
          height: expect.any(Number)
        },
        pixelRatio: expect.any(Number),
        shadowMap: {
          enabled: expect.any(Boolean),
          type: expect.any(Number)
        },
        autoClear: expect.any(Boolean),
        sortObjects: expect.any(Boolean)
      });
    });
  });

  describe('Comprehensive Information', () => {
    beforeEach(async () => {
      const htmlContent = htmlGenerator.generateTestHTML(() => {}, {
        threeJsVersion: '0.163.0',
        autoExecute: false
      });
      
      await browserManager.page.setContent(htmlContent, {
        waitUntil: 'networkidle0',
        timeout: 10000
      });

      await browserManager.page.waitForFunction(
        () => typeof THREE !== 'undefined',
        { timeout: 10000 }
      );
    });

    it('should return comprehensive information for complete scene', async () => {
      // 完全なシーンをセットアップ
      await browserManager.page.evaluate(() => {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, 16/9, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(800, 600);
        
        window.scene = scene;
        window.camera = camera;
        window.renderer = renderer;
      });

      const info = await sceneInspector.getComprehensiveInfo();
      
      expect(info).toMatchObject({
        timestamp: expect.any(String),
        scene: {
          available: true
        },
        camera: {
          available: true
        },
        renderer: {
          available: true
        },
        status: {
          sceneReady: true,
          cameraReady: true,
          rendererReady: true,
          allReady: true
        }
      });
    });

    it('should return mixed status when only some components are available', async () => {
      await browserManager.page.evaluate(() => {
        const scene = new THREE.Scene();
        window.scene = scene;
        // cameraとrendererは意図的にセットしない
      });

      const info = await sceneInspector.getComprehensiveInfo();
      
      expect(info.status).toMatchObject({
        sceneReady: true,
        cameraReady: false,
        rendererReady: false,
        allReady: false
      });
    });
  });

  describe('Utility Methods', () => {
    beforeEach(async () => {
      const htmlContent = htmlGenerator.generateTestHTML(() => {}, {
        threeJsVersion: '0.163.0',
        autoExecute: false
      });
      
      await browserManager.page.setContent(htmlContent, {
        waitUntil: 'networkidle0',
        timeout: 10000
      });

      await browserManager.page.waitForFunction(
        () => typeof THREE !== 'undefined',
        { timeout: 10000 }
      );
    });

    it('should return 0 object count when scene is not available', async () => {
      const count = await sceneInspector.getObjectCount();
      expect(count).toBe(0);
    });

    it('should return correct object count when scene has objects', async () => {
      await browserManager.page.evaluate(() => {
        const scene = new THREE.Scene();
        const cube = new THREE.Mesh(
          new THREE.BoxGeometry(),
          new THREE.MeshBasicMaterial({ color: 0x00ff00 })
        );
        scene.add(cube);
        window.scene = scene;
      });

      const count = await sceneInspector.getObjectCount();
      expect(count).toBe(1);
    });

    it('should return Three.js status information', async () => {
      const status = await sceneInspector.getThreeJsStatus();
      
      expect(status).toMatchObject({
        threeLoaded: true,
        version: expect.any(String),
        webglAvailable: expect.any(Boolean),
        webgl2Available: expect.any(Boolean),
        sceneReady: expect.any(Boolean),
        threeJsLoaded: expect.any(Boolean)
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle page evaluation errors gracefully', async () => {
      // ブラウザをクローズしてエラー状態を作る
      await browserManager.cleanup();
      
      await expect(
        sceneInspector.getSceneInfo()
      ).rejects.toThrow();
    });

    it('should provide meaningful error messages', async () => {
      await browserManager.cleanup();
      
      try {
        await sceneInspector.getCameraInfo();
      } catch (error) {
        expect(error.message).toContain('Failed to get camera info');
      }
    });
  });
});