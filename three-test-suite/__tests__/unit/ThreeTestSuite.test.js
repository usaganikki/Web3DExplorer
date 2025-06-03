/**
 * ThreeTestSuite のテスト
 * Issue #18 Phase1で追加されたThreeTestSuiteクラスの単体テスト
 */
import { ThreeTestSuite } from '../../src/threejs/ThreeTestSuite.js';
import { BrowserManager } from '../../src/BrowserManager.js';

describe('ThreeTestSuite', () => {
  let browserManager;
  let threeTestSuite;

  beforeEach(async () => {
    browserManager = new BrowserManager({
      headless: true,
      timeout: 10000
    });
    await browserManager.initialize();
    threeTestSuite = new ThreeTestSuite(browserManager);
  });

  afterEach(async () => {
    if (browserManager && browserManager.isInitialized()) {
      await browserManager.cleanup();
    }
  });

  describe('Constructor', () => {
    it('should create ThreeTestSuite instance with BrowserManager', () => {
      expect(threeTestSuite).toBeInstanceOf(ThreeTestSuite);
      expect(threeTestSuite.browserManager).toBe(browserManager);
    });

    it('should throw error when BrowserManager is not provided', () => {
      expect(() => {
        new ThreeTestSuite();
      }).toThrow('BrowserManager instance is required');
    });

    it('should throw error when null BrowserManager is provided', () => {
      expect(() => {
        new ThreeTestSuite(null);
      }).toThrow('BrowserManager instance is required');
    });
  });

  describe('Initialization', () => {
    it('should initialize without errors', async () => {
      await expect(threeTestSuite.initialize()).resolves.not.toThrow();
    });
  });

  describe('SceneInspector Management', () => {
    it('should return null for SceneInspector initially', () => {
      const inspector = threeTestSuite.getSceneInspector();
      expect(inspector).toBeNull();
    });
  });

  describe('Three.js Scene Loading', () => {
    it('should throw error when BrowserManager is not initialized', async () => {
      const uninitializedBrowserManager = new BrowserManager();
      const uninitializedSuite = new ThreeTestSuite(uninitializedBrowserManager);
      
      const sceneFunction = () => {
        const scene = new THREE.Scene();
        window.scene = scene;
      };

      await expect(
        uninitializedSuite.loadThreeScene(sceneFunction)
      ).rejects.toThrow('BrowserManager is not initialized');
    });

    it('should throw error when sceneBuilderFunction is not a function', async () => {
      await expect(
        threeTestSuite.loadThreeScene('not a function')
      ).rejects.toThrow('sceneBuilderFunction must be a function');
    });

    it('should throw error when sceneBuilderFunction is null', async () => {
      await expect(
        threeTestSuite.loadThreeScene(null)
      ).rejects.toThrow('sceneBuilderFunction must be a function');
    });

    it('should load Three.js scene successfully', async () => {
      const sceneFunction = () => {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer();
        
        window.scene = scene;
        window.camera = camera;
        window.renderer = renderer;
      };

      await expect(
        threeTestSuite.loadThreeScene(sceneFunction, { timeout: 15000 })
      ).resolves.not.toThrow();
    }, 20000);

    it('should handle custom timeout option', async () => {
      const sceneFunction = () => {
        const scene = new THREE.Scene();
        window.scene = scene;
      };

      await expect(
        threeTestSuite.loadThreeScene(sceneFunction, { timeout: 5000 })
      ).resolves.not.toThrow();
    }, 10000);
  });

  describe('HTML Generation', () => {
    it('should generate valid HTML with default options', () => {
      const html = threeTestSuite._generateThreeJsHTML();
      
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<title>Three.js Test Scene</title>');
      expect(html).toContain('three.js/0.163.0/three.min.js');
      expect(html).toContain('window.threeJsLoaded = false');
    });

    it('should generate HTML with custom options', () => {
      const options = {
        title: 'Custom Test Scene',
        threeJsVersion: '0.150.0'
      };
      
      const html = threeTestSuite._generateThreeJsHTML(options);
      
      expect(html).toContain('<title>Custom Test Scene</title>');
      expect(html).toContain('three.js/0.150.0/three.min.js');
    });
  });

  describe('Future Features (Placeholders)', () => {
    it('should return placeholder for runComprehensiveTest', async () => {
      const result = await threeTestSuite.runComprehensiveTest();
      
      expect(result).toMatchObject({
        success: true,
        message: expect.stringContaining('Phase2 feature')
      });
      expect(result.timestamp).toBeDefined();
    });

    it('should return empty array for getVisibleObjects', async () => {
      const objects = await threeTestSuite.getVisibleObjects();
      expect(objects).toEqual([]);
    });

    it('should return placeholder for validateRendering', async () => {
      const result = await threeTestSuite.validateRendering();
      
      expect(result).toMatchObject({
        success: true,
        message: expect.stringContaining('Phase3 feature')
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle scene execution errors gracefully', async () => {
      const errorFunction = () => {
        throw new Error('Test scene error');
      };

      await expect(
        threeTestSuite.loadThreeScene(errorFunction, { timeout: 5000 })
      ).rejects.toThrow();
    }, 10000);

    it('should timeout properly when Three.js loading takes too long', async () => {
      const sceneFunction = () => {
        const scene = new THREE.Scene();
        window.scene = scene;
      };

      // 非常に短いタイムアウトを設定してタイムアウトをテスト
      await expect(
        threeTestSuite.loadThreeScene(sceneFunction, { timeout: 1 })
      ).rejects.toThrow(/timeout/);
    }, 10000);
  });
});
