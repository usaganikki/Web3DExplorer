import { fireEvent, render, screen } from '@testing-library/react';
import { InteractiveCube } from './InteractiveCube';
import { fail } from 'assert';
import { renderComponent, setupInteractiveCubeTest, verifyBasicElements, verifyCanvasElements, changeSliderAndVerifyDisplay, changeColorAndVerify } from './test-utils';


describe('InteractiveCube', () => {
    test('Canvasコンポーネントがレンダリングされる', () => {
        const { container } = renderComponent();
        verifyCanvasElements(container);
    });

    test('色変更ボタンとスライダーが表示される', () => {
        const { container } = renderComponent();
        verifyBasicElements(container);
    });

    test('色変更ボタンをクリックできる', () => {
        const { buttons } = setupInteractiveCubeTest();
        changeColorAndVerify(buttons.red);
    });

    test('サイズスライダーの操作後、表示される値が更新される', async () => {
        const { sliders } = setupInteractiveCubeTest();
        await changeSliderAndVerifyDisplay(sliders.size, '2.5', 'サイズ: 2.5');
    });

    test('サイズスライダーが更新された後値が反映される', async () => {
        const { sliders } = setupInteractiveCubeTest();
      
        /// まずスライダー値を変更
        fireEvent.change(sliders.size, { target: { value: '2.0' } });
        // 値が反映されたことを確認
        expect(sliders.size).toHaveValue('2');
    });


    // 境界値テスト：最小値
    test('サイズスライダーが最小値(0.5)の時に、表示が正しく更新される',  async () => {
        const { sliders } = setupInteractiveCubeTest();
        await changeSliderAndVerifyDisplay(sliders.size, '0.5', 'サイズ: 0.5');
    });
  
    // 境界値テスト：最大値
    test('サイズスライダーが最大値(3.0)の時に、表示が正しく更新される', async () => {
        const { sliders } = setupInteractiveCubeTest();
        await changeSliderAndVerifyDisplay(sliders.size, '3.0', 'サイズ: 3.0');
    });

    // InteractiveCube.test.tsx に追加するテストコード案

    test('複数のスライダーとボタンを連続して操作しても、各状態が正しく保たれる', async () => {
        const { sliders, buttons } = setupInteractiveCubeTest();
    
        // 1. サイズスライダーを操作
        await changeSliderAndVerifyDisplay(sliders.size, "2.0", "サイズ: 2.0");
    
        // 2. 色変更ボタンをクリック
        changeColorAndVerify(buttons.red);
        // (ここでは色が変わったことのDOM上の確認は難しいが、エラーが出ないことを確認)
    
        // 3. 位置Xスライダーを操作
        await changeSliderAndVerifyDisplay(sliders.position, "-3.0", "位置X: -3.0");
        
        // 4. 最終確認：位置を変更した後でも、サイズの値が維持されているか？
        // この確認が複合操作テストの重要なポイントです
        expect(screen.getByText("サイズ: 2.0")).toBeInTheDocument();
    });

    // TODO CanvasからCubeが取得できないのでCubeの色変更などの結果のテストができない
    // test('赤色ボタンをクリックすると、Three.jsキューブのmaterial.colorが赤に変わる', () => {

    // });

  
})