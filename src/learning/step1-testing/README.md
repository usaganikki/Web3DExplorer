# 学習メモ: InteractiveCube と関連技術 (InteractiveCube.tsxより)

このドキュメントは、`InteractiveCube.tsx` コンポーネントの実装と、Issue #41「単体テストの体験に向けたインタラクティブなCube表示コンポーネントの準備」の作業を通じて得られた学びをまとめるものである。

## I. `InteractiveCube.tsx` の概要

`InteractiveCube.tsx` は、ユーザーがマウス操作で視点を変更できるインタラクティブな3Dキューブを表示するReactコンポーネントである。基本的な構造は `BasicCube.tsx` を踏襲しつつ、単体テストの対象となること、および将来的なカスタマイズを念頭に置いた設計とする。

主要な機能は以下の通りである。
*   Three.jsを用いた3Dキューブの描画
*   `OrbitControls` によるカメラ操作（回転、ズーム、パン）
*   キューブの自動回転アニメーション
*   ブラウザウィンドウのリサイズへの対応

## II. Three.jsについて

このセクションでは、`InteractiveCube` の作成過程で得られたThree.jsのノウハウをまとめる。
Three.jsの基本的なセットアップ（シーン、カメラ、レンダラー、ジオメトリ、マテリアル、アニメーションループ、リサイズ処理、`OrbitControls`の基本的な使い方など）については、[こちらの学習メモ (BasicCubeより)](../step1-basic/README.md) を参照すること。

### 1. `canvasRef` のサイズについて (Canvasのサイジング戦略)

Reactコンポーネント内でThree.jsのCanvasを適切にサイジングすることは、意図した通りのレイアウトを実現し、コンポーネントの再利用性を高める上で非常に重要である。

#### 1.1. 問題提起: `window.innerWidth` / `window.innerHeight` の利用

`BasicCube.tsx` の実装や初期の検討において、Canvasのサイズを `window.innerWidth` と `window.innerHeight` を基準に設定していた。このアプローチは、Canvasが常にブラウザウィンドウ全体を占める場合には有効であるが、親要素のレイアウト（パディングなど）との不整合や、コンポーネントの再利用性に課題が存在する。詳細は前述の [学習メモ (BasicCubeより)](../step1-basic/README.md) のリサイズ処理のセクションも参照すること。

#### 1.2. 解決策: 親要素のコンテンツ領域を基準にする

より堅牢で柔軟なサイジング戦略は、Canvas要素のサイズを、それが実際に配置される**親要素のコンテンツ領域のサイズ**に基づいて動的に設定することである。
`canvasRef.current.parentElement.clientWidth` および `canvasRef.current.parentElement.clientHeight` を利用することで、親要素のパディングを考慮した内側のサイズを取得する。

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

**このアプローチの利点**は以下の通りである。

*   **レイアウトの尊重**: 親要素のパディングやボーダーを考慮し、Canvasが親のコンテンツ領域内に正しく収まる。
*   **コンポーネントの独立性と再利用性向上**: `window` への直接的な依存を減らし、様々なサイズのコンテナ要素内でコンポーネントをより予測可能かつ柔軟に利用できる。

#### 1.3. 補足: `<body>` のデフォルトマージン

多くのブラウザは `<body>` 要素にデフォルトで `margin: 8px;` 程度のスタイルを適用する。Canvasを画面いっぱいに表示したい場合など、このマージンが意図しない余白となる場合は、CSSで `body { margin: 0; }` のようにリセットする必要がある。

---

### 2. インタラクティブな要素の追加と状態管理

Issue #41 の目的である「手動テストの体験」の一環として、キューブの色やサイズをインタラクティブに変更する機能を実装する。この実装は、ReactのフックとThree.jsの連携を示す好例である。

#### 2.1. `useState` による状態の保持

キューブの現在の色 (`cubeColor`) やサイズ (`cubeSize`) を管理するために、Reactの `useState` フックを利用する。

```typescript
// InteractiveCube.tsx
const [cubeColor, setCubeColor] = useState<string>('green');
const [cubeSize, setCubeSize] = useState<number>(1.0);
```

*   `useState<string>('green')` は、文字列型の状態 `cubeColor` を宣言し、初期値を `'green'` に設定する。
*   `setCubeColor` は、`cubeColor` の値を更新するための関数である。この関数が呼び出されると、コンポーネントが再レンダリングされる。
*   この分割代入 `[cubeColor, setCubeColor]` は、`useState` が返す配列（現在の状態値と更新関数）をそれぞれの変数に割り当てるJavaScriptの構文である。

#### 2.2. `useEffect` による状態変更の反映

`cubeColor` や `cubeSize` の状態が変更された際に、実際にThree.jsのキューブのプロパティを更新するために `useEffect` フックを使用する。

```typescript
// InteractiveCube.tsx (色変更のuseEffect)
useEffect(() => {
    if(!cubeRef.current){
        return;
    }
    const colorMap: {[Key: string]: number} = {
        'green': 0x00ff00,
        'red': 0xff0000,
        'blue': 0x0000ff,
        'yellow': 0xffff00
    };
    const material = cubeRef.current.material as THREE.MeshBasicMaterial;
    material.color.setHex(colorMap[cubeColor]);
}, [cubeColor]);

// InteractiveCube.tsx (サイズ変更のuseEffect)
useEffect(() => {
    if(!cubeRef.current){
        return;
    }
    cubeRef.current.scale.setScalar(cubeSize);
}, [cubeSize]);
```

*   依存配列に `[cubeColor]` や `[cubeSize]` を指定することで、それぞれの状態が変更されたときだけ対応するエフェクト関数が実行される。
*   `colorMap` は、状態として保持している色の名前を、Three.jsが要求する数値のカラーコードに変換するためのオブジェクトである。
    *   `{[Key: string]: number}` という型定義は、TypeScriptの**インデックスシグネチャ**であり、文字列キーと数値の値を持つオブジェクトであることを示す。
*   型アサーション (`as THREE.MeshBasicMaterial`) を使用し、マテリアルの `color.setHex()` メソッドを呼び出して色を更新する。
*   キューブの `scale.setScalar()` メソッドは、X, Y, Z軸のスケールを一律に設定する。

#### 2.3. `useRef` によるThree.jsオブジェクトへのアクセス

Three.jsで作成した `Mesh` オブジェクト (`cube`) に、Reactコンポーネントのライフサイクルを通じてアクセスするために `useRef` を使用する。

```typescript
// InteractiveCube.tsx
const cubeRef = useRef<THREE.Mesh>(); // 初期値は undefined

// useEffect 内で cube オブジェクト作成後
cubeRef.current = cube;
```

*   `useRef<THREE.Mesh>()` と型引数を指定し、初期値を指定しない場合、`.current` プロパティの初期値は `undefined` となる。これは、値が後から設定される場合に一般的なパターンである。
*   **`useRef` の初期値と型推論に関する注意点:**
    *   もし `useRef<THREE.Mesh>(null)` のように初期値を `null` で指定した場合、TypeScriptの型推論により `.current` プロパティが読み取り専用 (`readonly`) と解釈され、再代入時にエラーが発生する場合がある。
    *   これを避けるには、`useRef<THREE.Mesh | null>(null)` のように型引数で `null` を明示的に許容する必要がある。これにより、`.current` プロパティが書き換え可能になる。
    *   特に `null` を初期値として使う強い理由がない場合は、`useRef<THREE.Mesh>()` (初期値 `undefined`) を使用するのが簡潔で適切である。

*(ここに今後Three.jsについて学んだことを記述していきます。)*
---

## III. React/JSX と CSS について

インタラクティブなUI要素をThree.jsのキャンバスと組み合わせる際のポイントをまとめる。

### 1. JSXによるUIコントロールの追加

キューブの色を変更するためのボタンや、サイズを変更するためのスライダーコントロールをJSXで実装する。

```tsx
// InteractiveCube.tsx の return 文 (一部抜粋)
return (
    <div style={{ width: '100%', height: '100%' }}>
        {/* UIコントロール全体を囲むコンテナ */}
        <div style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            zIndex: 1000,
        }}>
            {/* 色選択ボタンのグループ */}
            <div>
                <button onClick={() => setCubeColor('green')}>緑</button>
                {/* ... 他の色のボタン ... */}
            </div>

            {/* サイズ変更UIのグループ */}
            <div style={{ marginTop: '10px' }}>
                <span style={{ color: 'white' }}>
                    サイズ: {cubeSize.toFixed(1)}
                </span>
                <input
                    type="range"
                    min="0.5"
                    max="3.0"
                    step="0.1"
                    value={cubeSize}
                    onChange={(e) => setCubeSize(parseFloat(e.target.value))}
                    style={{ verticalAlign: 'middle', marginLeft: '5px' }}
                />
            </div>
        </div>
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }}/>
    </div>
);
```
*   ボタンの `onClick` イベントで `setCubeColor` を呼び出し、`cubeColor` の状態を更新する。
*   `<input type="range">` を使用して、ユーザーが視覚的にサイズを選択できるようにする。`min`, `max`, `step` 属性でスライダーの挙動を制御し、`value` 属性で現在の状態と同期、`onChange` イベントで状態を更新する。
*   状態値を表示するテキスト (`<span>`) のスタイルを直接指定して、文字色を変更する。

### 2. CSSによる要素の重ね合わせとレイアウト調整

*   **要素の重ね合わせ:**
    *   UIコントロール群をまとめて一つの `div` (親コンテナ) に入れ、この親コンテナに `style={{position: 'absolute', top: '10px', left: '10px', zIndex: 1000}}` を指定することで、キャンバスの手前の特定位置にUI群全体を固定表示させる。
    *   `position: 'absolute'` は要素を通常のドキュメントフローから外し、`top`/`left` で位置を指定可能にする。
    *   `zIndex` は要素の重なり順を制御し、値が大きいほど手前に表示される。
*   **コンテナ内要素の配置:**
    *   `position: 'absolute'` を持つ親コンテナの内部では、子要素（色ボタンのグループ `div` やサイズ変更UIのグループ `div`）はデフォルトの `position: static` として扱われる。
    *   これにより、子要素は親コンテナ内で上から下へと順番に配置される。要素間の間隔は `margin` (例: `marginTop: '10px'`) を使って調整する。この方法は、絶対座標で各UI要素の位置を細かく指定するよりも柔軟で管理しやすいレイアウトを実現する。
*   **キャンバスのフルスクリーン表示とコンテナ要素:**
    *   当初、`InteractiveCube` コンポーネントが `<canvas>` のみを返していた際は、`App.tsx` の親 `div` (`height: '100vh'`) を基準にキャンバスが画面全体に広がっていた。
    *   `InteractiveCube` の戻り値を `<div><canvas /></div>` のように変更した際、内側の `<canvas>` の親がこの新しい `div` になった。この新しい `div` に明示的なサイズ指定がなかったため、キャンバスが縮小してしまう問題が発生した。
    *   解決策として、`InteractiveCube` が返すルートの `div` と、その中の `<canvas>` 要素の両方に `style={{ width: '100%', height: '100%' }}` を指定し、親要素のサイズを継承させる。これにより、`App.tsx` から `InteractiveCube` のルート `div` へ、そして最終的に `<canvas>` へとサイズ指定が伝播し、フルスクリーン表示が維持される。

---

## IV. カスタマイズについて

(今後記述予定)

---

## V. 単体テストについて (Issue #41)

Issue #41 の主な目的は、この `InteractiveCube` コンポーネントを対象とした単体テストを体験するための準備である。

### 1. テストの観点（概要）

`InteractiveCube.tsx` のようなコンポーネントのテストでは、以下のような点が考慮される。
*   コンポーネントが正しくマウントされ、Canvas要素が描画されること。
*   Three.jsの主要オブジェクト（Scene, Camera, Renderer, Controls）が期待通りに初期化されること。
*   イベントハンドラ（例: リサイズ）が適切に動作すること。
*   クリーンアップ処理が正しく実行されること。

### 2. テスト実装のヒント（概要）

*   Jest と React Testing Library を活用する。
*   Three.js関連のオブジェクトや `requestAnimationFrame` をモック化する。

### 3. テストの意義

*   リグレッションを防止する。
*   コンポーネントの振る舞いを明確化する。
*   リファクタリングの安全性を向上させる。

---
*(ここに今後単体テストについて学んだことを記述していきます。)*
---

## VI. まとめ

`InteractiveCube.tsx` の実装とIssue #41の準備は、Three.jsにおけるCanvasのサイジング戦略の重要性、Reactのフック（`useState`, `useEffect`, `useRef`）を用いたインタラクティブな機能（色変更、サイズ変更）の実装、TypeScriptの型システム（インデックスシグネチャ、`useRef`の型推論）、JSXとCSSによるUI構築（コントロールの追加、要素の重ね合わせ、コンテナ内での順序配置、テキストスタイリング）とレイアウト調整について深い理解をもたらす。親要素のサイズに基づいてCanvasの寸法を決定すること、状態管理と副作用の適切な分離、そしてUI要素の配置とスタイリングは、より柔軟で再利用性の高いコンポーネント設計に不可欠である。また、単体テストの観点についても初期的な考察を行う。

これらの知見は、今後の開発に活かすものである。
