# Testing Foundation - 技術ノウハウ集

このドキュメントは、Web3DExplorerプロジェクトのコードを読む際に必要となるテスト関連の技術ノウハウをまとめたものです。Jestテストフレームワーク、React Testing Library、TypeScript、Three.jsとの連携に関する実践的な知識が含まれています。

## 1. Jest/テスト環境設定

### Jest設定の重要ポイント

Jestテストランナーの動作をカスタマイズするための重要な設定項目について説明します。

#### preset設定
```javascript
preset: 'ts-jest/presets/default-esm'
```
TypeScript (`ts-jest`) とES Modules (ESM) を使用するための定義済み設定群。モダンなJavaScript開発環境に必要。

#### testEnvironment設定
```javascript
testEnvironment: 'jsdom'
```
Node.js上でブラウザのDOM APIをシミュレートし、Reactコンポーネントのテストを可能にする。

#### transform設定
```javascript
transform: {
  '^.+\\.(ts|tsx|js|jsx)$': ['ts-jest', {
    useESM: true,
    tsconfig: { jsx: 'react-jsx', allowJs: true }
  }]
}
```
TypeScriptとJSXファイルをJestが理解できる形に変換。`.js`と`.jsx`も`ts-jest`で処理することで、ESM形式のJavaScriptモジュールにも対応。

#### transformIgnorePatterns
```javascript
transformIgnorePatterns: ['/node_modules/(?!three/examples/jsm/)']
```
否定先読み正規表現により、`three/examples/jsm/`配下のモジュールのみをトランスパイル対象とする。Three.jsのESMモジュール（`OrbitControls`など）のインポートエラーを回避するために不可欠。

#### moduleNameMapper
```javascript
moduleNameMapper: {
  '^@/(.*)$': '<rootDir>/$1'
}
```
`@/`で始まるパスエイリアスを実際のファイルパスに解決。正規表現`(.*)`でパス部分を動的にキャプチャし、保守性を向上。

### WebGLモック実装

jsdom環境はWebGL APIをサポートしていないため、Three.jsの`WebGLRenderer`を使用するテストでエラーが発生します。この問題を解決するためのモック実装手法を説明します。

#### 問題の本質
- **環境の差異**: `jsdom`はDOM APIをシミュレートするが、GPUと連携するWebGL APIは持たない
- **Three.jsの要求**: `WebGLRenderer`は初期化時に`canvas.getContext('webgl')`を呼び出し、返されたコンテキストオブジェクトの様々な関数を実行する
- **テストの目的**: DOM要素の存在確認が主目的で、実際の描画は不要

#### モック実装の段階的構築

```javascript
// グローバルスコープにWebGLRenderingContextを定義
global.WebGLRenderingContext = jest.fn();

// canvas.getContextが必要な関数群を持つ偽のオブジェクトを返すよう設定
const mockContext = {
  getExtension: jest.fn(),
  getParameter: jest.fn().mockReturnValue([]),
  // ... その他のモック関数
};
global.HTMLCanvasElement.prototype.getContext = jest.fn().mockReturnValue(mockContext);
```

#### 主要なモック関数の役割

**`getShaderPrecisionFormat`**:
シェーダーの数値精度情報を取得。Three.jsが期待する`{ rangeMin, rangeMax, precision }`形式のオブジェクトを返す。

**`getShaderInfoLog` / `getProgramInfoLog`**:
シェーダーのコンパイルエラーログを取得。`undefined`を返すと`.trim()`でエラーになるため、空文字列を返す必要がある。

**`getProgramParameter`**:
シェーダープログラムに関する情報を取得。引数によって返す値を動的に変更：
- `LINK_STATUS`: `true`（リンク成功）
- `ACTIVE_UNIFORMS`: `0`（uniform変数の数）

**`getActiveUniform`**:
uniform変数の詳細情報を取得。`{ name: 'mockUniform', type: ..., size: ... }`形式のダミーオブジェクトを返す。

#### デバッグプロセス（モグラたたき）
モック作成は、テスト実行とエラー確認を繰り返すことで段階的に構築する必要があります。このプロセスは、ライブラリの内部動作を理解する優れた学習機会となります。

### setupFilesAfterEnvの活用

各テストスイート実行前に読み込まれるファイルで、グローバルなテスト環境設定を行います。

```javascript
// @testing-library/jest-domの追加
import '@testing-library/jest-dom';

// グローバルモックの設定
global.WebGLRenderingContext = jest.fn();
// ... WebGLモックの詳細設定
```

カスタムマッチャー（`toBeInTheDocument()`, `toBeVisible()`など）の追加により、DOMテストの記述が容易になります。

## 2. Reactコンポーネントテスト

### コンポーネントテストの基本概念

Reactコンポーネントは以下の3つの要素から構成され、それぞれがテストの対象となります：

#### ビュー（UI構造）
JSXで記述され、最終的にDOM要素としてレンダリングされる部分。`render()`関数でコンポーネントをレンダリングし、期待される要素が存在するかを検証します。

#### ロジック（振る舞い）
イベントハンドラ、状態管理、ライフサイクル処理などを含む部分。ユーザーインタラクションに対する適切な反応をテストします。

#### データ（状態管理）
- **Props**: 親から受け取るプロパティ
- **State**: コンポーネント自身で管理する内部状態（`useState`フックで管理）
- **副作用**: `useEffect`で管理される外部との相互作用

#### 状態更新のフロー
```
State更新 → 再レンダリング → DOM更新 → 副作用実行
```

このフローの理解は、同期的なテストと非同期的なテストの使い分けに重要です。

### インタラクションテストの実装

ユーザーの操作をシミュレートして、コンポーネントが期待通りに振る舞うかを検証する手法です。

#### fireEventによるユーザー操作シミュレーション

```tsx
import { render, screen, fireEvent } from '@testing-library/react';

// ボタンクリックのシミュレーション
const button = screen.getByRole('button', { name: /送信/i });
fireEvent.click(button);

// スライダー操作のシミュレーション
const slider = container.querySelector('input[type="range"]');
fireEvent.change(slider, { target: { value: '2.0' } });
```

#### 同期・非同期テストの判断基準

**同期で良いケース**:
- `fireEvent`によるユーザー操作の結果、Reactのstateが更新され、DOMが同期的に再レンダリングされる場合
- 例：スライダー操作直後の`input`の`value`属性検証

**非同期（async/await）が必要なケース**:
- `useEffect`内での処理や`requestAnimationFrame`による描画更新など、完了までに時間を要する非同期処理の結果を待つ場合
- 例：色変更ボタンクリック後のThree.jsオブジェクト色変更

```tsx
// 非同期テストの例
test('色変更が反映される', async () => {
  fireEvent.click(colorButton);
  expect(await screen.findByText('色: 赤')).toBeInTheDocument();
});
```

### セレクター選択戦略

テスト対象のDOM要素を取得する方法は、ユーザーの視点に近いものを優先します。

#### 優先順位

1. **`getByRole`** (最推奨)
   ```tsx
   screen.getByRole('button', { name: /送信/i })
   ```
   アクセシビリティツリーに基づく最もセマンティックな選択方法。

2. **`getByLabelText`**
   ```tsx
   screen.getByLabelText('ユーザー名')
   ```
   フォーム要素に最適。`<label>`との関連付けを活用。

3. **`getByText`**
   ```tsx
   screen.getByText('赤')
   ```
   テキストコンテンツによる要素の特定。ユーザーが実際に見るテキストを使用。

4. **`container.querySelector`** (最終手段)
   ```tsx
   container.querySelector('input[min="0.5"]')
   ```
   上記の方法で特定できない場合のみ使用。DOM構造に依存するため壊れやすい。

#### 実践的な使い分け

```tsx
// 推奨：ユーザーが認識するテキストで特定
const redButton = screen.getByText('赤');

// 避けるべき：実装の詳細に依存
const redButton = container.querySelector('.color-button-red');
```

ユーザー中心のセレクター選択により、実装の詳細変更（CSSクラス名変更、HTMLタグ変更など）に対して堅牢なテストが作成できます。

## 3. TypeScriptテスト実装

### 明示的な型定義の必要性

TypeScriptのテスト環境では、型安全性を確保するために明示的な型定義が重要です。

#### RenderResult型注釈の重要性

```tsx
import { RenderResult } from '@testing-library/react';

export const renderInteractiveCube = (): RenderResult => {
  return render(<InteractiveCube />);
};
```

**型推論エラー（ts(2742)）の解決**:
TypeScriptが推論した内部パスへの参照は環境依存であり、「移植性がない（not portable）」とエラーになります。ライブラリが公式にエクスポートしている型名を明示的に指定することで解決します。

#### ファイル拡張子の使い分け

- **`.ts`**: 純粋なTypeScriptコード（JSX構文なし）
- **`.tsx`**: JSX構文を含むTypeScriptコード

```tsx
// ❌ test-utils.ts でJSX使用
const component = <InteractiveCube />; // エラー

// ✅ test-utils.tsx でJSX使用
const component = <InteractiveCube />; // 正常
```

### 型安全なテスト実装

#### nullチェックと型ガード

DOM操作では`null`の可能性を常に考慮する必要があります：

```tsx
const slider = container.querySelector('input[type="range"]');

// 1. テストの意図を表明
expect(slider).toBeInTheDocument();

// 2. 型安全な操作
if (slider) {
  fireEvent.change(slider, { target: { value: '2.0' } });
  expect(slider.value).toBe('2.0');
}
```

#### 防御的プログラミング

```tsx
export const changeSliderValue = (slider: HTMLInputElement, value: string) => {
  // 事前条件の確認
  expect(slider).toBeInTheDocument();
  
  fireEvent.change(slider, { target: { value }});
  return slider;
};
```

### TypeScript高度パターン

#### keyof typeof の活用

オブジェクトのキーを型安全に扱うための高度なパターン：

```tsx
const buttons = {
  green: screen.getByText('緑'),
  red: screen.getByText('赤'),
  blue: screen.getByText('青'),
  yellow: screen.getByText('黄')
};

// keyof typeof buttons = "green" | "red" | "blue" | "yellow"
const button = buttons[colorName as keyof typeof buttons];
```

#### 値（Value）vs 型（Type）の区別

TypeScriptでは実行時の「値」とコンパイル時の「型」は明確に分離されています：

```tsx
// ❌ 値を型として使用
const button = buttons[colorName as keyof buttons]; // エラー

// ✅ typeof で値から型を取得
const button = buttons[colorName as keyof typeof buttons];
```

#### ReturnType<typeof T>パターン

関数の戻り値の型を動的に取得：

```tsx
type ColorButtons = ReturnType<typeof getColorButtons>;

// または明示的な型定義（推奨）
type ColorButtons = {
  green: HTMLButtonElement;
  red: HTMLButtonElement;
  blue: HTMLButtonElement;
  yellow: HTMLButtonElement;
};
```

明示的な型定義は、コードの意図をより明確に表現し、長期的なメンテナンスを容易にします。

## 4. テストユーティリティ設計

### 設計原則とパターン

#### DRY原則の適用

テストコードにおいても、同じ操作パターンの重複は以下の問題を引き起こします：
- 保守コストの増大
- エラーの拡散
- 可読性の低下

#### 責務分離と抽象化

```tsx
// 操作関数：ユーザーアクションをシミュレート
export const changeSliderValue = (slider: HTMLInputElement, value: string) => {
  expect(slider).toBeInTheDocument();
  fireEvent.change(slider, { target: { value }});
  return slider;
};

// 検証関数：期待される状態を確認
export const verifySliderValue = (slider: HTMLInputElement, expectedValue: string) => {
  expect(slider.value).toBe(expectedValue);
};

// 複合関数：操作と検証を組み合わせた高レベルなシナリオ
export const changeSliderAndVerifyDisplay = async (
  slider: HTMLInputElement,
  value: string,
  expectedText: string
) => {
  changeSliderValue(slider, value);
  expect(await screen.findByText(expectedText)).toBeInTheDocument();
};
```

#### 段階的実装アプローチ

```
レベル1: 基本的な操作 (changeSliderValue)
    ↓
レベル2: 操作 + 検証 (changeSliderAndVerifyDisplay)
    ↓  
レベル3: 複合的な操作 (changeColorAndVerify)
    ↓
レベル4: 包括的な検証 (verifyBasicElements)
```

### DOM要素取得の統一

#### containerベース vs screenベースの問題

```tsx
// ❌ 異なるアプローチの混在
export const getSliders = (container: HTMLElement) => {
  // containerベース
  const sizeSlider = container.querySelector('input[min="0.5"]');
};

export const getColorButtons = () => {
  // screenベース（問題のある実装）
  return {
    green: screen.getByText('緑'), // document全体を検索
  };
};
```

#### 一貫性のあるアプローチ

```tsx
// ✅ containerベースに統一
export const getColorButtons = (container: HTMLElement) => {
  const buttons = Array.from(container.querySelectorAll('button'));
  
  return {
    green: buttons.find(btn => btn.textContent?.includes('緑')) as HTMLButtonElement,
    red: buttons.find(btn => btn.textContent?.includes('赤')) as HTMLButtonElement,
    blue: buttons.find(btn => btn.textContent?.includes('青')) as HTMLButtonElement,
    yellow: buttons.find(btn => btn.textContent?.includes('黄')) as HTMLButtonElement
  };
};
```

### 再利用可能な関数設計

#### 依存関係の明示化

```tsx
// ❌ 暗黙的な依存関係
export const changeColorAndVerify = (colorName: string) => {
  const buttons = getColorButtons(); // containerパラメータが不足
};

// ✅ 依存関係を明示
export const changeColorAndVerify = (
  buttons: ColorButtons,
  colorName: string
) => {
  const button = buttons[colorName as keyof typeof buttons];
  expect(button).toBeInTheDocument();
  fireEvent.click(button);
};
```

#### 型安全性を考慮した設計

```tsx
type ColorButtons = {
  green: HTMLButtonElement;
  red: HTMLButtonElement;
  blue: HTMLButtonElement;
  yellow: HTMLButtonElement;
};

// 型定義により、IDEサポートとコンパイル時エラー検出が向上
```

## 5. 数値計算とエッジケース

### 浮動小数点計算の特性

#### IEEE 754標準の制約

JavaScriptは IEEE 754 標準の倍精度浮動小数点数（64bit）を使用しており、10進数の小数は2進数で正確に表現できない場合があります：

```javascript
// 高精度表示による内部表現の確認
0.025.toPrecision(20) // "0.025000000000000001388"
0.075.toPrecision(20) // "0.074999999999999997224"
```

#### 理論値 vs 実際値の違い

```javascript
// 理論的期待値と実際の結果
0.025.toFixed(2) // "0.03" （期待通り）
0.075.toFixed(2) // "0.07" （理論的には0.08だが、内部表現により0.07）
```

**重要な洞察**: 0.075は内部的に約0.074999999...であるため、四捨五入で0.07になるのは正しい動作です。

#### テスト設計哲学：実際の動作を検証する重要性

```tsx
// ❌ 理論値ベースのテスト（失敗する）
test('理論的な四捨五入テスト', () => {
  expect(parseFloat('0.075').toFixed(2)).toBe('0.08'); // 失敗
});

// ✅ 実際の動作ベースのテスト（成功）
test('実際の動作に基づくテスト', () => {
  expect(parseFloat('0.075').toFixed(2)).toBe('0.07'); // 成功
});
```

テストは「理論的に正しいこと」ではなく、「ユーザーが実際に体験すること」を検証すべきです。

### エラーハンドリングと境界値テスト

#### ブラウザHTML5制約の活用

```tsx
test('スライダーがブラウザによって範囲制限される', () => {
  const slider = container.querySelector('input[type="range"]');
  
  // 範囲外値でのテスト
  fireEvent.change(slider, { target: { value: '999' } });
  expect(parseFloat(slider.value)).toBeLessThanOrEqual(3.0);
  
  fireEvent.change(slider, { target: { value: '-999' } });
  expect(parseFloat(slider.value)).toBeGreaterThanOrEqual(0.5);
});
```

#### 無効値入力の安全性テスト

```tsx
test('無効な文字列入力でも安全に動作する', () => {
  const slider = container.querySelector('input[type="range"]');
  
  fireEvent.change(slider, { target: { value: 'abc' } });
  expect(() => {
    expect(screen.getByText(/サイズ:/)).toBeInTheDocument();
  }).not.toThrow();
});
```

#### 高速操作ストレステスト

```tsx
test('高速操作でも安定している', () => {
  const slider = container.querySelector('input[type="range"]');
  
  for (let i = 0; i < 5; i++) {
    const value = (Math.random() * 2.5 + 0.5).toFixed(1);
    fireEvent.change(slider, { target: { value } });
  }
  
  const finalValue = parseFloat(slider.value);
  expect(finalValue).toBeGreaterThanOrEqual(0.5);
  expect(finalValue).toBeLessThanOrEqual(3.0);
});
```

### 正規表現によるテキストマッチング

#### 文字列リテラル vs 正規表現の使い分け

React Testing Libraryでのテキストマッチングにおける重要なパターン：

```tsx
// ❌ 完全一致（失敗しやすい）
expect(screen.getByText('サイズ:')).toBeInTheDocument();
// → "サイズ:" の完全一致を探すが、実際は "サイズ: 1.8"

// ✅ 部分マッチ（堅牢）
expect(screen.getByText(/サイズ:/)).toBeInTheDocument();
// → "サイズ:" を含む文字列にマッチ
```

#### 正規表現リテラルの注意点

```javascript
// ✅ 正しい（引用符不要）
/サイズ:/

// ❌ 間違い（引用符も含めてマッチ対象となる）
/'サイズ:'/
/"サイズ:"/
```

正規表現内では引用符は不要であり、日本語文字は通常文字として適切に扱われます。

## 6. テスト品質保証

### 多層的な品質検証

アプリケーションの品質を多角的に保証するための様々なテスト観点：

#### 基本的な健全性チェック
```tsx
test('コンポーネントが正常にレンダリングされる', () => {
  render(<InteractiveCube />);
  expect(screen.getByText(/サイズ:/)).toBeInTheDocument();
});
```
最も基本的な安定性を担保する「健康診断」のような役割。

#### UIフィードバックの正確性
```tsx
test('スライダー操作が画面表示に正しく反映される', async () => {
  const slider = container.querySelector('input[type="range"]');
  fireEvent.change(slider, { target: { value: '2.0' } });
  expect(await screen.findByText('サイズ: 2.0')).toBeInTheDocument();
});
```
ユーザーのアクションに対する視覚的フィードバックの検証。

#### 仕様の堅牢性
```tsx
test('境界値での動作確認', () => {
  // 最小値・最大値でのテスト
  fireEvent.change(slider, { target: { value: '0.5' } });
  fireEvent.change(slider, { target: { value: '3.0' } });
});
```
仕様の限界点での安定性確保。

#### 機能間の独立性
```tsx
test('複数機能の連続操作でも各状態が保たれる', async () => {
  await changeSliderAndVerifyDisplay(sliders.size, "2.0", "サイズ: 2.0");
  changeColorAndVerify(buttons.red);
  await changeSliderAndVerifyDisplay(sliders.position, "-3.0", "位置X: -3.0");
  
  // 最終確認：他の操作後でも最初の値が維持されているか
  expect(screen.getByText("サイズ: 2.0")).toBeInTheDocument();
});
```
機能間の意図せぬ結合や副作用の防止。

### 複合操作テスト

#### 現実的なユーザーシナリオの検証

```tsx
test('実際の使用パターンでの動作確認', async () => {
  const { sliders, buttons } = setupInteractiveCubeTest();
  
  // ユーザーが実際に行いそうな操作の組み合わせ
  await changeSliderAndVerifyDisplay(sliders.size, "2.5", "サイズ: 2.5");
  changeColorAndVerify(buttons.blue);
  await changeSliderAndVerifyDisplay(sliders.rotation, "0.05", "回転速度: 0.05");
});
```

#### 状態分離と副作用防止

複合操作テストにより、以下の品質を保証：
- **状態分離**: 各機能のStateが独立して管理されている
- **副作用の防止**: ある機能の操作が他機能に意図しない影響を与えない
- **UI一貫性**: 複合操作後もすべての表示が正確

### Three.js特有のテスト課題

#### WebGLコンテキスト管理

Three.jsアプリケーションでは、WebGLコンテキストの適切な管理が重要です：

```tsx
// WebGLRenderer初期化の検証
test('WebGLRendererが正常に初期化される', () => {
  render(<InteractiveCube />);
  const canvas = container.querySelector('canvas');
  expect(canvas).toBeInTheDocument();
});
```

#### 3Dオブジェクト状態の検証手法

DOMの状態観察だけでは、Three.jsオブジェクトの内部状態（色、位置、回転など）の変更を直接検証できません。この「DOMとWebGLの間の壁」を乗り越えるには、テストユーティリティを通じてThree.jsシーンにアクセスする必要があります。

#### パフォーマンステストの考慮点

3Dレンダリングでは、以下の要素がパフォーマンスに影響します：
- フレームレート
- メモリ使用量
- GPU使用率
- レンダリング時間

これらの監視には、標準的なJestテストを超えた専門的なツールや手法が必要となります。

## 7. 実践的なトラブルシューティング

### よくある型エラーとその解決

#### 型推論エラー（ts(2742)）
```
The inferred type of 'X' cannot be named without a reference to 'Y'. 
This is likely not portable. A type annotation is necessary.
```

**解決策**: ライブラリが公式にエクスポートしている型名を明示的に指定
```tsx
import { RenderResult } from '@testing-library/react';

export const renderComponent = (): RenderResult => {
  return render(<Component />);
};
```

#### null の可能性エラー
```
Object is possibly 'null'
```

**解決策**: 適切な型ガードの実装
```tsx
const element = container.querySelector('input');
if (element) {
  // この中では element は null ではないと TypeScript が理解
  fireEvent.change(element, { target: { value: '2.0' } });
}
```

### テスト失敗時のデバッグ手法

#### DOM状態の詳細確認
```tsx
// DOM構造の出力
console.log(container.innerHTML);

// 特定要素の詳細確認
const element = screen.getByText(/サイズ:/);
console.log(element.textContent);
console.log(element.outerHTML);
```

#### 非同期処理のデバッグ
```tsx
// waitForを使用した詳細なデバッグ
await waitFor(() => {
  const element = screen.getByText('期待値');
  console.log('要素が見つかりました:', element);
}, { timeout: 5000 });
```

#### モック関数の呼び出し確認
```tsx
// モック関数が期待通りに呼ばれているかの確認
expect(mockFunction).toHaveBeenCalled();
expect(mockFunction).toHaveBeenCalledWith(expectedArgs);
expect(mockFunction).toHaveBeenCalledTimes(1);
```

### パフォーマンス問題の特定と対処

#### テスト実行時間の監視
```tsx
test('パフォーマンステスト', () => {
  const startTime = performance.now();
  
  // テスト対象の処理
  render(<HeavyComponent />);
  
  const endTime = performance.now();
  const executionTime = endTime - startTime;
  
  expect(executionTime).toBeLessThan(1000); // 1秒以内
});
```

#### メモリリークの検出
```tsx
afterEach(() => {
  // コンポーネントのクリーンアップ確認
  cleanup();
  
  // 必要に応じて追加のクリーンアップ処理
});
```

#### 大量データでのテスト
```tsx
test('大量データでもパフォーマンスが安定している', () => {
  const largeDataSet = Array.from({ length: 1000 }, (_, i) => ({ id: i, value: Math.random() }));
  
  render(<DataVisualization data={largeDataSet} />);
  
  // パフォーマンス指標の確認
  expect(container.querySelectorAll('[data-testid="data-point"]')).toHaveLength(1000);
});
```

---

このドキュメントの内容を参考に、堅牢で保守性の高いテストコードを作成し、プロジェクトの品質向上に貢献してください。新しい技術パターンを発見した際は、このドキュメントを更新して知識を蓄積していくことが重要です。
