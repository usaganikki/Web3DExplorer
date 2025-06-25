/**
 * Three.js Canvas描画テスト手法調査のための定数定義
 * Phase1-Research用の共通定数
 */

// ===== テスト設定定数 =====

/**
 * 標準Canvas描画サイズ
 */
export const TEST_CANVAS_SIZE = {
  width: 800,
  height: 600,
} as const;

/**
 * テスト用標準色定義
 */
export const TEST_COLORS = {
  RED: 0xff0000,
  GREEN: 0x00ff00,
  BLUE: 0x0000ff,
  WHITE: 0xffffff,
  BLACK: 0x000000,
  YELLOW: 0xffff00,
  CYAN: 0x00ffff,
  MAGENTA: 0xff00ff,
  GRAY: 0x808080,
  TRANSPARENT: 0x000000, // alphaと組み合わせて使用
} as const;

/**
 * 許容誤差レベル
 */
export const TOLERANCE_LEVELS = {
  STRICT: 0,      // ピクセル完全一致
  VERY_LOW: 0.001, // 0.1%
  LOW: 0.01,      // 1%
  NORMAL: 0.05,   // 5%
  HIGH: 0.1,      // 10%
  VERY_HIGH: 0.2, // 20%
} as const;

/**
 * テストタイムアウト設定（ミリ秒）
 */
export const TEST_TIMEOUTS = {
  FAST: 1000,     // 1秒
  NORMAL: 5000,   // 5秒
  SLOW: 10000,    // 10秒
  VERY_SLOW: 30000, // 30秒
} as const;

// ===== Three.js設定定数 =====

/**
 * カメラ設定
 */
export const CAMERA_SETTINGS = {
  FOV: 75,
  NEAR: 0.1,
  FAR: 1000,
  POSITION: {
    DEFAULT: { x: 0, y: 0, z: 5 },
    SIDE: { x: 5, y: 0, z: 0 },
    TOP: { x: 0, y: 5, z: 0 },
    ANGLED: { x: 3, y: 3, z: 3 },
  },
} as const;

/**
 * ライト設定
 */
export const LIGHT_SETTINGS = {
  AMBIENT: {
    COLOR: 0x404040,
    INTENSITY: 0.5,
  },
  DIRECTIONAL: {
    COLOR: 0xffffff,
    INTENSITY: 1.0,
    POSITION: { x: 1, y: 1, z: 1 },
  },
  POINT: {
    COLOR: 0xffffff,
    INTENSITY: 1.0,
    POSITION: { x: 0, y: 0, z: 0 },
    DISTANCE: 100,
  },
} as const;

/**
 * ジオメトリ設定
 */
export const GEOMETRY_SETTINGS = {
  BOX: {
    WIDTH: 1,
    HEIGHT: 1,
    DEPTH: 1,
    WIDTH_SEGMENTS: 1,
    HEIGHT_SEGMENTS: 1,
    DEPTH_SEGMENTS: 1,
  },
  SPHERE: {
    RADIUS: 1,
    WIDTH_SEGMENTS: 32,
    HEIGHT_SEGMENTS: 16,
    PHI_START: 0,
    PHI_LENGTH: Math.PI * 2,
    THETA_START: 0,
    THETA_LENGTH: Math.PI,
  },
  PLANE: {
    WIDTH: 1,
    HEIGHT: 1,
    WIDTH_SEGMENTS: 1,
    HEIGHT_SEGMENTS: 1,
  },
} as const;

/**
 * マテリアル設定
 */
export const MATERIAL_SETTINGS = {
  BASIC: {
    COLOR: TEST_COLORS.WHITE,
    TRANSPARENT: false,
    OPACITY: 1.0,
    WIREFRAME: false,
  },
  STANDARD: {
    COLOR: TEST_COLORS.WHITE,
    ROUGHNESS: 0.5,
    METALNESS: 0.0,
    TRANSPARENT: false,
    OPACITY: 1.0,
  },
  PHONG: {
    COLOR: TEST_COLORS.WHITE,
    SPECULAR: 0x111111,
    SHININESS: 30,
    TRANSPARENT: false,
    OPACITY: 1.0,
  },
} as const;

// ===== テスト手法設定定数 =====

/**
 * Method1: toDataURL設定
 */
export const DATA_URL_SETTINGS = {
  FORMATS: {
    PNG: 'image/png',
    JPEG: 'image/jpeg',
    WEBP: 'image/webp',
  },
  QUALITY: {
    LOW: 0.3,
    MEDIUM: 0.7,
    HIGH: 0.9,
    MAX: 1.0,
  },
} as const;

/**
 * Method2: readPixels設定
 */
export const READ_PIXELS_SETTINGS = {
  FORMATS: {
    RGBA: 0x1908,  // WebGL RGBA
    RGB: 0x1907,   // WebGL RGB
    ALPHA: 0x1906, // WebGL ALPHA
  },
  TYPES: {
    UNSIGNED_BYTE: 0x1401,
    UNSIGNED_SHORT_4_4_4_4: 0x8033,
    UNSIGNED_SHORT_5_5_5_1: 0x8034,
    UNSIGNED_SHORT_5_6_5: 0x8363,
    FLOAT: 0x1406,
  },
} as const;

/**
 * Method3: RenderTarget設定
 */
export const RENDER_TARGET_SETTINGS = {
  MIN_FILTER: {
    NEAREST: 9728,
    LINEAR: 9729,
    NEAREST_MIPMAP_NEAREST: 9984,
    LINEAR_MIPMAP_NEAREST: 9985,
    NEAREST_MIPMAP_LINEAR: 9986,
    LINEAR_MIPMAP_LINEAR: 9987,
  },
  MAG_FILTER: {
    NEAREST: 9728,
    LINEAR: 9729,
  },
  WRAP: {
    REPEAT: 10497,
    CLAMP_TO_EDGE: 33071,
    MIRRORED_REPEAT: 33648,
  },
  FORMAT: {
    RGB: 1022,
    RGBA: 1023,
    DEPTH: 1026,
    DEPTH_STENCIL: 1027,
  },
  TYPE: {
    UNSIGNED_BYTE: 1009,
    UNSIGNED_SHORT: 1012,
    UNSIGNED_INT: 1014,
    FLOAT: 1015,
    HALF_FLOAT: 1016,
  },
} as const;

/**
 * Method4: Visual Regression設定
 */
export const VISUAL_REGRESSION_SETTINGS = {
  BROWSERS: {
    CHROMIUM: 'chromium',
    FIREFOX: 'firefox',
    WEBKIT: 'webkit',
  },
  VIEWPORT: {
    MOBILE: { width: 375, height: 667 },
    TABLET: { width: 768, height: 1024 },
    DESKTOP: { width: 1920, height: 1080 },
    SMALL: { width: 800, height: 600 },
  },
  SCREENSHOT: {
    FORMAT: {
      PNG: 'png',
      JPEG: 'jpeg',
    },
    QUALITY: {
      LOW: 30,
      MEDIUM: 70,
      HIGH: 90,
      MAX: 100,
    },
  },
} as const;

// ===== 性能ベンチマーク定数 =====

/**
 * ベンチマーク設定
 */
export const BENCHMARK_SETTINGS = {
  ITERATIONS: {
    QUICK: 10,
    NORMAL: 50,
    THOROUGH: 100,
    EXTENSIVE: 500,
  },
  WARMUP_RUNS: {
    NONE: 0,
    MINIMAL: 3,
    STANDARD: 5,
    EXTENSIVE: 10,
  },
  SCENARIOS: {
    SIMPLE: 'simple',
    MEDIUM: 'medium', 
    COMPLEX: 'complex',
    EXTREME: 'extreme',
  },
} as const;

/**
 * 性能閾値
 */
export const PERFORMANCE_THRESHOLDS = {
  RENDER_TIME: {
    EXCELLENT: 16,   // 60fps相当
    GOOD: 33,        // 30fps相当
    ACCEPTABLE: 50,  // 20fps相当
    POOR: 100,       // 10fps相当
  },
  MEMORY_USAGE: {
    LOW: 50 * 1024 * 1024,      // 50MB
    MEDIUM: 100 * 1024 * 1024,  // 100MB
    HIGH: 200 * 1024 * 1024,    // 200MB
    CRITICAL: 500 * 1024 * 1024, // 500MB
  },
  GPU_UTILIZATION: {
    LOW: 25,      // 25%
    MEDIUM: 50,   // 50%
    HIGH: 75,     // 75%
    CRITICAL: 90, // 90%
  },
} as const;

// ===== エラーコード定数 =====

/**
 * エラーコード定義
 */
export const ERROR_CODES = {
  // 初期化エラー
  INIT_FAILED: 'INIT_FAILED',
  CANVAS_NOT_AVAILABLE: 'CANVAS_NOT_AVAILABLE',
  WEBGL_NOT_SUPPORTED: 'WEBGL_NOT_SUPPORTED',
  THREE_NOT_LOADED: 'THREE_NOT_LOADED',
  
  // レンダリングエラー
  RENDER_FAILED: 'RENDER_FAILED',
  SHADER_COMPILE_ERROR: 'SHADER_COMPILE_ERROR',
  TEXTURE_LOAD_ERROR: 'TEXTURE_LOAD_ERROR',
  BUFFER_ERROR: 'BUFFER_ERROR',
  
  // キャプチャエラー
  CAPTURE_FAILED: 'CAPTURE_FAILED',
  DATA_URL_ERROR: 'DATA_URL_ERROR',
  READ_PIXELS_ERROR: 'READ_PIXELS_ERROR',
  RENDER_TARGET_ERROR: 'RENDER_TARGET_ERROR',
  
  // 比較エラー
  COMPARISON_FAILED: 'COMPARISON_FAILED',
  IMAGE_DECODE_ERROR: 'IMAGE_DECODE_ERROR',
  SIZE_MISMATCH: 'SIZE_MISMATCH',
  FORMAT_ERROR: 'FORMAT_ERROR',
  
  // タイムアウトエラー
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  ASYNC_TIMEOUT: 'ASYNC_TIMEOUT',
  RENDER_TIMEOUT: 'RENDER_TIMEOUT',
  
  // システムエラー
  MEMORY_ERROR: 'MEMORY_ERROR',
  GPU_ERROR: 'GPU_ERROR',
  BROWSER_ERROR: 'BROWSER_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  
  // 設定エラー
  INVALID_CONFIG: 'INVALID_CONFIG',
  MISSING_PARAMETER: 'MISSING_PARAMETER',
  INVALID_FORMAT: 'INVALID_FORMAT',
  UNSUPPORTED_FEATURE: 'UNSUPPORTED_FEATURE',
} as const;

// ===== ファイルパス定数 =====

/**
 * ディレクトリパス
 */
export const PATHS = {
  BASE: 'src/learning/step3-threejs-testing/phase1-research',
  TESTS: 'tests',
  DOCS: 'docs',
  UTILS: 'utils',
  COMPONENTS: 'components',
  BENCHMARKS: 'benchmarks',
  POC: 'poc',
  OUTPUTS: 'outputs',
  SCREENSHOTS: 'screenshots',
  REPORTS: 'reports',
} as const;

/**
 * ファイル拡張子
 */
export const FILE_EXTENSIONS = {
  TYPESCRIPT: '.ts',
  JAVASCRIPT: '.js',
  JSON: '.json',
  CSV: '.csv',
  HTML: '.html',
  PNG: '.png',
  JPEG: '.jpg',
  WEBP: '.webp',
  MARKDOWN: '.md',
} as const;

// ===== バージョン情報 =====

/**
 * バージョン情報
 */
export const VERSION_INFO = {
  PHASE1_RESEARCH: '1.0.0',
  MINIMUM_THREE_VERSION: '0.163.0',
  MINIMUM_NODE_VERSION: '18.0.0',
  JEST_VERSION: '29.0.0',
} as const;

// ===== デバッグ設定 =====

/**
 * デバッグレベル
 */
export const DEBUG_LEVELS = {
  NONE: 0,
  ERROR: 1,
  WARN: 2,
  INFO: 3,
  DEBUG: 4,
  VERBOSE: 5,
} as const;

/**
 * ログ設定
 */
export const LOG_SETTINGS = {
  MAX_LOG_LENGTH: 1000,
  TIMESTAMP_FORMAT: 'ISO',
  CONSOLE_COLORS: {
    ERROR: '\x1b[31m',   // 赤
    WARN: '\x1b[33m',    // 黄
    INFO: '\x1b[36m',    // シアン
    DEBUG: '\x1b[37m',   // 白
    RESET: '\x1b[0m',    // リセット
  },
} as const;

// ===== 型定義のエクスポート =====

/**
 * 定数の型定義
 */
export type TestColorKey = keyof typeof TEST_COLORS;
export type ToleranceLevelKey = keyof typeof TOLERANCE_LEVELS;
export type TimeoutKey = keyof typeof TEST_TIMEOUTS;
export type ErrorCodeKey = keyof typeof ERROR_CODES;
export type BenchmarkScenarioKey = keyof typeof BENCHMARK_SETTINGS.SCENARIOS;
export type DebugLevelKey = keyof typeof DEBUG_LEVELS;
