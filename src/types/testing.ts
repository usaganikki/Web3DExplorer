import * as THREE from 'three';
import { Web3DExplorer, PerformanceMetrics } from './index';

// テストフレームワーク専用の型定義

// テスト実行環境
export interface TestEnvironment {
  browser: 'chrome' | 'firefox' | 'safari' | 'edge';
  viewport: {
    width: number;
    height: number;
  };
  webgl: {
    version: '1' | '2';
    extensions: string[];
  };
  capabilities: {
    maxTextureSize: number;
    maxRenderBufferSize: number;
    maxVertexAttributes: number;
  };
}

// ビジュアル回帰テスト
export interface VisualTest {
  name: string;
  description: string;
  referenceImage: string;
  threshold: number; // 許容差（0-1）
  setup: (explorer: Web3DExplorer) => Promise<void>;
  capture: () => Promise<HTMLCanvasElement>;
}

// パフォーマンステスト
export interface PerformanceTest {
  name: string;
  description: string;
  duration: number; // テスト実行時間（秒）
  expectations: {
    minFPS: number;
    maxFrameTime: number;
    maxMemoryUsage: number;
  };
  setup: (explorer: Web3DExplorer) => Promise<void>;
  execute: (explorer: Web3DExplorer) => Promise<PerformanceMetrics[]>;
}

// インタラクションテスト
export interface InteractionTest {
  name: string;
  description: string;
  interactions: {
    type: 'click' | 'hover' | 'drag' | 'wheel' | 'keyboard';
    target?: string; // セレクターまたはオブジェクト名
    coordinates?: { x: number; y: number };
    keys?: string[];
    duration?: number;
  }[];
  expectations: {
    expectedEvents: string[];
    expectedChanges: Record<string, any>;
  };
  setup: (explorer: Web3DExplorer) => Promise<void>;
  verify: (explorer: Web3DExplorer, results: any[]) => boolean;
}

// 単体テスト用のモック
export interface MockScene {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  canvas: HTMLCanvasElement;
}

export interface MockObjects {
  cube: THREE.Mesh;
  sphere: THREE.Mesh;
  plane: THREE.Mesh;
  light: THREE.DirectionalLight;
  group: THREE.Group;
}

// テストスイートの設定
export interface TestSuiteConfig {
  name: string;
  description: string;
  environment: TestEnvironment;
  timeout: number;
  retries: number;
  parallel: boolean;
  headless: boolean;
  outputDir: string;
  
  // テストフィルタリング
  only?: string[]; // 実行するテストのみ
  skip?: string[]; // スキップするテスト
  tags?: string[]; // テストタグでフィルタリング
}

// テスト結果
export interface TestResult {
  name: string;
  status: 'passed' | 'failed' | 'skipped' | 'timeout';
  duration: number;
  error?: Error;
  metrics?: PerformanceMetrics;
  screenshot?: string;
  artifacts?: {
    logs: string[];
    traces: any[];
    recordings: string[];
  };
}

export interface TestSuiteResult {
  name: string;
  status: 'passed' | 'failed' | 'partial';
  startTime: Date;
  endTime: Date;
  duration: number;
  results: TestResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
  };
  coverage?: {
    lines: number;
    functions: number;
    branches: number;
    statements: number;
  };
}

// Three.js専用のテストユーティリティ
export interface ThreeTestUtils {
  // オブジェクト検証
  expectObject3D(object: THREE.Object3D): {
    toBeVisible(): void;
    toHavePosition(position: THREE.Vector3): void;
    toHaveRotation(rotation: THREE.Euler): void;
    toHaveScale(scale: THREE.Vector3): void;
    toBeInFrustum(camera: THREE.Camera): void;
  };
  
  // マテリアル検証
  expectMaterial(material: THREE.Material): {
    toBeTransparent(): void;
    toHaveColor(color: THREE.Color): void;
    toHaveTexture(texture: THREE.Texture): void;
  };
  
  // ジオメトリ検証
  expectGeometry(geometry: THREE.BufferGeometry): {
    toHaveVertices(count: number): void;
    toHaveFaces(count: number): void;
    toHaveBoundingBox(box: THREE.Box3): void;
  };
  
  // シーン検証
  expectScene(scene: THREE.Scene): {
    toContainObject(object: THREE.Object3D): void;
    toHaveObjectCount(count: number): void;
    toHaveLights(count: number): void;
  };
  
  // レンダリング検証
  expectRenderer(renderer: THREE.WebGLRenderer): {
    toRenderWithoutErrors(): Promise<void>;
    toMatchImage(reference: string, threshold?: number): Promise<void>;
    toHavePerformance(metrics: Partial<PerformanceMetrics>): void;
  };
}

// Puppeteer統合用の型
export interface BrowserTestConfig {
  headless: boolean;
  viewport: { width: number; height: number };
  deviceScaleFactor?: number;
  userAgent?: string;
  timeout: number;
  slowMo?: number;
}

export interface BrowserTestContext {
  page: any; // Puppeteer.Page
  browser: any; // Puppeteer.Browser
  screenshot: (path: string) => Promise<void>;
  evaluate: <T>(fn: () => T) => Promise<T>;
  waitFor: (selector: string | number) => Promise<void>;
}

// テストデータジェネレーター
export interface TestDataGenerator {
  generateMesh: (type: 'box' | 'sphere' | 'plane') => THREE.Mesh;
  generateScene: (complexity: 'simple' | 'medium' | 'complex') => THREE.Scene;
  generateTexture: (width: number, height: number) => THREE.Texture;
  generateMaterial: (type: 'basic' | 'standard' | 'physical') => THREE.Material;
}

// アサーション拡張
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeVisible(): R;
      toHavePosition(position: THREE.Vector3): R;
      toHaveRotation(rotation: THREE.Euler): R;
      toHaveScale(scale: THREE.Vector3): R;
      toBeInFrustum(camera: THREE.Camera): R;
      toRenderWithoutErrors(): Promise<R>;
      toMatchImage(reference: string, threshold?: number): Promise<R>;
      toHavePerformance(metrics: Partial<PerformanceMetrics>): R;
    }
  }
}
