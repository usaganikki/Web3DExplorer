import { TestUtils, TestPatterns } from '../../src/utils/TestUtils.js';
import { HTMLGenerator } from '../../src/HTMLGenerator.js';

describe('TestPatterns - 統合テスト', () => {
  describe('withBrowserManager', () => {
    test('BrowserManagerを使用するテストパターン', async () => {
      let testExecuted = false;
      let receivedBrowserManager = null;
      let receivedPage = null;

      await TestPatterns.withBrowserManager(async (browserManager, page) => {
        testExecuted = true;
        receivedBrowserManager = browserManager;
        receivedPage = page;

        expect(browserManager).toBeDefined();
        expect(browserManager.isInitialized()).toBe(true);
        expect(page).toBeDefined();
      });

      expect(testExecuted).toBe(true);
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
    }, 45000);
  });

  describe('TestUtils + HTMLGenerator 統合', () => {
    test('HTMLGeneratorとTestUtilsの連携', async () => {
      const testEnv = await TestUtils.setupTest();
      const htmlGenerator = new HTMLGenerator();

      try {
        const html = htmlGenerator.generateTestHTML(() => {
          window.integrationTestComplete = true;
        });

        await testEnv.page.setContent(html);
        
        const result = await testEnv.page.evaluate(() => window.integrationTestComplete);
        expect(result).toBe(true);
      } finally {
        await TestUtils.cleanupTest(testEnv);
      }
    }, 30000);
  });

  describe('複数コンポーネント統合テスト', () => {
    test('TestUtils, BrowserManager, HTMLGeneratorの連携', async () => {
      const testEnv = await TestUtils.setupTest({
        browserOptions: { width: 800, height: 600 }
      });
      const htmlGenerator = new HTMLGenerator();

      try {
        // HTMLGenerator でテストページ生成
        const html = htmlGenerator.generateTestHTML(() => {
          window.multiComponentTest = {
            browserReady: true,
            pageWidth: window.innerWidth,
            pageHeight: window.innerHeight,
            timestamp: Date.now()
          };
        });

        // TestUtils管理下のBrowserManagerでページロード
        await testEnv.page.setContent(html);

        // 結果検証
        const result = await testEnv.page.evaluate(() => window.multiComponentTest);
        
        expect(result.browserReady).toBe(true);
        expect(result.pageWidth).toBe(800);
        expect(result.pageHeight).toBe(600);
        expect(result.timestamp).toBeDefined();

        // TestUtilsによるグローバル状態リセット
        await TestUtils.resetGlobalState(testEnv.page);

        const afterReset = await testEnv.page.evaluate(() => window.multiComponentTest);
        expect(afterReset).toBeUndefined();

      } finally {
        await TestUtils.cleanupTest(testEnv);
      }
    }, 45000);
  });
});