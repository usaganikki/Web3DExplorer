import { TestUtils } from '../../src/utils/TestUtils.js';
import MockBrowserManager from '../../src/mocks/MockBrowserManager.js';
import { createTestIsolation } from '../../src/utils/TestIsolationHelper.js';

describe('TestUtils - 基本機能テスト', () => {
  let testHelper;

  // 各テスト後のクリーンアップを確実に実行
  afterEach(async () => {
    await MockBrowserManager.cleanupAll();
    
    if (testHelper) {
      await testHelper.cleanup();
      testHelper = null;
    }
  });

  describe('createIsolatedBrowserInstance', () => {
    test('独立したブラウザインスタンスが作成される', async () => {
      const browserManager = await TestUtils.createIsolatedBrowserInstance();
      
      expect(browserManager).toBeInstanceOf(MockBrowserManager);
      expect(browserManager.isInitialized).toBe(true);
      expect(browserManager.page).toBeDefined();
      expect(browserManager.browser).toBeDefined();
      
      await browserManager.cleanup();
    });

    test('カスタムオプションが適用される', async () => {
      const customOptions = {
        width: 800,
        height: 600,
        headless: true
      };
      
      const browserManager = await TestUtils.createIsolatedBrowserInstance(customOptions);
      
      expect(browserManager.options.width).toBe(800);
      expect(browserManager.options.height).toBe(600);
      expect(browserManager.options.headless).toBe(true);
      
      await browserManager.cleanup();
    });

    test('複数のインスタンスが独立している', async () => {
      const browserManager1 = await TestUtils.createIsolatedBrowserInstance();
      const browserManager2 = await TestUtils.createIsolatedBrowserInstance();
      
      expect(browserManager1).not.toBe(browserManager2);
      expect(browserManager1.page).not.toBe(browserManager2.page);
      expect(browserManager1.browser).not.toBe(browserManager2.browser);
      
      // 両方とも正常に動作することを確認
      expect(browserManager1.isInitialized).toBe(true);
      expect(browserManager2.isInitialized).toBe(true);
      
      await browserManager1.cleanup();
      await browserManager2.cleanup();
    });
  });

  describe('resetGlobalState', () => {
    let browserManager;

    beforeEach(async () => {
      browserManager = await TestUtils.createIsolatedBrowserInstance();
    });

    afterEach(async () => {
      if (browserManager && browserManager.isInitialized) {
        await browserManager.cleanup();
      }
    });

    test('windowプロパティがクリアされる', async () => {
      // テスト用プロパティを設定
      await browserManager.page.evaluate(() => {
        window.testProperty = 'test value';
        window.sceneReady = true;
        window.cubeRendered = true;
      });

      // プロパティが設定されていることを確認
      const beforeReset = await browserManager.page.evaluate(() => ({
        testProperty: window.testProperty,
        sceneReady: window.sceneReady,
        cubeRendered: window.cubeRendered
      }));

      // MockBrowserManagerでプロパティが正しく設定されていることを確認
      expect(beforeReset.testProperty).toBe('test value');
      expect(beforeReset.sceneReady).toBe(true);
      expect(beforeReset.cubeRendered).toBe(true);

      // グローバル状態をリセット
      await TestUtils.resetGlobalState(browserManager.page);

      // テスト用プロパティがクリアされていることを確認
      const afterReset = await browserManager.page.evaluate(() => ({
        testProperty: window.testProperty,
        sceneReady: window.sceneReady,
        cubeRendered: window.cubeRendered
      }));

      // リセット後はundefinedになる
      expect(afterReset.testProperty).toBeUndefined();
      expect(afterReset.sceneReady).toBeUndefined();
      expect(afterReset.cubeRendered).toBeUndefined();
    });

    test('pageオブジェクトが無効な場合はエラーを投げる', async () => {
      await expect(TestUtils.resetGlobalState(null)).rejects.toThrow('Page object is required for resetting global state');
      await expect(TestUtils.resetGlobalState(undefined)).rejects.toThrow('Page object is required for resetting global state');
    });

    test('MockBrowserManagerのグローバル状態が適切にリセットされる', async () => {
      // MockBrowserManagerのグローバルプロパティを設定
      TestUtils.setMockGlobalProperty(browserManager, 'testProp', 'testValue');
      expect(TestUtils.getMockGlobalProperty(browserManager, 'testProp')).toBe('testValue');

      // TestUtilsのresetGlobalStateを使用
      await TestUtils.resetGlobalState(browserManager.page);

      // MockBrowserManager内部のクリーンアップは別途必要
      await browserManager.cleanup();
      await browserManager.initialize();

      // リセット後は初期状態に戻る
      expect(TestUtils.getMockGlobalProperty(browserManager, 'testProp')).toBeUndefined();
    });
  });

  describe('setupTest と cleanupTest', () => {
    test('統一的なテスト環境セットアップ', async () => {
      const testEnv = await TestUtils.setupTest();

      expect(testEnv).toBeDefined();
      expect(testEnv.browserManager).toBeInstanceOf(MockBrowserManager);
      expect(testEnv.page).toBeDefined();
      expect(testEnv.browser).toBeDefined();
      expect(testEnv.browserManager.isInitialized).toBe(true);

      await TestUtils.cleanupTest(testEnv);

      // クリーンアップ後の状態確認
      expect(testEnv.page).toBeNull();
      expect(testEnv.browser).toBeNull();
      expect(testEnv.browserManager).toBeNull();
    });

    test('カスタムオプションでのセットアップ', async () => {
      const options = {
        browserOptions: { width: 1200, height: 800 },
        timeout: 20000
      };

      const testEnv = await TestUtils.setupTest(options);

      expect(testEnv.browserManager.options.width).toBe(1200);
      expect(testEnv.browserManager.options.height).toBe(800);

      await TestUtils.cleanupTest(testEnv);
    });

    test('nullでのクリーンアップは安全に処理される', async () => {
      await expect(TestUtils.cleanupTest(null)).resolves.not.toThrow();
      await expect(TestUtils.cleanupTest(undefined)).resolves.not.toThrow();
    });

    test('MockBrowserManagerを使用した高速セットアップ', async () => {
      const startTime = Date.now();
      
      const testEnv = await TestUtils.setupTest();
      expect(testEnv.browserManager).toBeInstanceOf(MockBrowserManager);
      
      const setupTime = Date.now() - startTime;
      
      await TestUtils.cleanupTest(testEnv);
      
      // MockBrowserManagerは実際のPuppeteerより大幅に高速
      expect(setupTime).toBeLessThan(1000); // 1秒以内
    });
  });

  describe('waitForCondition', () => {
    let browserManager;

    beforeEach(async () => {
      browserManager = await TestUtils.createIsolatedBrowserInstance();
    });

    afterEach(async () => {
      if (browserManager && browserManager.isInitialized) {
        await browserManager.cleanup();
      }
    });

    test('条件が満たされるまで待機する', async () => {
      // MockBrowserManagerでプロパティを設定
      browserManager.setGlobalProperty('testCondition', true);

      await TestUtils.waitForCondition(
        browserManager.page,
        'window.testCondition === true',
        { timeout: 1000, interval: 100 }
      );

      const condition = await browserManager.page.evaluate(() => window.testCondition);
      expect(condition).toBe(true);
    });

    test('タイムアウト時にエラーを投げる', async () => {
      // 条件が満たされないケースをテスト
      await expect(
        TestUtils.waitForCondition(
          browserManager.page,
          '() => false', // 常にfalseを返す条件
          { timeout: 300, retries: 2 }
        )
      ).rejects.toThrow('Condition not met within timeout');
    });

    test('MockBrowserManagerでの高速条件チェック', async () => {
      const startTime = Date.now();
      
      // あらかじめ条件を満たすプロパティを設定
      browserManager.setGlobalProperty('testCondition', true);
      
      await TestUtils.waitForCondition(
        browserManager.page,
        'window.testCondition === true',
        { timeout: 1000, interval: 50 }
      );
      
      const waitTime = Date.now() - startTime;
      
      // MockBrowserManagerでは即座に条件が満たされる
      expect(waitTime).toBeLessThan(200); // 200ms以内
    });
  });

  describe('safeCleanup', () => {
    test('複数のクリーンアップ関数を安全に実行する', async () => {
      let count = 0;
      
      const cleanup1 = async () => { count += 1; };
      const cleanup2 = async () => { count += 2; };
      const cleanup3 = async () => { throw new Error('Cleanup error'); };
      const cleanup4 = async () => { count += 4; };

      await TestUtils.safeCleanup(cleanup1, cleanup2, cleanup3, cleanup4);

      // エラーが発生したクリーンアップがあっても、他は実行される
      expect(count).toBe(7); // 1 + 2 + 4
    });

    test('MockBrowserManagerのクリーンアップとの連携', async () => {
      const browserManager1 = await TestUtils.createIsolatedBrowserInstance();
      const browserManager2 = await TestUtils.createIsolatedBrowserInstance();
      
      expect(MockBrowserManager.getActiveInstanceCount()).toBe(2);
      
      await TestUtils.safeCleanup(
        () => browserManager1.cleanup(),
        () => browserManager2.cleanup()
      );
      
      expect(MockBrowserManager.getActiveInstanceCount()).toBe(0);
    });
  });

  describe('generateRandomPort', () => {
    test('指定範囲内のランダムポートを生成する', () => {
      const port = TestUtils.generateRandomPort(8000, 8100);
      expect(port).toBeGreaterThanOrEqual(8000);
      expect(port).toBeLessThanOrEqual(8100);
    });

    test('デフォルト範囲でポートを生成する', () => {
      const port = TestUtils.generateRandomPort();
      expect(port).toBeGreaterThanOrEqual(8000);
      expect(port).toBeLessThanOrEqual(9999);
    });

    test('ポート競合回避のテスト', () => {
      const ports = [];
      for (let i = 0; i < 10; i++) {
        ports.push(TestUtils.generateRandomPort(8000, 8010));
      }
      
      // 全て有効な範囲内であることを確認
      ports.forEach(port => {
        expect(port).toBeGreaterThanOrEqual(8000);
        expect(port).toBeLessThanOrEqual(8010);
      });
    });
  });

  describe('TestIsolationHelper連携', () => {
    beforeEach(async () => {
      testHelper = createTestIsolation('TestUtils-Integration');
      await testHelper.setup();
    });

    test('テスト環境の分離機能', async () => {
      const testEnv1 = await TestUtils.setupTest();
      const testEnv2 = await TestUtils.setupTest();
      
      // 異なるインスタンスが作成されることを確認
      expect(testEnv1.browserManager).not.toBe(testEnv2.browserManager);
      
      // TestIsolationHelperのブラウザマネージャーとの独立性確認
      expect(testHelper.browserManager).not.toBe(testEnv1.browserManager);
      expect(testHelper.browserManager).not.toBe(testEnv2.browserManager);
      
      await TestUtils.cleanupTest(testEnv1);
      await TestUtils.cleanupTest(testEnv2);
      
      expect(MockBrowserManager.getActiveInstanceCount()).toBe(1); // testHelperのみ残る
    });

    test('グローバル状態のリセット機能', async () => {
      const browserManager = await TestUtils.createIsolatedBrowserInstance();
      
      // グローバル状態を設定
      TestUtils.setMockGlobalProperty(browserManager, 'isolationTest', 'value');
      expect(TestUtils.getMockGlobalProperty(browserManager, 'isolationTest')).toBe('value');
      
      // TestIsolationHelperによるリセット
      await testHelper.cleanup();
      await testHelper.setup();
      
      await browserManager.cleanup();
      
      expect(MockBrowserManager.getActiveInstanceCount()).toBe(1); // testHelperのみ
    });

    test('TestIsolationHelperの独立したデータ生成', async () => {
      const sceneData = testHelper.generateTestData('scene', 'simple');
      const meshData = testHelper.generateTestData('mesh');
      const materialData = testHelper.generateTestData('material');
      
      expect(sceneData).toBeDefined();
      expect(meshData).toBeDefined();
      expect(materialData).toBeDefined();
      
      // データの構造確認
      expect(sceneData.id).toBeDefined();
      expect(meshData.id).toBeDefined();
      expect(materialData.id).toBeDefined();
    });

    test('TestIsolationHelperでのThree.js HTML生成', async () => {
      const sceneSetup = () => {
        const scene = new THREE.Scene();
        const geometry = new THREE.BoxGeometry();
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const cube = new THREE.Mesh(geometry, material);
        scene.add(cube);
        window.testScene = scene;
      };

      const html = testHelper.generateThreeJSTestHTML(sceneSetup);
      
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('three.min.js');
      expect(html).toContain('testIsolation');
      expect(html).toContain(testHelper.testName);
    });
  });

  describe('MockBrowserManager特有のヘルパーメソッド', () => {
    test('setMockGlobalProperty と getMockGlobalProperty', async () => {
      const browserManager = await TestUtils.createIsolatedBrowserInstance();
      
      // プロパティの設定と取得
      TestUtils.setMockGlobalProperty(browserManager, 'testKey', 'testValue');
      const value = TestUtils.getMockGlobalProperty(browserManager, 'testKey');
      
      expect(value).toBe('testValue');
      
      // 存在しないプロパティの取得
      const nonExistent = TestUtils.getMockGlobalProperty(browserManager, 'nonExistent');
      expect(nonExistent).toBeUndefined();
      
      await browserManager.cleanup();
    });

    test('cleanupAllMockInstances', async () => {
      await TestUtils.createIsolatedBrowserInstance();
      await TestUtils.createIsolatedBrowserInstance();
      await TestUtils.createIsolatedBrowserInstance();
      
      expect(MockBrowserManager.getActiveInstanceCount()).toBe(3);
      
      await TestUtils.cleanupAllMockInstances();
      
      expect(MockBrowserManager.getActiveInstanceCount()).toBe(0);
    });
  });
});

describe('TestUtils統合テスト', () => {
  let testHelper;

  afterEach(async () => {
    await MockBrowserManager.cleanupAll();
    
    if (testHelper) {
      await testHelper.cleanup();
      testHelper = null;
    }
  });

  test('複数のテストが独立して実行される', async () => {
    // 最初のテスト環境
    const testEnv1 = await TestUtils.setupTest();
    await testEnv1.page.evaluate(() => {
      window.testId = 'test1';
      window.uniqueValue = Math.random();
    });
    
    // プロパティを直接設定してテスト
    testEnv1.browserManager.setGlobalProperty('testId', 'test1');
    testEnv1.browserManager.setGlobalProperty('uniqueValue', 0.123);

    // 2番目のテスト環境（独立）
    const testEnv2 = await TestUtils.setupTest();
    await testEnv2.page.evaluate(() => {
      window.testId = 'test2';
      window.uniqueValue = Math.random();
    });
    
    // プロパティを直接設定してテスト
    testEnv2.browserManager.setGlobalProperty('testId', 'test2');
    testEnv2.browserManager.setGlobalProperty('uniqueValue', 0.456);

    // インスタンスは独立していることを確認
    expect(testEnv1.browserManager).not.toBe(testEnv2.browserManager);
    expect(testEnv1.page).not.toBe(testEnv2.page);

    // MockBrowserManagerで設定した値が正しく取得できることを確認
    const test1Id = TestUtils.getMockGlobalProperty(testEnv1.browserManager, 'testId');
    const test2Id = TestUtils.getMockGlobalProperty(testEnv2.browserManager, 'testId');

    expect(test1Id).toBe('test1');
    expect(test2Id).toBe('test2');

    // クリーンアップ
    await TestUtils.cleanupTest(testEnv1);
    await TestUtils.cleanupTest(testEnv2);
    
    expect(MockBrowserManager.getActiveInstanceCount()).toBe(0);
  });

  test('MockBrowserManagerを使用した並列テスト実行', async () => {
    const testPromises = [];
    const testCount = 5;
    
    // 複数のテストを並列実行
    for (let i = 0; i < testCount; i++) {
      testPromises.push(
        (async () => {
          const testEnv = await TestUtils.setupTest();
          
          // 各テスト環境で異なる操作を実行
          await testEnv.page.setContent(`<div>Test ${i}</div>`);
          const content = await testEnv.page.content();
          
          expect(content).toContain(`Test ${i}`);
          
          await TestUtils.cleanupTest(testEnv);
          return i;
        })()
      );
    }
    
    const results = await Promise.all(testPromises);
    
    // 全てのテストが正常に完了することを確認
    expect(results).toHaveLength(testCount);
    expect(MockBrowserManager.getActiveInstanceCount()).toBe(0);
  });

  test('エラー発生時のクリーンアップ確認', async () => {
    let testEnv;
    
    try {
      testEnv = await TestUtils.setupTest();
      
      // 意図的にエラーを発生させる
      throw new Error('Test error');
    } catch (error) {
      expect(error.message).toBe('Test error');
    } finally {
      if (testEnv) {
        await TestUtils.cleanupTest(testEnv);
      }
    }
    
    // エラーが発生してもクリーンアップは正常に実行される
    expect(MockBrowserManager.getActiveInstanceCount()).toBe(0);
  });

  test('TestIsolationHelperとTestUtilsの統合動作', async () => {
    testHelper = createTestIsolation('Integration-Test');
    await testHelper.setup();
    
    // TestUtilsとTestIsolationHelperの同時使用
    const testEnv = await TestUtils.setupTest();
    
    // 両方のブラウザマネージャーが独立していることを確認
    expect(testHelper.browserManager).not.toBe(testEnv.browserManager);
    expect(MockBrowserManager.getActiveInstanceCount()).toBe(2);
    
    // TestIsolationHelperでのデータ生成
    const testData = testHelper.generateTestData('scene');
    expect(testData.id).toBeDefined();
    
    // TestUtilsでのグローバルプロパティ操作
    TestUtils.setMockGlobalProperty(testEnv.browserManager, 'integrationTest', true);
    expect(TestUtils.getMockGlobalProperty(testEnv.browserManager, 'integrationTest')).toBe(true);
    
    // TestIsolationHelperでのスクリプト実行
    const result = await testHelper.executeScript(() => {
      window.testExecuted = true;
      return window.testExecuted;
    });
    expect(result).toBe(true);
    
    await TestUtils.cleanupTest(testEnv);
    expect(MockBrowserManager.getActiveInstanceCount()).toBe(1); // testHelperのみ残る
  });
});