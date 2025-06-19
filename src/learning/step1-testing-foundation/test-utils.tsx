import { render, screen, RenderResult } from '@testing-library/react';
import { InteractiveCube } from './InteractiveCube';
import { fireEvent } from '@testing-library/react';

export const renderInteractiveCube = () : RenderResult => {
    return render(<InteractiveCube />);
};

export const renderInteractiveCubeTest = () => {
    const renderResult = renderInteractiveCube();
    const sliders = getSliders(renderResult.container);
    const buttons = getColorButtons();

    return {
        ...renderResult,
        sliders,
        buttons
    };
};

export const getSliders = (container: HTMLElement) => {
    const sizeSlider = container.querySelector('input[min="0.5"]') as HTMLInputElement;
    const positionSlider = container.querySelector('input[min="-5"]') as HTMLInputElement;
    const rotationSlider = container.querySelector('input[max="0.1"]') as HTMLInputElement;
    
    return {
        size: sizeSlider,
        position: positionSlider,
        rotation: rotationSlider
    };
};

export const getColorButtons = () => {
    return {
        green: screen.getByText('緑'),
        red: screen.getByText('赤'),
        blue: screen.getByText('青'),
        yellow: screen.getByText('黄')
    };
};