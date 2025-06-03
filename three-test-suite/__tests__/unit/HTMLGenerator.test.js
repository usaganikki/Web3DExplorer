import { HTMLGenerator } from '../../src/HTMLGenerator.js';
import { BrowserManager } from '../../src/BrowserManager.js'; // For tests that need to load HTML

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
    expect(html).toContain('https://cdnjs.cloudflare.com/ajax/libs/three.js/0.128.0/three.min.js'); // デフォルトバージョン確認
    expect(html).toContain('<canvas');
    expect(html).toContain('id="three-canvas"');
  });

  test('ユーザースクリプトが注入される', () => {
    const userScript = () => { console.log('test'); };
    const html = htmlGenerator.generateTestHTML(userScript);
    expect(html).toContain(userScript.toString());
  });

  test('カスタムタイトルが設定される', () => {
    const customTitle = 'Custom Three.js Test';
    const html = htmlGenerator.generateTestHTML(() => {}, { title: customTitle });
    expect(html).toContain(`<title>${customTitle}</title>`);
  });

  test('異なるThree.jsバージョンが指定できる', () => {
    const customVersion = '0.140.0'; // 0.xxx.xxx 形式に修正
    const html = htmlGenerator.generateTestHTML(() => {}, { threeJsVersion: customVersion });
    expect(html).toContain(`https://cdnjs.cloudflare.com/ajax/libs/three.js/${customVersion}/three.min.js`); // 0.172.0 より古いので three.min.js
  });

  test('異なるThree.jsバージョンが指定できる (0.172.0以降)', () => {
    const customVersion = '0.172.0';
    const html = htmlGenerator.generateTestHTML(() => {}, { threeJsVersion: customVersion });
    expect(html).toContain(`https://cdnjs.cloudflare.com/ajax/libs/three.js/${customVersion}/three.core.min.js`); // 0.172.0 以降なので three.core.min.js
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
});
