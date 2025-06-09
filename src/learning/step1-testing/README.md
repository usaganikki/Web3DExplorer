# 学習メモ: InteractiveCube と関連技術 (InteractiveCube.tsxより)

このドキュメントは、`InteractiveCube.tsx` コンポーネントの実装と、Issue #41「単体テストの体験に向けたインタラクティブなCube表示コンポーネントの準備」の作業を通じて得られた学びをまとめるためのものです。

## I. `InteractiveCube.tsx` の概要

`InteractiveCube.tsx` は、ユーザーがマウス操作で視点を変更できるインタラクティブな3Dキューブを表示するReactコンポーネントです。基本的な構造は `BasicCube.tsx` を踏襲しつつ、単体テストの対象となること、および将来的なカスタマイズを念頭に置いています。

主要な機能：
*   Three.jsを用いた3Dキューブの描画
*   `OrbitControls` によるカメラ操作（回転、ズーム、パン）
*   キューブの自動回転アニメーション
*   ブラウザウィンドウのリサイズへの対応

## II. Three.jsについて

このセクションでは、`InteractiveCube` の作成の途中で得たThree.jsのノウハウについてまとめます。
Three.jsの基本的なセットアップ（シーン、カメラ、レンダラー、ジオメトリ、マテリアル、アニメーションループ、リサイズ処理、`OrbitControls`の基本的な使い方など）については、基本的なことは [こちらの学習メモ (BasicCubeより)](../step1-basic/README.md) にまとめてありますので、そちらを参照してください。

### 1. `canvasRef` のサイズについて (Canvasのサイジング戦略)

Reactコンポーネント内でThree.jsのCanvasを適切にサイジングすることは、意図した通りのレイアウトを実現し、コンポーネントの再利用性を高める上で非常に重要です。

#### 1.1. 問題提起: `window.innerWidth` / `window.innerHeight` の利用

`BasicCube.tsx` の実装や初期の検討では、Canvasのサイズを `window.innerWidth` と `window.innerHeight` を基準に設定していました。このアプローチは、Canvasが常にブラウザウィンドウ全体を占める場合には有効ですが、親要素のレイアウト（パディングなど）との不整合や、コンポーネントの再利用性に課題がありました。詳細は前述の [学習メモ (BasicCubeより)](../step1-basic/README.md) のリサイズ処理のセクションも参照してください。

#### 1.2. 解決策: 親要素のコンテンツ領域を基準にする

より堅牢で柔軟なサイジング戦略は、Canvas要素のサイズを、それが実際に配置される**親要素のコンテンツ領域のサイズ**に基づいて動的に設定することです。
`canvasRef.current.parentElement.clientWidth` および `canvasRef.current.parentElement.clientHeight` を利用することで、親要素のパディングを考慮した内側のサイズを取得できます。

```typescript
// InteractiveCube.tsx での主要な変更点 (useEffect内)
useEffect(() => {
  // ... canvasRef, parentElement の取得とチェック ...

  const setSizeBasedOnParent = () => {
    if (!canvasRef.current || !canvasRef.current.parentElement) return;
    const currentParentElement = canvasRef.current.parentElement;
    camera.aspect = currentParentElement.clientWidth / currentParentElement.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(currentParentElement.clientWidth, currentParentElement.clientHeight);
  };

  setSizeBasedOnParent(); // 初期サイズ設定
  window.addEventListener('resize', setSizeBasedOnParent); // リサイズ時の処理

  return () => {
    window.removeEventListener('resize', setSizeBasedOnParent);
    // ... 他のクリーンアップ処理
  };
}, []);
```

**このアプローチの利点**:

*   **レイアウトの尊重**: 親要素のパディングやボーダーを考慮し、Canvasが親のコンテンツ領域内に正しく収まります。
*   **コンポーネントの独立性と再利用性向上**: `window` への直接的な依存を減らし、様々なサイズのコンテナ要素内でコンポーネントをより予測可能かつ柔軟に利用できます。

#### 1.3. 補足: `<body>` のデフォルトマージン

多くのブラウザは `<body>` 要素にデフォルトで `margin: 8px;` 程度のスタイルを適用します。Canvasを画面いっぱいに表示したい場合など、このマージンが意図しない余白となる場合は、CSSで `body { margin: 0; }` のようにリセットする必要があります。

---

### 2. インタラクティブな要素の追加と状態管理

Issue #41 の目的である「手動テストの体験」の一環として、キューブの色をインタラクティブに変更する機能を追加しました。この実装を通じて、ReactのフックとThree.jsの連携について学びました。

#### 2.1. `useState` による状態の保持

キューブの現在の色 (`cubeColor`) を管理するために、Reactの `useState` フックを利用しました。

```typescript
// InteractiveCube.tsx
const [cubeColor, setCubeColor] = useState<string>('green');
```

*   `useState<string>('green')` は、文字列型の状態 `cubeColor` を宣言し、初期値を `'green'` に設定します。
*   `setCubeColor` は、`cubeColor` の値を更新するための関数です。この関数が呼び出されると、コンポーネントが再レンダリングされます。
*   この分割代入 `[cubeColor, setCubeColor]` は、`useState` が返す配列（現在の状態値と更新関数）をそれぞれの変数に割り当てるJavaScriptの構文です。

#### 2.2. `useEffect` による状態変更の反映

`cubeColor` の状態が変更された際に、実際にThree.jsのキューブマテリアルの色を更新するために `useEffect` フックを使用しました。

```typescript
// InteractiveCube.tsx
useEffect(() => {
    if(!cubeRef.current){
        return;
    }

    // 色名と16進数カラーコードのマッピング
    const colorMap: {[Key: string]: number} = {
        'green': 0x00ff00,
        'red': 0xff0000,
        'blue': 0x0000ff,
        'yellow': 0xffff00
    };

    const material = cubeRef.current.material as THREE.MeshBasicMaterial;
    // cubeColor の現在の値に基づいてマテリアルの色を設定
    material.color.setHex(colorMap[cubeColor]);
    }
), [cubeColor]; // cubeColor が変更された時のみこのエフェクトを実行
```

*   依存配列に `[cubeColor]` を指定することで、`cubeColor` の値が変更されたときだけこのエフェクト関数が実行されます。
*   `colorMap` は、状態として保持している色の名前（例: `'green'`）を、Three.jsが要求する数値のカラーコード（例: `0x00ff00`）に変換するためのオブジェクトです。
    *   この `{[Key: string]: number}` という型定義は、TypeScriptの**インデックスシグネチャ**であり、文字列キーと数値の値を持つオブジェクトであることを示します。
*   `cubeRef.current.material as THREE.MeshBasicMaterial` のように型アサーションを使用し、マテリアルの `color.setHex()` メソッドを呼び出して色を更新しています。

#### 2.3. `useRef` によるThree.jsオブジェクトへのアクセス

Three.jsで作成した `Mesh` オブジェクト (`cube`) に、Reactコンポーネントのライフサイクルを通じてアクセスするために `useRef` を使用しました。

```typescript
// InteractiveCube.tsx
const cubeRef = useRef<THREE.Mesh>(); // 初期値は undefined

// useEffect 内で cube オブジェクト作成後
cubeRef.current = cube;
```

*   `useRef<THREE.Mesh>()` と型引数を指定し、初期値を指定しない場合、`.current` プロパティの初期値は `undefined` となります。これは、値が後から設定される場合に一般的なパターンです。
*   **`useRef` の初期値と型推論に関する注意点:**
    *   もし `useRef<THREE.Mesh>(null)` のように初期値を `null` で指定した場合、TypeScriptの型推論により `.current` プロパティが読み取り専用 (`readonly`) と解釈され、再代入時にエラーが発生することがあります。
    *   これを避けるには、`useRef<THREE.Mesh | null>(null)` のように型引数で `null` を明示的に許容する必要があります。これにより、`.current` プロパティが書き換え可能になります。
    *   特に `null` を初期値として使う強い理由がない場合は、`useRef<THREE.Mesh>()` (初期値 `undefined`) を使用するのが簡潔で適切です。

*(ここに今後Three.jsについて学んだことを記述していきます。)*
---

## III. React/JSX と CSS について

インタラクティブなUI要素をThree.jsのキャンバスと組み合わせる際に学んだ点です。

### 1. JSXによるUIコントロールの追加

キューブの色を変更するためのボタンをJSXで実装しました。

```tsx
// InteractiveCube.tsx の return 文
return (
    <div style={{ width: '100%', height: '100%' }}>
        <div style={{position: 'absolute', top: '10px', left: '10px', zIndex: 1000}}>
            <button onClick={() => setCubeColor('green')}>緑</button>
            {/* 他の色のボタンも同様 */}
        </div>
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
    </div>
);
```
*   ボタンの `onClick` イベントで `setCubeColor` を呼び出し、`cubeColor` の状態を更新します。

### 2. CSSによる要素の重ね合わせとレイアウト調整

*   **要素の重ね合わせ:**
    *   ボタン群を囲む `div` に `style={{position: 'absolute', top: '10px', left: '10px', zIndex: 1000}}` を指定することで、キャンバスの手前の特定位置にボタンを固定表示しました。
    *   `position: 'absolute'` は要素を通常のドキュメントフローから外し、`top`/`left` で位置を指定可能にします。
    *   `zIndex` は要素の重なり順を制御し、値が大きいほど手前に表示されます。
*   **キャンバスのフルスクリーン表示とコンテナ要素:**
    *   当初、`InteractiveCube` コンポーネントが `<canvas>` のみを返していた際は、`App.tsx` の親 `div` (`height: '100vh'`) を基準にキャンバスが画面全体に広がっていました。
    *   `InteractiveCube` の戻り値を `<div><canvas /></div>` のように変更した際、内側の `<canvas>` の親がこの新しい `div` になりました。この新しい `div` に明示的なサイズ指定がなかったため、キャンバスが縮小してしまう問題が発生しました。
    *   解決策として、`InteractiveCube` が返すルートの `div` と、その中の `<canvas>` 要素の両方に `style={{ width: '100%', height: '100%' }}` を指定し、親要素のサイズを継承するようにしました。これにより、`App.tsx` から `InteractiveCube` のルート `div` へ、そして最終的に `<canvas>` へとサイズ指定が伝播し、フルスクリーン表示が維持されました。

---

## IV. カスタマイズについて

(今後記述予定)

---

## V. 単体テストについて (Issue #41)

Issue #41 の主な目的は、この `InteractiveCube` コンポーネントを対象とした単体テストを体験するための準備です。

### 1. テストの観点（概要）

`InteractiveCube.tsx` のようなコンポーネントのテストでは、以下のような点が考慮されます。

*   コンポーネントが正しくマウントされ、Canvas要素が描画されるか。
*   Three.jsの主要オブジェクト（Scene, Camera, Renderer, Controls）が期待通りに初期化されるか。
*   イベントハンドラ（例: リサイズ）が適切に動作するか。
*   クリーンアップ処理が正しく実行されるか。

### 2. テスト実装のヒント（概要）

*   Jest と React Testing Library の活用。
*   Three.js関連のオブジェクトや `requestAnimationFrame` のモック化。

### 3. テストの意義

*   リグレッションの防止。
*   コンポーネントの振る舞いの明確化。
*   リファクタリングの安全性向上。

---
*(ここに今後単体テストについて学んだことを記述していきます。)*
---

## VI. まとめ

`InteractiveCube.tsx` の実装とIssue #41の準備を通じて、特にThree.jsにおけるCanvasのサイジング戦略の重要性、Reactのフック（`useState`, `useEffect`, `useRef`）を用いたインタラクティブな機能の実装、TypeScriptの型システム（インデックスシグネチャ、`useRef`の型推論）、JSXとCSSによるUI構築とレイアウト調整について深く学びました。親要素のサイズに基づいてCanvasの寸法を決定すること、状態管理と副作用の適切な分離、そしてUI要素の配置とスタイリングは、より柔軟で再利用性の高いコンポーネント設計に不可欠です。また、単体テストの観点についても初期的な考察を行いました。

これらの知見は、今後の開発に活かしていきます。
