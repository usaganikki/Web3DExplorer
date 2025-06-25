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

    test('全色ボタンの連続操作テスト', () => {
        const { buttons } = setupInteractiveCubeTest();

        changeColorAndVerify(buttons.green);
        changeColorAndVerify(buttons.blue);
        changeColorAndVerify(buttons.red);
        changeColorAndVerify(buttons.yellow);
    });

    test('同じ色ボタンを連続クリックしても安定動作する', () => {
        const { buttons } = setupInteractiveCubeTest();

        changeColorAndVerify(buttons.green);
        changeColorAndVerify(buttons.green);
        changeColorAndVerify(buttons.green);
        changeColorAndVerify(buttons.green);
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

    test('回転速度スライダーの精度境界値テスト', async () => {
        const { sliders } = setupInteractiveCubeTest();
        
        // 最小精度での動作確認
        await changeSliderAndVerifyDisplay(sliders.rotation, '0.001', '回転速度: 0.00');
        await changeSliderAndVerifyDisplay(sliders.rotation, '0.01', '回転速度: 0.01'); 
        await changeSliderAndVerifyDisplay(sliders.rotation, '0.1', '回転速度: 0.10');
    });

    test('回転速度スライダーの実用値テスト', async () => {
        const { sliders } = setupInteractiveCubeTest();
        
        // 実際に使用されそうな値での確認
        await changeSliderAndVerifyDisplay(sliders.rotation, '0.005', '回転速度: 0.01');
        await changeSliderAndVerifyDisplay(sliders.rotation, '0.025', '回転速度: 0.03');
        await changeSliderAndVerifyDisplay(sliders.rotation, '0.075', '回転速度: 0.07');
    });
    
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

    // ========================================
    // 基本的なエッジケーステスト
    // ========================================
    test('スライダーがブラウザによって範囲制限される', () => {
        const { sliders } = setupInteractiveCubeTest();

        // 範囲外値でのテスト
        fireEvent.change(sliders.size, { target: { value: '999' } });
        // ブラウザがmax="3.0"で自動制限することを確認
        expect(parseFloat(sliders.size.value)).toBeLessThanOrEqual(3.0);
        
        fireEvent.change(sliders.size, { target: { value: '-999' } });
        // ブラウザがmin="0.5"で自動制限することを確認  
        expect(parseFloat(sliders.size.value)).toBeGreaterThanOrEqual(0.5);
    });

    test('スライダーに無効な文字列を入力しても安全に動作する', () => {
        const { sliders } = setupInteractiveCubeTest();

        // 文字列入力テスト
        fireEvent.change(sliders.size, { target: { value: 'abc' } });
        expect(
            () => {
                expect(screen.getByText(/サイズ:/)).toBeInTheDocument();
            }
        ).not.toThrow();
    });


    test('スライダーを高速で操作しても安定している', () => {
        const { sliders } = setupInteractiveCubeTest();

        for (let i =0; i < 5; i++) {
            const value = (Math.random() * 2.5 + 0.5).toFixed(1);
            fireEvent.change(sliders.size, { target: { value } });
        }

        const finalValue = parseFloat(sliders.size.value);
        expect(finalValue).toBeGreaterThanOrEqual(0.5);
        expect(finalValue).toBeLessThanOrEqual(3.0);
    });
  
})