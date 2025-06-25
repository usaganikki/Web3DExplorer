/**
 * WebGL基本テスト
 */

describe('WebGL基本確認', () => {
  test('WebGLコンテキストが取得できること', () => {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl');
    
    expect(gl).toBeDefined();
    expect(gl).not.toBeNull();
  });

  test('WebGLコンテキストの基本メソッドが動作すること', () => {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl');
    
    expect(() => {
      gl!.clearColor(0.0, 0.0, 0.0, 1.0);
      gl!.clear(gl!.COLOR_BUFFER_BIT);
    }).not.toThrow();
  });
});
