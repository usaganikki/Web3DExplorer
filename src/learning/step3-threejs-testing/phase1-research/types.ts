/**
 * Three.js Canvas描画テスト手法調査のための型定義
 * Phase1-Research用の包括的な型システム
 */

import * as THREE from 'three';

// ===== 基本型定義 =====

/**
 * テスト結果の基本構造
 */
export interface TestResult {
  success: boolean;
  message: string;
  duration: number; // ms
  timestamp?: number;
  metadata?: Record<string, any>;
}

/**
 * エラー情報の標準形式
 */
export interface TestError {
  code: string;
  message: string;
  stack?: string;
  context?: Record<string, any>;
}

// ===== Canvas/WebGL関連型定義 =====

/**
 * Canvas描画テスト設定
 */
export interface CanvasTestConfig {
  width: number;
  height: number;
  tolerance: number; // 0.0-1.0
  timeout: number; // ms
  retryAttempts?: number;
  devicePixelRatio?: number;
}

/**
 * WebGLコンテキストオプション
 */
export interface WebGLContextOptions {
  alpha?: boolean;
  depth?: boolean;
  stencil?: boolean;
  antialias?: boolean;
  premultipliedAlpha?: boolean;
  preserveDrawingBuffer?: boolean;
  powerPreference?: 'default' | 'high-performance' | 'low-power';
  desynchronized?: boolean;
}

/**
 * 描画品質設定
 */
export interface RenderQualitySettings {
  resolution: [number, number];
  pixelRatio: number;
  antialias: boolean;
  samples?: number; // MSAA samples
  precision: 'highp' | 'mediump' | 'lowp';
}

// ===== Three.js関連型定義 =====

/**
 * Three.jsシーン設定
 */
export interface ThreeJSSceneConfig {
  cameraType: 'perspective' | 'orthographic';
  cameraPosition: THREE.Vector3;
  cameraTarget: THREE.Vector3;
  lightingSetup: LightingConfig[];
  backgroundColor: THREE.Color | number;
  fog?: FogConfig;
}

/**
 * ライティング設定
 */
export interface LightingConfig {
  type: 'ambient' | 'directional' | 'point' | 'spot' | 'hemisphere';
  color: THREE.Color | number;
  intensity: number;
  position?: THREE.Vector3;
  target?: THREE.Vector3;
  castShadow?: boolean;
}

/**
 * フォグ設定
 */
export interface FogConfig {
  type: 'linear' | 'exponential';
  color: THREE.Color | number;
  near?: number;
  far?: number;
  density?: number;
}

/**
 * 3Dオブジェクト設定
 */
export interface Object3DConfig {
  geometry: GeometryConfig;
  material: MaterialConfig;
  position: THREE.Vector3;
  rotation: THREE.Euler;
  scale: THREE.Vector3;
  animations?: AnimationConfig[];
}

/**
 * ジオメトリ設定
 */
export interface GeometryConfig {
  type: 'box' | 'sphere' | 'plane' | 'cylinder' | 'cone' | 'torus' | 'custom';
  parameters: Record<string, number>;
  segments?: number;
}

/**
 * マテリアル設定
 */
export interface MaterialConfig {
  type: 'basic' | 'standard' | 'phong' | 'lambert' | 'physical';
  color: THREE.Color | number;
  opacity?: number;
  transparent?: boolean;
  wireframe?: boolean;
  roughness?: number;
  metalness?: number;
  textures?: TextureConfig[];
}

/**
 * テクスチャ設定
 */
export interface TextureConfig {
  type: 'diffuse' | 'normal' | 'roughness' | 'metalness' | 'emission';
  url?: string;
  data?: ImageData | HTMLImageElement;
  wrapS?: THREE.Wrapping;
  wrapT?: THREE.Wrapping;
  magFilter?: THREE.TextureFilter;
  minFilter?: THREE.TextureFilter;
}

/**
 * アニメーション設定
 */
export interface AnimationConfig {
  property: 'position' | 'rotation' | 'scale' | 'material';
  from: any;
  to: any;
  duration: number; // ms
  easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
  loop?: boolean;
}

// ===== テスト手法関連型定義 =====

/**
 * 描画テスト手法の種類
 */
export type TestMethodType = 'dataURL' | 'readPixels' | 'renderTarget' | 'visualRegression';

/**
 * Method1: toDataURL手法の設定
 */
export interface DataURLTestConfig extends CanvasTestConfig {
  format: 'image/png' | 'image/jpeg' | 'image/webp';
  quality?: number; // 0.0-1.0 (JPEG/WebPのみ)
  compressionLevel?: number;
}

/**
 * Method2: readPixels手法の設定
 */
export interface ReadPixelsTestConfig extends CanvasTestConfig {
  format: number; // WebGL format constant
  type: number; // WebGL type constant
  flipY?: boolean;
  region?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

/**
 * Method3: RenderTarget手法の設定
 */
export interface RenderTargetTestConfig extends CanvasTestConfig {
  renderTargetOptions: THREE.WebGLRenderTargetOptions;
  multisampling?: boolean;
  samples?: number;
  textureFormat?: THREE.PixelFormat;
  textureType?: THREE.TextureDataType;
}

/**
 * Method4: Visual Regression手法の設定
 */
export interface VisualRegressionTestConfig extends CanvasTestConfig {
  browserEngine: 'chromium' | 'firefox' | 'webkit';
  headless: boolean;
  viewport: {
    width: number;
    height: number;
    deviceScaleFactor?: number;
  };
  screenshotOptions: ScreenshotOptions;
}

/**
 * スクリーンショット設定
 */
export interface ScreenshotOptions {
  fullPage?: boolean;
  clip?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  quality?: number;
  type?: 'png' | 'jpeg';
  omitBackground?: boolean;
}

// ===== 比較・分析関連型定義 =====

/**
 * 画像比較結果
 */
export interface ImageComparisonResult {
  isMatch: boolean;
  similarity: number; // 0.0-1.0
  pixelDifference: number;
  totalPixels: number;
  diffPercentage: number;
  diffImage?: ImageData | Buffer;
  statistics: ComparisonStatistics;
  metadata: ComparisonMetadata;
}

/**
 * 比較統計情報
 */
export interface ComparisonStatistics {
  meanDifference: number;
  standardDeviation: number;
  maxDifference: number;
  minDifference: number;
  histogram: number[];
  outlierCount: number;
}

/**
 * 比較メタデータ
 */
export interface ComparisonMetadata {
  algorithm: 'pixel-by-pixel' | 'structural-similarity' | 'perceptual-hash';
  colorSpace: 'rgb' | 'lab' | 'xyz';
  preprocessing: string[];
  analysisTime: number; // ms
}

/**
 * 性能測定結果
 */
export interface PerformanceMetrics {
  renderTime: number; // ms
  captureTime: number; // ms
  analysisTime: number; // ms
  totalTime: number; // ms
  memoryUsage: MemoryUsage;
  frameRate?: number; // fps
  gpuUtilization?: number; // percentage
}

/**
 * メモリ使用量情報
 */
export interface MemoryUsage {
  heapUsed: number; // bytes
  heapTotal: number; // bytes
  external: number; // bytes
  gpuMemory?: number; // bytes
  textureMemory?: number; // bytes
}

// ===== ベンチマーク関連型定義 =====

/**
 * ベンチマーク設定
 */
export interface BenchmarkConfig {
  iterations: number;
  warmupRuns: number;
  testMethods: TestMethodType[];
  scenarios: TestScenario[];
  metrics: MetricType[];
  outputFormat: 'json' | 'csv' | 'html';
}

/**
 * テストシナリオ
 */
export interface TestScenario {
  name: string;
  description: string;
  complexity: 'simple' | 'medium' | 'complex' | 'extreme';
  sceneConfig: ThreeJSSceneConfig;
  objectConfigs: Object3DConfig[];
  renderSettings: RenderQualitySettings;
  duration?: number; // ms (アニメーション用)
}

/**
 * 測定メトリクス種別
 */
export type MetricType = 'performance' | 'accuracy' | 'reliability' | 'usability' | 'scalability';

/**
 * ベンチマーク結果
 */
export interface BenchmarkResult {
  testMethod: TestMethodType;
  scenario: string;
  metrics: {
    [K in MetricType]?: number;
  };
  rawData: PerformanceMetrics[];
  statistics: BenchmarkStatistics;
  metadata: BenchmarkMetadata;
}

/**
 * ベンチマーク統計
 */
export interface BenchmarkStatistics {
  mean: number;
  median: number;
  standardDeviation: number;
  min: number;
  max: number;
  percentiles: {
    p50: number;
    p90: number;
    p95: number;
    p99: number;
  };
}

/**
 * ベンチマークメタデータ
 */
export interface BenchmarkMetadata {
  environment: EnvironmentInfo;
  configuration: BenchmarkConfig;
  timestamp: number;
  version: string;
}

/**
 * 環境情報
 */
export interface EnvironmentInfo {
  platform: string;
  arch: string;
  nodeVersion: string;
  v8Version: string;
  chromeVersion?: string;
  webglVersion: string;
  gpuInfo?: GPUInfo;
  displayInfo?: DisplayInfo;
}

/**
 * GPU情報
 */
export interface GPUInfo {
  vendor: string;
  renderer: string;
  version: string;
  extensions: string[];
  maxTextureSize: number;
  maxRenderBufferSize: number;
  maxVertexAttribs: number;
}

/**
 * ディスプレイ情報
 */
export interface DisplayInfo {
  width: number;
  height: number;
  pixelRatio: number;
  colorDepth: number;
  orientation: 'portrait' | 'landscape';
}

// ===== レポート関連型定義 =====

/**
 * 分析レポート
 */
export interface AnalysisReport {
  summary: ReportSummary;
  methodComparison: MethodComparisonReport[];
  recommendations: Recommendation[];
  appendices: ReportAppendix[];
  metadata: ReportMetadata;
}

/**
 * レポートサマリー
 */
export interface ReportSummary {
  totalTests: number;
  successRate: number;
  averagePerformance: number;
  keyFindings: string[];
  recommendations: string[];
}

/**
 * 手法比較レポート
 */
export interface MethodComparisonReport {
  method: TestMethodType;
  scores: {
    accuracy: number;
    performance: number;
    reliability: number;
    usability: number;
  };
  strengths: string[];
  weaknesses: string[];
  recommendedUse: string[];
}

/**
 * 推奨事項
 */
export interface Recommendation {
  category: 'performance' | 'accuracy' | 'implementation' | 'maintenance';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  implementation: string[];
  expectedImpact: string;
}

/**
 * レポート付録
 */
export interface ReportAppendix {
  title: string;
  type: 'data' | 'code' | 'configuration' | 'reference';
  content: any;
  description?: string;
}

/**
 * レポートメタデータ
 */
export interface ReportMetadata {
  generatedAt: number;
  version: string;
  author: string;
  sources: string[];
  tools: string[];
}

// ===== ユーティリティ型定義 =====

/**
 * 色型定義
 */
export type ColorValue = THREE.Color | number | string;

/**
 * ベクトル型定義
 */
export type Vector3Like = THREE.Vector3 | [number, number, number] | { x: number; y: number; z: number };

/**
 * オイラー角型定義
 */
export type EulerLike = THREE.Euler | [number, number, number] | { x: number; y: number; z: number };

/**
 * テストコールバック関数
 */
export type TestCallback<T = any> = (result: TestResult) => T | Promise<T>;

/**
 * エラーハンドラー関数
 */
export type ErrorHandler = (error: TestError) => void | Promise<void>;

/**
 * プログレスコールバック関数
 */
export type ProgressCallback = (progress: ProgressInfo) => void;

/**
 * プログレス情報
 */
export interface ProgressInfo {
  current: number;
  total: number;
  percentage: number;
  stage: string;
  message?: string;
  eta?: number; // ms
}

// ===== 型ガード関数 =====

/**
 * TestResultの型ガード
 */
export function isTestResult(obj: any): obj is TestResult {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.success === 'boolean' &&
    typeof obj.message === 'string' &&
    typeof obj.duration === 'number'
  );
}

/**
 * ImageComparisonResultの型ガード
 */
export function isImageComparisonResult(obj: any): obj is ImageComparisonResult {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.isMatch === 'boolean' &&
    typeof obj.similarity === 'number' &&
    typeof obj.pixelDifference === 'number'
  );
}

/**
 * PerformanceMetricsの型ガード
 */
export function isPerformanceMetrics(obj: any): obj is PerformanceMetrics {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.renderTime === 'number' &&
    typeof obj.captureTime === 'number' &&
    typeof obj.totalTime === 'number'
  );
}
