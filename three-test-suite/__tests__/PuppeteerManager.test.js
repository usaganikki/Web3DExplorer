import { PuppeteerManager } from '../src/PuppeteerManager.js';

describe('PuppeteerManager - 基本機能', () => {
  test('正常に初期化できる', async () => {
    const manager = new PuppeteerManager();
    await manager.initialize();
    
    expect(manager.browser).toBeDefined();
    expect(manager.page).toBeDefined();
    
    await manager.cleanup();
  });

  test('cleanup後はブラウザが終了している', async () => {
    const manager = new PuppeteerManager();
    await manager.initialize();
    
    // cleanup前にブラウザの存在確認
    expect(manager.browser).toBeDefined();
    expect(manager.isInitialized()).toBe(true);
    
    await manager.cleanup();
    
    // cleanup後の状態確認
    expect(manager.browser).toBeNull();
    expect(manager.page).toBeNull();
    expect(manager.isInitialized()).toBe(false);
  });

  test('オプションでヘッドレスモードを設定できる', async () => {
    const manager = new PuppeteerManager({ headless: false });
    await manager.initialize();
    
    expect(manager.options.headless).toBe(false);
    
    await manager.cleanup();
  });

  test('デフォルトオプションが正しく設定される', () => {
    const manager = new PuppeteerManager();
    
    expect(manager.options.headless).toBe(true);
    expect(manager.options.width).toBe(1024);
    expect(manager.options.height).toBe(768);
    expect(manager.options.args).toContain('--enable-webgl');
    expect(manager.options.args).toContain('--disable-web-security');
  });

  test('二重初期化を防ぐ', async () => {
    const manager = new PuppeteerManager();
    await manager.initialize();
    
    // 二回目の初期化は何もしない
    await manager.initialize();
    
    expect(manager.browser).toBeDefined();
    
    await manager.cleanup();
  });

  test('初期化前のcleanupは何もしない', async () => {
    const manager = new PuppeteerManager();
    
    // エラーを投げない
    await expect(manager.cleanup()).resolves.not.toThrow();
  });
});

describe('PuppeteerManager - WebGL機能', () => {
  test('WebGLコンテキストが取得できる', async () => {
    const manager = new PuppeteerManager();
    await manager.initialize();
    
    const webglSupported = await manager.page.evaluate(() => {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl');
      return gl !== null;
    });
    
    expect(webglSupported).toBe(true);
    await manager.cleanup();
  });

  test('WebGL2も利用可能', async () => {
    const manager = new PuppeteerManager();
    await manager.initialize();
    
    const webgl2Supported = await manager.page.evaluate(() => {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2');
      return gl !== null;
    });
    
    expect(webgl2Supported).toBe(true);
    await manager.cleanup();
  });

  test('WebGLの基本情報が取得できる', async () => {
    const manager = new PuppeteerManager();
    await manager.initialize();
    
    const webglInfo = await manager.page.evaluate(() => {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl');
      if (!gl) return null;
      
      return {
        vendor: gl.getParameter(gl.VENDOR),
        renderer: gl.getParameter(gl.RENDERER),
        version: gl.getParameter(gl.VERSION)
      };
    });
    
    expect(webglInfo).not.toBeNull();
    expect(webglInfo.vendor).toBeDefined();
    expect(webglInfo.renderer).toBeDefined();
    expect(webglInfo.version).toBeDefined();
    
    await manager.cleanup();
  });

  test('getWebGLInfo()メソッドでWebGL情報を取得できる', async () => {
    const manager = new PuppeteerManager();
    await manager.initialize();
    
    const webglInfo = await manager.getWebGLInfo();
    
    expect(webglInfo).toBeDefined();
    expect(webglInfo.webglSupported).toBe(true);
    expect(webglInfo.webgl2Supported).toBeDefined();
    expect(webglInfo.vendor).toBeDefined();
    expect(webglInfo.renderer).toBeDefined();
    expect(webglInfo.version).toBeDefined();
    
    await manager.cleanup();
  });

  test('getWebGLInfo()は初期化前に呼ぶとエラーを投げる', async () => {
    const manager = new PuppeteerManager();
    
    await expect(manager.getWebGLInfo()).rejects.toThrow('PuppeteerManager is not initialized');
  });
});

describe('PuppeteerManager - HTMLテンプレート', () => {
  test('基本HTMLテンプレートが生成される', () => {
    const manager = new PuppeteerManager();
    const html = manager.generateTestHTML(() => {});
    
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('three.min.js');
    expect(html).toContain('<canvas');
    expect(html).toContain('id="three-canvas"');
  });

  test('ユーザースクリプトが注入される', () => {
    const manager = new PuppeteerManager();
    const userScript = () => { console.log('test'); };
    const html = manager.generateTestHTML(userScript);
    
    expect(html).toContain(userScript.toString());
  });

  test('生成HTMLがページに読み込める', async () => {
    const manager = new PuppeteerManager();
    await manager.initialize();
    
    const html = manager.generateTestHTML(() => {
      window.testValue = 'loaded';
    });
    
    await manager.page.setContent(html);
    
    const testValue = await manager.page.evaluate(() => window.testValue);
    expect(testValue).toBe('loaded');
    
    await manager.cleanup();
  });

  test('Three.js CDNが正しく読み込まれる', async () => {
    const manager = new PuppeteerManager();
    await manager.initialize();
    
    const html = manager.generateTestHTML(() => {});
    await manager.page.setContent(html);
    
    // Three.jsライブラリが読み込まれるまで待つ
    await manager.page.waitForFunction('typeof THREE !== "undefined"', { timeout: 5000 });
    
    const threeLoaded = await manager.page.evaluate(() => typeof THREE !== 'undefined');
    expect(threeLoaded).toBe(true);
    
    await manager.cleanup();
  });

  test('カスタムタイトルが設定される', () => {
    const manager = new PuppeteerManager();
    const customTitle = 'Custom Three.js Test';
    const html = manager.generateTestHTML(() => {}, { title: customTitle });
    
    expect(html).toContain(`<title>${customTitle}</title>`);
  });

  test('異なるThree.jsバージョンが指定できる', () => {
    const manager = new PuppeteerManager();
    const customVersion = 'r140';
    const html = manager.generateTestHTML(() => {}, { threeJsVersion: customVersion });
    
    expect(html).toContain(`/three.js/${customVersion}/three.min.js`);
  });

  test('自動実行を無効にできる', () => {
    const manager = new PuppeteerManager();
    const userScript = () => { console.log('test'); };
    const html = manager.generateTestHTML(userScript, { autoExecute: false });
    
    expect(html).toContain('window.userScript');
    expect(html).not.toContain('window.addEventListener(\'load\'');
  });

  test('無効なユーザースクリプトでエラーを投げる', () => {
    const manager = new PuppeteerManager();
    
    expect(() => {
      manager.generateTestHTML('not a function');
    }).toThrow('userScript must be a function');
    
    expect(() => {
      manager.generateTestHTML(null);
    }).toThrow('userScript must be a function');
    
    expect(() => {
      manager.generateTestHTML(undefined);
    }).toThrow('userScript must be a function');
  });

  test('デバッグ情報要素が含まれる', () => {
    const manager = new PuppeteerManager();
    const html = manager.generateTestHTML(() => {});
    
    expect(html).toContain('class="debug-info"');
    expect(html).toContain('id="debug-info"');
  });

  test('複雑なユーザースクリプトが正しく注入される', async () => {
    const manager = new PuppeteerManager();
    await manager.initialize();
    
    const complexScript = () => {
      window.testObject = {
        value: 42,
        array: [1, 2, 3],
        method: function() { return 'method called'; }
      };
    };
    
    const html = manager.generateTestHTML(complexScript);
    await manager.page.setContent(html);
    
    const testObject = await manager.page.evaluate(() => window.testObject);
    expect(testObject.value).toBe(42);
    expect(testObject.array).toEqual([1, 2, 3]);
    
    const methodResult = await manager.page.evaluate(() => window.testObject.method());
    expect(methodResult).toBe('method called');
    
    await manager.cleanup();
  });
});
