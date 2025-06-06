# 学習メモ: React と Three.js の基礎 (BasicCubeより)

このドキュメントは、`BasicCube.tsx` コンポーネントを通じて学んだReactの主要な概念と、Three.jsに関する初期の学習メモをまとめるためのものです。

## I. React の基礎

このセクションでは、Reactのフック (`useRef`, `useEffect`)、`export` / `import` の概念についてまとめます。

### 1. `useRef`

`useRef` フックは、主に以下の目的で使用されます。

*   **DOM要素への直接的な参照の保持**:
    *   Reactコンポーネント内で特定のDOM要素（例: `<canvas>` や `<input>`）にアクセスしたい場合に使用します。
    *   `const myRef = useRef(null);` のように宣言し、JSX要素の `ref` 属性に `<div ref={myRef}>` のように指定します。
    *   `myRef.current` を通じて実際のDOM要素にアクセスできます。**この `.current` プロパティが、マウント後に実際のDOM要素そのものを指します。** `myRef` 自体は参照を保持するコンテナオブジェクトです。
    *   `BasicCube.tsx` では、`<canvas>` 要素への参照を保持するために `canvasRef` が使用されています。
        ```typescript
        // BasicCube.tsx の例
        const canvasRef = useRef<HTMLCanvasElement>(null);
        // ...
        useEffect(() => {
          if (canvasRef.current) {
            // canvasRef.current は <canvas> DOM要素
            const canvasElement = canvasRef.current;
            console.log(canvasElement.width); // DOM要素のプロパティにアクセス
            // Three.jsのレンダラーにこのcanvasElementを渡す
          }
        }, []);
        // ...
        return <canvas ref={canvasRef} />;
        ```

*   **再レンダリングを引き起こさない値を保持**:
    *   コンポーネントのライフサイクルを通じて値を保持したいが、その値の変更がUIの再レンダリングを引き起こすべきではない場合（例: タイマーIDなど）に使用します。

### 2. `useEffect`

`useEffect` フックは、コンポーネントのレンダリング後に副作用（データの取得、DOMの操作、イベントリスナーの登録、タイマーの設定など）を実行するために使用されます。

*   **基本的な構文**:
    ```javascript
    useEffect(() => {
      // 副作用を実行するコード (エフェクト関数)
      // 例: Three.jsの初期化、イベントリスナーの登録

      return () => {
        // クリーンアップ処理 (オプション)
        // 例: Three.jsのリソース解放、イベントリスナーの削除
      };
    }, [dependency1, dependency2]); // 依存配列
    ```

*   **実行タイミング**:
    *   **マウント時**: コンポーネントが初めてDOMにレンダリングされた直後にエフェクト関数が実行されます。依存配列が空 `[]` の場合、マウント時に一度だけ実行されます。
    *   **依存関係の変更時**: 依存配列に指定された値が変更された場合、前回のクリーンアップ関数が実行された後、新しい値でエフェクト関数が再度実行されます。
    *   **アンマウント時**: コンポーネントがDOMから削除される直前にクリーンアップ関数が実行されます。依存配列が空 `[]` の場合、アンマウント時に一度だけ実行されます。

*   **`BasicCube.tsx` での `useEffect`**:
    *   依存配列が空 `[]` であるため、エフェクト関数は `BasicCube` コンポーネントがマウントされた後に一度だけ実行されます。
    *   Three.jsの初期化処理（レンダラー、シーン、カメラの作成）はエフェクト関数内で行います。
    *   同様に、クリーンアップ関数は `BasicCube` コンポーネントがアンマウントされる時に一度だけ実行され、Three.jsのリソース解放処理（例: `renderer.dispose()`）をここで行います。

### 3. `export` と `import`

`export` キーワードは、JavaScriptモジュール内で定義された関数、オブジェクト、クラス、変数などを他のモジュールから利用できるようにするために使用します。`import` キーワードは、他のモジュールからエクスポートされた機能を利用するために使用します。

*   **名前付きエクスポート (Named Exports)**:
    *   モジュールから複数の機能をエクスポートする場合に使用します。
    *   エクスポート側:
        ```javascript
        // myModule.js
        export const myVariable = 'Hello';
        export function myFunction() { console.log('World'); }
        ```
    *   インポート側: `{}` (波括弧) を使って、エクスポートされた名前でインポートします。
        ```javascript
        // main.js
        import { myVariable, myFunction } from './myModule.js';
        ```
    *   `BasicCube.tsx` の `export const BasicCube ...` はこれに該当します。

*   **デフォルトエクスポート (Default Export)**:
    *   モジュールから単一の主要な機能をエクスポートする場合によく使用されます。モジュールごとに1つだけ設定できます。
    *   エクスポート側:
        ```javascript
        // myComponent.js
        const MyComponent = () => { /* ... */ };
        export default MyComponent;
        ```
    *   インポート側: `{}` を使わず、任意の名前でインポートできます。
        ```javascript
        // App.js
        import AnyNameForMyComponent from './myComponent.js';
        ```

*   **`BasicCube.tsx` と `App.tsx` の例**:
    *   `BasicCube.tsx` は `BasicCube` を名前付きエクスポートしています:
        ```typescript
        // src/learning/step1-basic/BasicCube.tsx
        export const BasicCube: React.FC = () => { /* ... */ };
        ```
    *   そのため、`App.tsx` でインポートする際は、名前付きインポートを使用する必要があります:
        ```typescript
        // src/dev/App.tsx
        import { BasicCube } from '@/learning/step1-basic/BasicCube'; // 正しい
        // import BasicCube from '@/learning/step1-basic/BasicCube'; // これはエラーになる
        ```

## II. Three.js の基礎

このセクションでは、`BasicCube.tsx` の実装と関連するThree.jsの概念について学習した内容をまとめます。

### 1. Three.js の基本セットアップの流れ (BasicCube.tsxより)

`BasicCube.tsx` では、以下の手順でThree.jsの基本的なセットアップを行っています。

1.  **`useRef` で `<canvas>` 要素への参照を取得**:
    *   Reactコンポーネント内の `<canvas>` 要素をThree.jsの描画ターゲットとして使用します。
2.  **`useEffect` でThree.jsの初期化**:
    *   コンポーネントのマウント後に一度だけ実行されるように、依存配列を空 `[]` にします。
    *   この中で、シーン、カメラ、レンダラーを作成します。
3.  **シーン (Scene) の作成**:
    *   3Dオブジェクトやライトを配置するための空間です。
    *   `const scene = new THREE.Scene();`
4.  **カメラ (Camera) の作成**:
    *   シーンをどの視点から見るかを定義します。`BasicCube.tsx` では `PerspectiveCamera` を使用しています。
    *   `const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);`
5.  **レンダラー (Renderer) の作成**:
    *   シーンとカメラの情報に基づいて、指定された `<canvas>` 要素に描画します。`BasicCube.tsx` では `WebGLRenderer` を使用しています。
    *   `const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current });`
    *   `renderer.setSize(width, height);` で描画サイズを設定します。
6.  **初期描画**:
    *   `renderer.render(scene, camera);` を呼び出して、初期状態のシーンを描画します。
    *   (アニメーションループは今後のステップで実装)
7.  **クリーンアップ**:
    *   `useEffect` のクリーンアップ関数内で、`renderer.dispose();` を呼び出し、Three.jsが使用したリソースを解放します。

### 2. カメラ (Camera) - `PerspectiveCamera`

人間が現実世界で物を見るときのように、遠くのものは小さく、近くのものは大きく見えるように3Dシーンをレンダリングするカメラです。

*   **コンストラクタの主な引数**:
    *   `fov` (Field of View / 視野角): カメラが見渡せる角度 (度数法)。例: `75`。
    *   `aspect` (Aspect Ratio / アスペクト比): カメラの表示領域の幅と高さの比率。例: `window.innerWidth / window.innerHeight`。
    *   `near` (Near Clipping Plane / 近クリッピング平面): この距離よりカメラに近いオブジェクトは描画されない。例: `0.1`。
    *   `far` (Far Clipping Plane / 遠クリッピング平面): この距離よりカメラから遠いオブジェクトは描画されない。例: `1000`。
*   **位置設定**: `camera.position.z = 5;` のようにしてカメラの位置を調整します。`BasicCube.tsx` では、原点からZ軸方向に少し離れた位置にカメラを置いています。

### 3. レンダラー (Renderer) - `WebGLRenderer`

WebGL (Web Graphics Library) を利用して3Dグラフィックスを描画する、Three.jsで最も一般的に使用されるレンダラーです。

*   **役割**: シーン (Scene) とカメラ (Camera) の情報に基づき、指定されたHTMLの `<canvas>` 要素上に実際に3Dグラフィックスを描画（レンダリング）します。言い換えれば、3D空間の情報を2Dの画像に変換する処理を担当します。
*   **基本的な関係性**:
    *   **Canvas**: 3Dグラフィックスが描画されるHTML要素（舞台）。
    *   **Scene**: 描画する3Dオブジェクト、ライト、カメラなどを含む仮想空間（脚本と登場人物）。
    *   **Camera**: Sceneをどの視点から見るかを定義（視点）。
    *   **Renderer**: SceneをCameraの視点から見て、Canvasに描画を実行（演出家）。
*   **初期化**: `new THREE.WebGLRenderer({ canvas: canvasRef.current })` のように、描画対象のcanvasを指定します。
*   **サイズ設定**: `renderer.setSize(width, height)` で描画領域のサイズを設定します。
*   **描画**: `renderer.render(scene, camera)` で実際に描画を行います。
*   **他のレンダラー**:
    *   `SVGRenderer`: SVG形式で出力。
    *   `CSS2DRenderer`/`CSS3DRenderer`: HTML要素を3D空間に配置。
    *   これらは特定の用途で使われますが、汎用的な3D描画には `WebGLRenderer` が主流です。

### 4. WebGPU と Three.js (補足情報)

WebGPUは、WebGLの後継となる新しいウェブグラフィックスAPIで、より高いパフォーマンスを目指しています。

*   Three.jsでもWebGPUに対応したレンダラーの開発が進められていますが、現時点 (2025年6月) では実験的な段階です。
*   現在の学習では `WebGLRenderer` を使用します。

### 5. ジオメトリ (Geometry)

Three.jsにおける**ジオメトリ (Geometry)** とは、3Dオブジェクトの**形状**を定義するものです。具体的には、オブジェクトを構成する頂点（空間上の点の集まり）や面（それらの頂点を結んでできる多角形）の情報を保持しています。

ジオメトリは、オブジェクトがどのような形をしているか（立方体なのか、球体なのか、もっと複雑な形なのか）を決定する骨組みのようなものと考えてください。これにマテリアル（色や質感）を組み合わせることで、最終的な表示物であるメッシュ (Mesh) が作られます。

**Mesh = Geometry (形状) + Material (見た目)**

#### `BoxGeometry` の解説

`BoxGeometry` は、その名の通り**直方体（箱型）**のジオメトリを簡単に作成するためのクラスです。

```javascript
const geometry = new THREE.BoxGeometry(width, height, depth, widthSegments, heightSegments, depthSegments);
```

主なパラメータは以下の通りです。

*   `width`: X軸方向の幅。デフォルトは1です。
*   `height`: Y軸方向の高さ。デフォルトは1です。
*   `depth`: Z軸方向の奥行き。デフォルトは1です。
*   `widthSegments` (オプション): 幅方向の分割数。デフォルトは1です。
*   `heightSegments` (オプション): 高さ方向の分割数。デフォルトは1です。
*   `depthSegments` (オプション): 奥行き方向の分割数。デフォルトは1です。

#### その他の代表的なジオメトリ

*   **`SphereGeometry`**: 球体
*   **`PlaneGeometry`**: 平面
*   **`CylinderGeometry`**: 円柱
*   **`ConeGeometry`**: 円錐
*   **`TorusGeometry`**: ドーナツ形状（トーラス）
*   **`BufferGeometry`**: より汎用的なジオメトリクラス

### 6. マテリアル (Material)

Three.jsにおける**マテリアル (Material)** とは、3Dオブジェクトの**見た目や質感**を定義するものです。ジオメトリがオブジェクトの「形」を決定するのに対し、マテリアルはその表面がどのように光を反射し、どのような色やテクスチャを持つかを決定します。

主な要素：

*   **色 (Color)**
*   **透明度 (Opacity/Transparency)**
*   **光沢 (Shininess)**
*   **テクスチャ (Texture/Map)**
*   **ワイヤーフレーム (Wireframe)**

#### `MeshBasicMaterial` の解説

`MeshBasicMaterial` は、最もシンプルなマテリアルの一つで、**光源の影響を受けません**。常に指定された色で均一に表示されます。

```javascript
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
```

主なプロパティ：

*   `color`: マテリアルの色。
*   `wireframe`: ワイヤーフレーム表示にするか。
*   `opacity`: 透明度 (0.0 - 1.0)。`transparent` を `true` にする必要あり。
*   `transparent`: 透明度を有効にするか。
*   `map`: 表面に貼り付けるテクスチャ。

#### その他の代表的なマテリアル

*   **`MeshLambertMaterial`**: 拡散反射（マットな表面）。計算負荷が比較的軽い。
*   **`MeshPhongMaterial`**: 鏡面反射（ハイライト、光沢）も表現可能。
*   **`MeshStandardMaterial`**: 物理ベースレンダリング (PBR) の標準マテリアル。金属っぽさ (`metalness`) や表面の粗さ (`roughness`) を調整可能。推奨。
*   **`MeshPhysicalMaterial`**: `MeshStandardMaterial` を拡張し、さらに高度な物理ベース表現が可能。
*   **`MeshNormalMaterial`**: 法線ベクトルを色として表示。デバッグ用。
*   **`ShaderMaterial` / `RawShaderMaterial`**: GLSLでカスタムシェーダーを記述するためのマテリアル。

（ここに今後Three.jsについて学んだことを記述していきます。）
