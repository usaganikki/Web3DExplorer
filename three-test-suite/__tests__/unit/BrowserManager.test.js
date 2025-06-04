/**
 * BrowserManager 単体テスト - モック版
 * テスト間の独立性を確保し、実際のPuppeteerへの依存を排除
 */

import MockBrowserManager from '../../src/mocks/MockBrowserManager.js';
import { TestDataGenerator } from '../../src/utils/TestDataGenerator.js';
import { initializeTestMocks } from '../../src/mocks/MockWebGL.js';

describe('BrowserManager - Phase2 独立性テスト', () => {
  let testDataGenerator;

  // 各テストの前にモック環境を初期化
  beforeAll(() => {
    initializeTestMocks();
  });

  beforeEach(() => {
    // 独立したテストデータジェネレーターを作成
    testDataGenerator = new TestDataGenerator(Date.now());
  });

  afterEach(async () => {
    // 各テスト後にすべてのモックインスタンスをクリーンアップ
    await MockBrowserManager.cleanupAll();
    
    // データジェネレーターをリセット
    testDataGenerator.resetCounters();
  });

  describe('基本機能 - 独立性確保', () => {
    test('各テストで独立したBrowserManagerインスタンスを作成', async () => {
      const testConfig = testDataGenerator.generateTestSuiteConfig('unit');
      const manager1 = new MockBrowserManager(testConfig.viewport);
      const manager2 = new MockBrowserManager(testConfig.viewport);
      
      await manager1.initialize();
      await manager2.initialize();
      
      // インスタンスが独立していることを確認
      expect(manager1).not.toBe(manager2);
      expect(manager1.page).not.toBe(manager2.page);
      expect(manager1.browser).not.toBe(manager2.browser);
      
      // アクティブインスタンス数の確認
      expect(MockBrowserManager.getActiveInstanceCount()).toBe(2);
      
      await manager1.cleanup();
      await manager2.cleanup();
      
      // クリーンアップ後はインスタンス数が0になることを確認
      expect(MockBrowserManager.getActiveInstanceCount()).toBe(0);
    });

    test('正常に初期化できる - モック環境', async () => {
      const manager = new MockBrowserManager();
      await manager.initialize();
      
      expect(manager.browser).toBeDefined();
      expect(manager.page).toBeDefined();
      expect(manager.isInitialized).toBe(true);
      
      // モックオブジェクトの機能確認
      expect(typeof manager.browser.newPage).toBe('function');
      expect(typeof manager.page.goto).toBe('function');
      expect(typeof manager.page.evaluate).toBe('function');
      
      await manager.cleanup();
    });

    test('cleanup後はブラウザが終了している - 状態リセット', async () => {
      const manager = new MockBrowserManager();
      await manager.initialize();
      
      expect(manager.browser).toBeDefined();
      expect(manager.isInitialized).toBe(true);
      
      await manager.cleanup();
      
      expect(manager.isInitialized).toBe(false);
      expect(MockBrowserManager.getActiveInstanceCount()).toBe(0);
    });

    test('オプションでビューポートサイズを設定できる', async () => {
      const viewportData = testDataGenerator.generateTestSuiteConfig().viewport;
      const manager = new MockBrowserManager({
        width: viewportData.width,
        height: viewportData.height
      });
      
      await manager.initialize();
      
      expect(manager.options.width).toBe(viewportData.width);
      expect(manager.options.height).toBe(viewportData.height);
      
      // ページのビューポート設定確認
      await manager.page.setViewport(viewportData);
      const viewport = manager.page.viewport();
      expect(viewport.width).toBe(viewportData.width);
      expect(viewport.height).toBe(viewportData.height);
      
      await manager.cleanup();
    });

    test('デフォルトオプションが正しく設定される', () => {
      const manager = new MockBrowserManager();
      
      expect(manager.options.headless).toBe(true);
      expect(manager.options.width).toBe(1024);
      expect(manager.options.height).toBe(768);
    });

    test('二重初期化を防ぐ', async () => {
      const manager = new MockBrowserManager();
      await manager.initialize();
      
      // 二回目の初期化は例外を投げる
      await expect(manager.initialize()).rejects.toThrow('BrowserManager already initialized');
      
      expect(manager.browser).toBeDefined();
      await manager.cleanup();
    });

    test('初期化前のcleanupは何もしない', async () => {
      const manager = new MockBrowserManager();
      await expect(manager.cleanup()).resolves.not.toThrow();
      expect(manager.isInitialized).toBe(false);
    });
  });

  describe('Three.js環境のシミュレーション', () => {
    test('Three.jsライブラリの読み込みをシミュレート', async () => {
      const manager = new MockBrowserManager();
      await manager.initialize();
      
      const sceneData = testDataGenerator.generateSceneData('simple');
      const html = `
        <html>
          <head>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
          </head>
          <body>
            <canvas id="three-canvas"></canvas>
            <script>
              window.addEventListener('load', () => {
                const scene = new THREE.Scene();
                const mesh = new THREE.Mesh(
                  new THREE.BoxGeometry(),
                  new THREE.MeshBasicMaterial({ color: ${sceneData.objects[0].material.color} })
                );
                scene.add(mesh);
                window.testResult = {
                  sceneType: scene.type,
                  objectCount: scene.children.length,
                  meshType: mesh.type
                };
              });
            </script>
          </body>
        </html>
      `;
      
      await manager.page.setContent(html);
      
      // Three.jsオブジェクトの作成をシミュレート
      const result = await manager.page.evaluate(() => window.testResult);
      
      expect(result).toBeDefined();
      expect(result.sceneType).toBe('Scene');
      expect(result.objectCount).toBe(1);
      expect(result.meshType).toBe('Mesh');
      
      await manager.cleanup();
    });

    test('WebGLコンテキストの取得をシミュレート', async () => {
      const manager = new MockBrowserManager();
      await manager.initialize();
      
      const html = `
        <html>
          <body>
            <canvas id="test-canvas"></canvas>
            <script>
              const canvas = document.getElementById('test-canvas');
              const gl = canvas.getContext('webgl');
              window.webglTest = {
                contextExists: !!gl,
                vendor: gl ? gl.getParameter(gl.VENDOR) : null,
                renderer: gl ? gl.getParameter(gl.RENDERER) : null
              };
            </script>
          </body>
        </html>
      `;
      
      await manager.page.setContent(html);
      
      const webglTest = await manager.page.evaluate(() => window.webglTest);
      
      expect(webglTest.contextExists).toBe(true);
      expect(webglTest.vendor).toBe('Mock WebGL Vendor');
      expect(webglTest.renderer).toBe('Mock WebGL Renderer');
      
      await manager.cleanup();
    });

    test('複数のオブジェクトを含むシーンのシミュレート', async () => {
      const manager = new MockBrowserManager();
      await manager.initialize();
      
      const complexScene = testDataGenerator.generateSceneData('complex');
      const objectCount = complexScene.objects.length;
      
      const html = `
        <html>
          <head>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
          </head>
          <body>
            <canvas id="three-canvas"></canvas>
            <script>
              window.addEventListener('load', () => {
                const scene = new THREE.Scene();
                
                // 複数のオブジェクトを追加
                for (let i = 0; i < ${objectCount}; i++) {
                  const geometry = new THREE.BoxGeometry();
                  const material = new THREE.MeshBasicMaterial({ color: Math.random() * 0xffffff });
                  const mesh = new THREE.Mesh(geometry, material);
                  mesh.position.set(
                    (Math.random() - 0.5) * 20,
                    (Math.random() - 0.5) * 20,
                    (Math.random() - 0.5) * 20
                  );
                  scene.add(mesh);
                }
                
                window.complexSceneResult = {
                  totalObjects: scene.children.length,
                  expectedCount: ${objectCount},
                  sceneType: scene.type
                };
              });
            </script>
          </body>
        </html>
      `;
      
      await manager.page.setContent(html);
      
      const result = await manager.page.evaluate(() => window.complexSceneResult);
      
      expect(result.totalObjects).toBe(objectCount);
      expect(result.expectedCount).toBe(objectCount);
      expect(result.sceneType).toBe('Scene');
      
      await manager.cleanup();
    });
  });

  describe('エラーハンドリング - 独立性確保', () => {
    test('ページエラーが他のテストに影響しない', async () => {
      const manager1 = new MockBrowserManager();
      const manager2 = new MockBrowserManager();
      
      await manager1.initialize();
      await manager2.initialize();
      
      // manager1でエラーを発生させる
      const errorHtml = `
        <html>
          <body>
            <script>
              throw new Error('Test error in manager1');
            </script>
          </body>
        </html>
      `;
      
      await manager1.page.setContent(errorHtml);
      
      // manager2は正常に動作することを確認
      const normalHtml = `
        <html>
          <body>
            <script>
              window.normalTest = { success: true };
            </script>
          </body>
        </html>
      `;
      
      await manager2.page.setContent(normalHtml);
      const result = await manager2.page.evaluate(() => window.normalTest);
      
      expect(result.success).toBe(true);
      
      await manager1.cleanup();
      await manager2.cleanup();
    });

    test('リソースリークの検出', async () => {
      const initialCount = MockBrowserManager.getActiveInstanceCount();
      
      // 複数のマネージャーを作成
      const managers = [];
      for (let i = 0; i < 5; i++) {
        const manager = new MockBrowserManager();
        await manager.initialize();
        managers.push(manager);
      }
      
      expect(MockBrowserManager.getActiveInstanceCount()).toBe(initialCount + 5);
      
      // 一部をクリーンアップ
      await managers[0].cleanup();
      await managers[2].cleanup();
      
      expect(MockBrowserManager.getActiveInstanceCount()).toBe(initialCount + 3);
      
      // 残りをクリーンアップ
      await managers[1].cleanup();
      await managers[3].cleanup();
      await managers[4].cleanup();
      
      expect(MockBrowserManager.getActiveInstanceCount()).toBe(initialCount);
    });
  });

  describe('パフォーマンステスト - 独立性確保', () => {
    test('テスト実行時間の測定', async () => {
      const performanceData = testDataGenerator.generatePerformanceTestData('render');
      const manager = new MockBrowserManager();
      
      const startTime = Date.now();
      await manager.initialize();
      
      const html = `
        <html>
          <head>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
          </head>
          <body>
            <canvas id="three-canvas"></canvas>
            <script>
              window.addEventListener('load', () => {
                const startRender = performance.now();
                
                const scene = new THREE.Scene();
                const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
                const renderer = new THREE.WebGLRenderer();
                
                // パフォーマンステスト用のオブジェクト生成
                for (let i = 0; i < ${performanceData.triangleCount / 12}; i++) {
                  const mesh = new THREE.Mesh(
                    new THREE.BoxGeometry(),
                    new THREE.MeshBasicMaterial()
                  );
                  scene.add(mesh);
                }
                
                renderer.render(scene, camera);
                
                const endRender = performance.now();
                
                window.performanceResult = {
                  renderTime: endRender - startRender,
                  triangleCount: ${performanceData.triangleCount},
                  objectCount: scene.children.length
                };
              });
            </script>
          </body>
        </html>
      `;
      
      await manager.page.setContent(html);
      
      const result = await manager.page.evaluate(() => window.performanceResult);
      const totalTime = Date.now() - startTime;
      
      expect(result).toBeDefined();
      expect(result.objectCount).toBeGreaterThan(0);
      expect(totalTime).toBeLessThan(performanceData.expectedDuration);
      
      await manager.cleanup();
    });

    test('メモリ使用量の独立性', async () => {
      const manager1 = new MockBrowserManager();
      const manager2 = new MockBrowserManager();
      
      await manager1.initialize();
      await manager2.initialize();
      
      // manager1で大量のオブジェクトを作成
      const heavyHtml = `
        <html>
          <head>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
          </head>
          <body>
            <script>
              const scene = new THREE.Scene();
              for (let i = 0; i < 1000; i++) {
                scene.add(new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshBasicMaterial()));
              }
              window.heavySceneCount = scene.children.length;
            </script>
          </body>
        </html>
      `;
      
      await manager1.page.setContent(heavyHtml);
      
      // manager2は軽量なシーン
      const lightHtml = `
        <html>
          <head>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
          </head>
          <body>
            <script>
              const scene = new THREE.Scene();
              scene.add(new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshBasicMaterial()));
              window.lightSceneCount = scene.children.length;
            </script>
          </body>
        </html>
      `;
      
      await manager2.page.setContent(lightHtml);
      
      const heavyCount = await manager1.page.evaluate(() => window.heavySceneCount);
      const lightCount = await manager2.page.evaluate(() => window.lightSceneCount);
      
      expect(heavyCount).toBe(1000);
      expect(lightCount).toBe(1);
      
      // manager1のクリーンアップがmanager2に影響しないことを確認
      await manager1.cleanup();
      
      const lightCountAfterCleanup = await manager2.page.evaluate(() => window.lightSceneCount);
      expect(lightCountAfterCleanup).toBe(1);
      
      await manager2.cleanup();
    });
  });

  describe('データ整合性の検証', () => {
    test('テストデータジェネレーターとの統合', async () => {
      const sceneData = testDataGenerator.generateSceneData('medium');
      const errors = testDataGenerator.validateDataset(sceneData);
      
      expect(errors).toHaveLength(0);
      expect(sceneData.objects).toBeDefined();
      expect(sceneData.lights).toBeDefined();
      expect(sceneData.cameras).toBeDefined();
      
      const manager = new MockBrowserManager();
      await manager.initialize();
      
      // 生成されたデータを使用してシーンを構築
      const html = `
        <html>
          <head>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
          </head>
          <body>
            <script>
              const sceneData = ${JSON.stringify(sceneData)};
              const scene = new THREE.Scene();
              
              // オブジェクトを追加
              sceneData.objects.forEach(objData => {
                const mesh = new THREE.Mesh(
                  new THREE.BoxGeometry(),
                  new THREE.MeshBasicMaterial({ color: objData.material.color })
                );
                if (objData.position) {
                  mesh.position.set(objData.position.x, objData.position.y, objData.position.z);
                }
                scene.add(mesh);
              });
              
              window.sceneValidation = {
                expectedObjects: sceneData.objects.length,
                actualObjects: scene.children.length,
                sceneId: sceneData.id
              };
            </script>
          </body>
        </html>
      `;
      
      await manager.page.setContent(html);
      
      const validation = await manager.page.evaluate(() => window.sceneValidation);
      
      expect(validation.expectedObjects).toBe(validation.actualObjects);
      expect(validation.sceneId).toBe(sceneData.id);
      
      await manager.cleanup();
    });
  });
});
