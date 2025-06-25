/**
 * Three.js インポート確認テスト
 */

import * as THREE from 'three';

describe('Three.js インポート確認', () => {
  test('Three.js基本クラスが利用可能であること', () => {
    expect(THREE.Scene).toBeDefined();
    expect(THREE.WebGLRenderer).toBeDefined();
    expect(THREE.PerspectiveCamera).toBeDefined();
    expect(THREE.BoxGeometry).toBeDefined();
    expect(THREE.MeshBasicMaterial).toBeDefined();
    expect(THREE.Mesh).toBeDefined();
  });

  test('Three.jsオブジェクトのインスタンス化ができること', () => {
    expect(() => {
      const scene = new THREE.Scene();
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
      const cube = new THREE.Mesh(geometry, material);
      scene.add(cube);
    }).not.toThrow();
  });
});
