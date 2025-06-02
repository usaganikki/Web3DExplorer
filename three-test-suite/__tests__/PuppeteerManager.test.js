// TDD Step 1: RED - テストを先に書く（このテストは失敗する）
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