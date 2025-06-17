import { fireEvent, render, screen } from '@testing-library/react';
import { InteractiveCube } from './InteractiveCube';
import { fail } from 'assert';

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

    test('色変更ボタンをクリックできる', async () => {
        render(<InteractiveCube />);

        const redButton = screen.getByText('赤');
        fireEvent.click(redButton);
    });

    test('サイズスライダーが操作できる', async () => {
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
    })
})