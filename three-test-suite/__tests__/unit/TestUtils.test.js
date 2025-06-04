import { TestUtils, TestPatterns } from '../../src/utils/TestUtils.js';
import { BrowserManager } from '../../src/BrowserManager.js';

describe('TestUtils - 基本機能テスト', () => {
  describe('createIsolatedBrowserInstance', () => {
    test('独立したブラウザインスタンスが作成される', async () => {
      const browserManager = await TestUtils.createIsolatedBrowserInstance();
      
      expect(browserManager).toBeInstanceOf(BrowserManager);
      expect(browserManager.isInitialized()).toBe(true);
      expect(browserManager.page).toBeDefined();
      expect(browserManager.browser).toBeDefined();
      
      await browserManager.cleanup();
    }, 30000);

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
    }, 30000);
  });

  describe('resetGlobalState', () => {
    let browserManager;

    beforeEach(async () => {
      browserManager = await TestUtils.createIsolatedBrowserInstance();
    });

    afterEach(async () => {
      if (browserManager && browserManager.isInitialized()) {
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

      expect(afterReset.testProperty).toBeUndefined();
      expect(afterReset.sceneReady).toBeUndefined();
      expect(afterReset.cubeRendered).toBeUndefined();
    });

    test('pageオブジェクトが無効な場合はエラーを投げる', async () => {
      await expect(TestUtils.resetGlobalState(null)).rejects.toThrow('Page object is required for resetting global state');
      await expect(TestUtils.resetGlobalState(undefined)).rejects.toThrow('Page object is required for resetting global state');
    });
  });

  describe('setupTest と cleanupTest', () => {
    test('統一的なテスト環境セットアップ', async () => {
      const testEnv = await TestUtils.setupTest();

      expect(testEnv).toBeDefined();
      expect(testEnv.browserManager).toBeInstanceOf(BrowserManager);
      expect(testEnv.page).toBeDefined();
      expect(testEnv.browser).toBeDefined();
      expect(testEnv.browserManager.isInitialized()).toBe(true);

      await TestUtils.cleanupTest(testEnv);

      // クリーンアップ後の状態確認
      expect(testEnv.page).toBeNull();
      expect(testEnv.browser).toBeNull();
      expect(testEnv.browserManager).toBeNull();
    }, 30000);

    test('カスタムオプションでのセットアップ', async () => {
      const options = {
        browserOptions: { width: 1200, height: 800 },
        timeout: 20000
      };

      const testEnv = await TestUtils.setupTest(options);

      expect(testEnv.browserManager.options.width).toBe(1200);
      expect(testEnv.browserManager.options.height).toBe(800);

      await TestUtils.cleanupTest(testEnv);
    }, 30000);

    test('nullでのクリーンアップは安全に処理される', async () => {
      await expect(TestUtils.cleanupTest(null)).resolves.not.toThrow();
      await expect(TestUtils.cleanupTest(undefined)).resolves.not.toThrow();
    });
  });

  describe('waitForCondition', () => {
    let browserManager;

    beforeEach(async () => {
      browserManager = await TestUtils.createIsolatedBrowserInstance();
    });

    afterEach(async () => {
      if (browserManager && browserManager.isInitialized()) {
        await browserManager.cleanup();
      }
    });

    test('条件が満たされるまで待機する', async () => {
      // 1秒後にフラグをtrueにする
      await browserManager.page.evaluate(() => {
        setTimeout(() => {
          window.testCondition = true;
        }, 1000);
      });

      await TestUtils.waitForCondition(
        browserManager.page,
        'window.testCondition === true',
        { timeout: 5000, interval: 100 }
      );

      const condition = await browserManager.page.evaluate(() => window.testCondition);
      expect(condition).toBe(true);
    });

    test('タイムアウト時にエラーを投げる', async () => {
      await expect(
        TestUtils.waitForCondition(
          browserManager.page,
          'window.nonExistentCondition === true',
          { timeout: 1000, retries: 1 }
        )
      ).rejects.toThrow('Condition not met within timeout');
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
  });
});

describe('TestPatterns - テストパターンヘルパー', () => {
  describe('withBrowserManager', () => {
    test('BrowserManagerを使用するテストパターン', async () => {
      let testExecuted = false;
      let receivedBrowserManager = null;
      let receivedPage = null;

      await TestPatterns.withBrowserManager(async (browserManager, page) => {
        testExecuted = true;
        receivedBrowserManager = browserManager;
        receivedPage = page;

        expect(browserManager).toBeInstanceOf(BrowserManager);
        expect(browserManager.isInitialized()).toBe(true);
        expect(page).toBeDefined();
      });

      expect(testExecuted).toBe(true);
      // クリーンアップ後はnullになっている
      expect(receivedBrowserManager).not.toBeNull();
      expect(receivedPage).not.toBeNull();
    }, 30000);
  });

  describe('withThreeJsScene', () => {
    test('Three.jsシーンを使用するテストパターン', async () => {
      let testExecuted = false;

      const sceneBuilder = () => {
        window.testScene = new THREE.Scene();
        window.sceneBuilt = true;
      };

      await TestPatterns.withThreeJsScene(
        sceneBuilder,
        async (browserManager, page) => {
          testExecuted = true;

          const sceneBuilt = await page.evaluate(() => window.sceneBuilt);
          expect(sceneBuilt).toBe(true);

          const hasScene = await page.evaluate(() => !!window.testScene);
          expect(hasScene).toBe(true);
        }
      );

      expect(testExecuted).toBe(true);
    }, 45000); // Three.js読み込み時間を考慮して長めに設定
  });
});

describe('TestUtils統合テスト', () => {
  test('複数のテストが独立して実行される', async () => {
    // 最初のテスト環境
    const testEnv1 = await TestUtils.setupTest();
    await testEnv1.page.evaluate(() => {
      window.testId = 'test1';
      window.uniqueValue = Math.random();
    });
    const test1Value = await testEnv1.page.evaluate(() => window.uniqueValue);

    // 2番目のテスト環境（独立）
    const testEnv2 = await TestUtils.setupTest();
    await testEnv2.page.evaluate(() => {
      window.testId = 'test2';
      window.uniqueValue = Math.random();
    });
    const test2Value = await testEnv2.page.evaluate(() => window.uniqueValue);

    // 両方のテスト環境が独立していることを確認
    expect(test1Value).not.toBe(test2Value);

    const test1Id = await testEnv1.page.evaluate(() => window.testId);
    const test2Id = await testEnv2.page.evaluate(() => window.testId);

    expect(test1Id).toBe('test1');
    expect(test2Id).toBe('test2');

    // クリーンアップ
    await TestUtils.cleanupTest(testEnv1);
    await TestUtils.cleanupTest(testEnv2);
  }, 60000);
});