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
*(ここに今後Three.jsについて学んだことを記述していきます。)*
---

## III. 単体テストについて (Issue #41)

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

## IV. カスタマイズについて

(今後記述予定)

---

## V. まとめ

`InteractiveCube.tsx` の実装とIssue #41の準備を通じて、特にThree.jsにおけるCanvasのサイジング戦略の重要性について学びました。親要素のサイズに基づいてCanvasの寸法を決定することで、より柔軟で再利用性の高いコンポーネント設計が可能になります。また、単体テストの観点についても初期的な考察を行いました。

これらの知見は、今後の開発に活かしていきます。
