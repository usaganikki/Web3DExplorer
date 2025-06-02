import { HTMLGenerator } from '../src/HTMLGenerator.js';
import { BrowserManager } from '../src/BrowserManager.js'; // For tests that need to load HTML

describe('HTMLGenerator - HTMLテンプレート', () => {
  let htmlGenerator;
  let browserManager; // For tests that need to load HTML

  beforeAll(() => {
    htmlGenerator = new HTMLGenerator();
  });

  beforeEach(async () => {
    // Initialize browserManager only for tests that need it
  });

  afterEach(async () => {
    if (browserManager && browserManager.isInitialized()) {
      await browserManager.cleanup();
    }
    browserManager = null; // Reset for next test
  });

  test('基本HTMLテンプレートが生成される', () => {
    const html = htmlGenerator.generateTestHTML(() => {});
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('three.min.js');
    expect(html).toContain('<canvas');
    expect(html).toContain('id="three-canvas"');
  });

  test('ユーザースクリプトが注入される', () => {
    const userScript = () => { console.log('test'); };
    const html = htmlGenerator.generateTestHTML(userScript);
    expect(html).toContain(userScript.toString());
  });

  test('生成HTMLがページに読み込める', async () => {
    browserManager = new BrowserManager(); // Initialize for this test
    await browserManager.initialize();
    const html = htmlGenerator.generateTestHTML(() => { window.testValue = 'loaded'; });
    await browserManager.page.setContent(html);
    const testValue = await browserManager.page.evaluate(() => window.testValue);
    expect(testValue).toBe('loaded');
  });

  test('Three.js CDNが正しく読み込まれる', async () => {
    browserManager = new BrowserManager(); // Initialize for this test
    await browserManager.initialize();
    const html = htmlGenerator.generateTestHTML(() => {});
    await browserManager.page.setContent(html);
    await browserManager.page.waitForFunction('typeof THREE !== "undefined"', { timeout: 10000 }); // Increased timeout
    const threeLoaded = await browserManager.page.evaluate(() => typeof THREE !== 'undefined');
    expect(threeLoaded).toBe(true);
  });

  test('カスタムタイトルが設定される', () => {
    const customTitle = 'Custom Three.js Test';
    const html = htmlGenerator.generateTestHTML(() => {}, { title: customTitle });
    expect(html).toContain(`<title>${customTitle}</title>`);
  });

  test('異なるThree.jsバージョンが指定できる', () => {
    const customVersion = 'r140';
    const html = htmlGenerator.generateTestHTML(() => {}, { threeJsVersion: customVersion });
    expect(html).toContain(`/three.js/${customVersion}/three.min.js`);
  });

  test('自動実行を無効にできる', () => {
    const userScript = () => { console.log('test'); };
    const html = htmlGenerator.generateTestHTML(userScript, { autoExecute: false });
    expect(html).toContain('window.userScript');
    expect(html).not.toContain("window.addEventListener('load'");
  });

  test('無効なユーザースクリプトでエラーを投げる', () => {
    expect(() => htmlGenerator.generateTestHTML('not a function')).toThrow('userScript must be a function');
    expect(() => htmlGenerator.generateTestHTML(null)).toThrow('userScript must be a function');
  });
  
  test('デバッグ情報要素が含まれる', () => {
    const html = htmlGenerator.generateTestHTML(() => {});
    expect(html).toContain('class="debug-info"');
    expect(html).toContain('id="debug-info"');
  });

  test('複雑なユーザースクリプトが正しく注入される', async () => {
    browserManager = new BrowserManager(); // Initialize for this test
    await browserManager.initialize();
    const complexScript = () => {
      window.testObject = {
        value: 42,
        array: [1, 2, 3],
        method: function() { return 'method called'; }
      };
    };
    const html = htmlGenerator.generateTestHTML(complexScript);
    await browserManager.page.setContent(html);
    const testObject = await browserManager.page.evaluate(() => window.testObject);
    expect(testObject.value).toBe(42);
    expect(testObject.array).toEqual([1, 2, 3]);
    const methodResult = await browserManager.page.evaluate(() => window.testObject.method());
    expect(methodResult).toBe('method called');
  });
});
