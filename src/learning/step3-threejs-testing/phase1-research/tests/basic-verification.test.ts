/**
 * 基本動作確認テスト - 段階的検証
 */

describe('基本動作確認', () => {
  test('Jest環境が正常に動作すること', () => {
    expect(1 + 1).toBe(2);
  });

  test('DOM要素が作成できること', () => {
    const div = document.createElement('div');
    expect(div).toBeInstanceOf(HTMLDivElement);
  });

  test('Canvas要素が作成できること', () => {
    const canvas = document.createElement('canvas');
    expect(canvas).toBeInstanceOf(HTMLCanvasElement);
  });
});
