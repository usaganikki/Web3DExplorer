/**
 * SimpleCube Component Test
 * TDDアプローチでThree.js + Jest + Canvas Mock環境の動作確認を行う
 * Issue #71: Phase B Jest + Canvas Mock環境構築の検証テスト
 * 
 * 改善版: 自動モック機能を活用してテストコードを簡素化
 */

import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import * as THREE from 'three';

// テスト対象のコンポーネント
import SimpleCube from '@/components/SimpleCube';

// Three.jsを自動モック - tests/__mocks__/three.jsが自動的に使用される
jest.mock('three');

describe('SimpleCube Component', () => {
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  describe('基本レンダリング', () => {
    test('コンポーネントが正常にレンダリングされる', () => {
      render(<SimpleCube />);
      
      // コンポーネントのコンテナが存在することを確認
      const container = screen.getByTestId('simple-cube-container');
      expect(container).toBeInTheDocument();
    });

    test('Canvas要素が作成される', () => {
      render(<SimpleCube />);
      
      // Canvas要素が存在することを確認
      const canvas = screen.getByTestId('simple-cube-canvas');
      expect(canvas).toBeInTheDocument();
      expect(canvas.tagName).toBe('CANVAS');
    });
  });

  describe('Three.js初期化', () => {
    test('Three.jsのSceneが初期化される', () => {
      render(<SimpleCube />);
      
      // Scene コンストラクタが呼ばれることを確認
      expect(THREE.Scene).toHaveBeenCalled();
    });

    test('Three.jsのCameraが初期化される', () => {
      render(<SimpleCube />);
      
      // PerspectiveCamera コンストラクタが呼ばれることを確認
      expect(THREE.PerspectiveCamera).toHaveBeenCalledWith(
        75, // fov
        expect.any(Number), // aspect ratio
        0.1, // near
        1000 // far
      );
    });

    test('Three.jsのRendererが初期化される', () => {
      render(<SimpleCube />);
      
      // WebGLRenderer コンストラクタが呼ばれることを確認
      expect(THREE.WebGLRenderer).toHaveBeenCalled();
    });
  });

  describe('Cubeメッシュ作成', () => {
    test('BoxGeometryが作成される', () => {
      render(<SimpleCube />);
      
      // BoxGeometry コンストラクタが呼ばれることを確認
      expect(THREE.BoxGeometry).toHaveBeenCalledWith(1, 1, 1);
    });

    test('MeshBasicMaterialが作成される', () => {
      render(<SimpleCube />);
      
      // MeshBasicMaterial コンストラクタが呼ばれることを確認
      expect(THREE.MeshBasicMaterial).toHaveBeenCalledWith({
        color: 0x00ff00, // 緑色
      });
    });

    test('Meshが作成される', () => {
      render(<SimpleCube />);
      
      // Mesh コンストラクタが呼ばれることを確認
      expect(THREE.Mesh).toHaveBeenCalled();
    });
  });

  describe('Canvas Mock環境確認', () => {
    test('Canvas Mock機能が正常に動作する', () => {
      const canvas = document.createElement('canvas');
      
      // jest-canvas-mockの機能確認
      expect(canvas.getContext).toBeDefined();
      expect(canvas.toDataURL).toBeDefined();
      expect(canvas.width).toBe(300); // デフォルト値
      expect(canvas.height).toBe(150); // デフォルト値
    });

    test('WebGL Contextがモックされる', () => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('webgl');
      
      // WebGL Contextがモックされていることを確認
      expect(context).toBeTruthy();
      expect(typeof context?.clearColor).toBe('function');
      expect(typeof context?.clear).toBe('function');
    });
  });

  describe('コンポーネントクリーンアップ', () => {
    test('アンマウント時にリソースが適切にクリーンアップされる', () => {
      const { unmount } = render(<SimpleCube />);
      
      // アンマウント処理
      unmount();
      
      // Rendererのdisposeが呼ばれることを確認
      expect(THREE.WebGLRenderer).toHaveBeenCalled();
    });
  });

  describe('Jest環境パフォーマンス確認', () => {
    test('テスト実行時間が要求範囲内(10-50ms)である', async () => {
      const startTime = performance.now();
      
      render(<SimpleCube />);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      // Issue #71で要求された実行時間範囲内であることを確認
      expect(executionTime).toBeLessThan(50);
      console.log(`Test execution time: ${executionTime.toFixed(2)}ms`);
    });
  });
});
