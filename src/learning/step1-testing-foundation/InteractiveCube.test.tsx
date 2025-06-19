import { fireEvent, render, screen } from '@testing-library/react';
import { InteractiveCube } from './InteractiveCube';
import { fail } from 'assert';
import * as THREE from 'three';

describe('InteractiveCube', () => {
    test('コンポーネントがレンダリングされる', () => {
        const { container } = render(<InteractiveCube />);
        const canvas = container.querySelector('canvas');
        expect(canvas).toBeInTheDocument();
    });

    test('Canvas要素のサイズが設定されている', () => {
        const { container } = render(<InteractiveCube />);
        const canvas = container.querySelector('canvas');

        expect(canvas).toHaveAttribute('width');
        expect(canvas).toHaveAttribute('height');
    });

    test('色変更ボタンが表示される', () => {
        render(<InteractiveCube />);

        expect(screen.getByText('緑')).toBeInTheDocument();
        expect(screen.getByText('赤')).toBeInTheDocument();
        expect(screen.getByText('青')).toBeInTheDocument();
        expect(screen.getByText('黄')).toBeInTheDocument();
    });

    test('スライダーコントロールが存在する', () => {
        const { container } = render(<InteractiveCube />);
        const sliders = container.querySelectorAll('input[type="range"]');

        expect(sliders).toHaveLength(3);
    });

    test('色変更ボタンをクリックできる', () => {
        render(<InteractiveCube />);

        const redButton = screen.getByText('赤');
        fireEvent.click(redButton);
    });

    test('サイズスライダーが操作できる', () => {
        const { container } = render(<InteractiveCube />);
        const sizeSlider = container.querySelector('input[min="0.5"]');

        if (sizeSlider) {
            // このブロック内では、sizeSliderは HTMLElement 型として扱われる
            fireEvent.change(sizeSlider, { target: { value: '2.0' } });
          } else {
            // 要素が見つからなかった場合の処理
            // テストを意図的に失敗させるのが一般的
            fail('サイズスライダーが見つかりませんでした。'); 
          }
    });

    test('サイズスライダーが更新された後値が反映される', async () => {
        const { container } = render(<InteractiveCube />);
        const sizeSlider = container.querySelector('input[min="0.5"]');
      
        if (sizeSlider) {
            // このブロック内では、sizeSliderは HTMLElement 型として扱われる
            fireEvent.change(sizeSlider, { target: { value: '2.0' } });
        } else {
            // 要素が見つからなかった場合の処理
            // テストを意図的に失敗させるのが一般的
            fail('サイズスライダーが見つかりませんでした。'); 
        }
      
        // value属性を検証
        expect(sizeSlider).toHaveValue('2');
    });

    test('サイズスライダーの操作後、表示される値が更新される', async() => {
        const { container } = render(<InteractiveCube />);
        const sizeSlider = container.querySelector('input[min="0.5"]');
      
        // スライダーが見つからない場合はテストを失敗させます
        if (!sizeSlider) {
            fail('サイズスライダーが見つかりませんでした。');
        }

        fireEvent.change(sizeSlider, { target: { value: '2.5' } });
        const expectedValueText = await screen.findByText("サイズ: 2.5");
  

        expect(expectedValueText).toBeInTheDocument();
    });


    // 境界値テスト：最小値
    test('サイズスライダーが最小値(0.5)の時に、表示が正しく更新される', async () => {
        const { container } = render(<InteractiveCube />);
        const sizeSlider = container.querySelector('input[min="0.5"]');

        if (!sizeSlider) {
            fail('サイズスライダーが見つかりませんでした。');
        }

        // スライダーを最小値である '0.5' に設定
        fireEvent.change(sizeSlider, { target: { value: '0.5' } });

        // "サイズ: 0.5" と表示されることを確認
        const expectedValueText = await screen.findByText("サイズ: 0.5");
        expect(expectedValueText).toBeInTheDocument();
    });
  
    // 境界値テスト：最大値
    test('サイズスライダーが最大値(3.0)の時に、表示が正しく更新される', async () => {
        const { container } = render(<InteractiveCube />);
        const sizeSlider = container.querySelector('input[min="0.5"]');
    
        if (!sizeSlider) {
        fail('サイズスライダーが見つかりませんでした。');
        }
    
        // スライダーを最大値である '3.0' に設定
        fireEvent.change(sizeSlider, { target: { value: '3.0' } });
    
        // "サイズ: 3.0" と表示されることを確認
        const expectedValueText = await screen.findByText("サイズ: 3.0");
        expect(expectedValueText).toBeInTheDocument();
    });

    // InteractiveCube.test.tsx に追加するテストコード案

    test('複数のスライダーとボタンを連続して操作しても、各状態が正しく保たれる', async () => {
        const { container } = render(<InteractiveCube />);
        
        const sizeSlider = container.querySelector('input[min="0.5"]');
        const positionSlider = container.querySelector('input[min="-5"]');
        const redButton = screen.getByText('赤');
    
        // 各UI要素が見つかることを確認
        if (!sizeSlider || !positionSlider) {
        fail('スライダーが見つかりませんでした。');
        }
    
        // 1. サイズスライダーを操作
        fireEvent.change(sizeSlider, { target: { value: '2.0' } });
        // 表示が "サイズ: 2.0" になることを確認
        expect(await screen.findByText("サイズ: 2.0")).toBeInTheDocument();
    
        // 2. 色変更ボタンをクリック
        fireEvent.click(redButton);
        // (ここでは色が変わったことのDOM上の確認は難しいが、エラーが出ないことを確認)
    
        // 3. 位置Xスライダーを操作
        fireEvent.change(positionSlider, { target: { value: '-3.0' } });
        // 表示が "位置X: -3.0" になることを確認
        expect(await screen.findByText("位置X: -3.0")).toBeInTheDocument();
    
        // 4. 最終確認：位置を変更した後でも、サイズの値が維持されているか？
        // この確認が複合操作テストの重要なポイントです
        expect(screen.getByText("サイズ: 2.0")).toBeInTheDocument();
    });

    // TODO CanvasからCubeが取得できないのでCubeの色変更などの結果のテストができない
    // test('赤色ボタンをクリックすると、Three.jsキューブのmaterial.colorが赤に変わる', () => {
    //     render(<InteractiveCube />);
    //     const redButton = screen.getByText('赤');

    //     // 赤ボタンをクリック
    //     fireEvent.click(redButton);

    //     // 【課題】コンポーネント内のキューブインスタンス（cubeRef.current）を
    //     // どうやってここ（テストコード内）で取得すればよいだろうか？
    //     const cube = null; // ???

    //     // --- 以下は、もしcubeが取得できた場合の理想的な検証コード ---
        
    //     // このチェックを実行するためには、まず上の `cube` を取得する必要があります。
    //     if (cube) {
    //         const cubeMaterial = (cube as THREE.Mesh).material as THREE.MeshBasicMaterial;
    //         const expectedColor = new THREE.Color('red'); // 期待する色は赤
            
    //         // キューブのマテリアルの色が、期待通り赤色になっているか検証
    //         expect(cubeMaterial.color.getHexString()).toEqual(expectedColor.getHexString());
    //     } else {
    //         // cubeを取得できない現状では、テストは意図的に失敗させる
    //         fail('テスト対象のキューブインスタンスを取得できませんでした。どうすれば良いか考えてみましょう。');
    //     }
    // });

  
})