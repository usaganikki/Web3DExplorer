// Three.js Canvas描画テストの型定義

import * as THREE from 'three';

// ============================================================================
// 基本テスト型定義
// ============================================================================

/** テスト結果の基本型 */
export interface TestResult {
  /** テスト成功フラグ */
  success: boolean;
  /** エラーメッセージまたは詳細情報 */
  message?: string;
  /** テスト実行時間（ミリ秒） */
  duration?: number;
  /** 追加のメタデータ */
  metadata?: Record<string, any>;
}

/** Canvas描画テスト用の基本設定 */
export interface CanvasTestConfig {
  /** Canvas幅 */
  width: number;
  /** Canvas高さ */
  height: number;
  /** 許容誤差（0-1の範囲） */
  tolerance: number;
  /** タイムアウト時間（ミリ秒） */
  timeout?: number;
}

// ============================================================================
// 各テスト手法用の型定義
// ============================================================================

/** Method 1: Data URL比較テスト結果 */
export interface DataURLTestResult extends TestResult {
  /** 期待するData URL */
  expectedDataURL?: string;
  /** 実際のData URL */
  actualDataURL?: string;
  /** 差異の割合（0-1） */
  diffPercentage?: number;
}

/** Method 2: ReadPixels比較テスト結果 */
export interface PixelTestResult extends TestResult {
  /** 期待するピクセルデータ */
  expectedPixels?: Uint8Array;
  /** 実際のピクセルデータ */
  actualPixels?: Uint8Array;
  /** ピクセル単位の差異配列 */
  pixelDiff?: number[];
}

/** Method 3: RenderTarget設定 */
export interface RenderTargetTestConfig {
  /** WebGLレンダーターゲット */
  renderTarget: THREE.WebGLRenderTarget;
  /** 描画対象シーン */
  scene: THREE.Scene;
  /** 使用カメラ */
  camera: THREE.Camera;
}

/** Method 4: Visual Regression設定 */
export interface VisualRegressionConfig {
  /** 参照画像ファイルパス */
  referenceImagePath: string;
  /** 差異閾値（0-1） */
  threshold: number;
  /** 差分画像出力パス */
  outputDiffPath?: string;
}

// ============================================================================
// Three.js拡張型定義
// ============================================================================

/** Three.jsテストシーン */
export interface ThreeJSTestScene {
  /** Three.jsシーン */
  scene: THREE.Scene;
  /** カメラ */
  camera: THREE.Camera;
  /** レンダラー */
  renderer: THREE.WebGLRenderer;
  /** クリーンアップ関数 */
  cleanup: () => void;
}

/** レンダリング設定 */
export interface RenderConfig {
  /** アンチエイリアシング有効化 */
  antialias?: boolean;
  /** 透明度有効化 */
  alpha?: boolean;
  /** 描画バッファ保持 */
  preserveDrawingBuffer?: boolean;
  /** Canvas幅 */
  width?: number;
  /** Canvas高さ */
  height?: number;
}

// ============================================================================
// 性能測定用型定義
// ============================================================================

/** ベンチマーク結果 */
export interface BenchmarkResult {
  /** テスト名 */
  testName: string;
  /** 平均実行時間（ミリ秒） */
  averageTime: number;
  /** 最小実行時間（ミリ秒） */
  minTime: number;
  /** 最大実行時間（ミリ秒） */
  maxTime: number;
  /** 実行回数 */
  iterations: number;
  /** メモリ使用量（MB） */
  memoryUsage?: number;
}

/** 性能測定設定 */
export interface BenchmarkConfig {
  /** 測定回数 */
  iterations: number;
  /** ウォームアップ実行回数 */
  warmupRuns?: number;
  /** メモリ使用量測定フラグ */
  measureMemory?: boolean;
}

// ============================================================================
// モック/ユーティリティ型定義
// ============================================================================

/** Canvas Mock用コンテキスト */
export interface MockCanvasContext {
  [key: string]: jest.MockedFunction<any>;
}

/** テストユーティリティ関数群 */
export interface TestUtils {
  /** テスト用Canvas作成 */
  createTestCanvas: (config: CanvasTestConfig) => HTMLCanvasElement;
  /** 画像比較 */
  compareImages: (img1: string, img2: string, tolerance: number) => Promise<TestResult>;
  /** Three.jsシーンセットアップ */
  setupThreeJSScene: (config?: RenderConfig) => ThreeJSTestScene;
}

// ============================================================================
// 定数型定義
// ============================================================================

/** テスト許容レベル */
export type ToleranceLevel = 'STRICT' | 'NORMAL' | 'LOOSE';

/** テストメソッド種別 */
export type TestMethod = 'dataurl' | 'readpixels' | 'rendertarget' | 'visualregression';

/** Canvas描画モード */
export type CanvasMode = '2d' | 'webgl' | 'webgl2';
