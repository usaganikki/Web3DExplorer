import { render, screen } from '@testing-library/react'
import { InteractiveCube } from './InteractiveCube'

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
        const sliders = container.querySelectorAll('Input[type="range"]');

        expect(sliders).toHaveLength(3);
    })
})