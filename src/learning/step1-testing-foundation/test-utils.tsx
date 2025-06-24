import { render, screen, RenderResult } from '@testing-library/react';
import { InteractiveCube } from './InteractiveCube';
import { fireEvent } from '@testing-library/react';

type ColorButtons = {
    green: HTMLButtonElement;
    red: HTMLButtonElement;
    blue: HTMLButtonElement;
    yellow: HTMLButtonElement;
};

export const renderComponent = (): RenderResult => {
    return render(<InteractiveCube />);
}

export const setupInteractiveCubeTest = () => {
    const renderResult = renderComponent();
    const sliders = getSliders(renderResult.container);
    const buttons = getColorButtons(renderResult.container);

    return {
        ...renderResult,
        sliders,
        buttons
    };
};

export const getSliders = (container: HTMLElement) => {
    const sizeSlider = container.querySelector('input[min="0.5"]');
    const positionSlider = container.querySelector('input[min="-5"]');
    const rotationSlider = container.querySelector('input[max="0.1"]');
    
    // 事前にnullチェック
    if (!sizeSlider || !positionSlider || !rotationSlider) {
        throw new Error('スライダーが見つかりませんでした');
    }
    
    return {
        size: sizeSlider as HTMLInputElement,
        position: positionSlider as HTMLInputElement,
        rotation: rotationSlider as HTMLInputElement,
    };
};

export const changeSliderValue = (slider: HTMLInputElement, value: string) => {
    expect(slider).toBeInTheDocument();
    fireEvent.change(slider, { target: { value }});
    return slider;
    
};

export const changeSliderAndVerifyDisplay = async (
    slider : HTMLInputElement,
    value : string,
    expectedText : string
) => {
    changeSliderValue(slider, value);
    expect(await screen.findByText(expectedText)).toBeInTheDocument();
};

export const changeColorAndVerify = ( button : HTMLButtonElement) => {
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
};

export const getColorButtons = (container: HTMLElement) => {
    const buttons = Array.from(container.querySelectorAll('button'));
    
    return {
        green: buttons.find(btn => btn.textContent === '緑') as HTMLButtonElement,
        red: buttons.find(btn => btn.textContent === '赤') as HTMLButtonElement,
        blue: buttons.find(btn => btn.textContent === '青') as HTMLButtonElement,
        yellow: buttons.find(btn => btn.textContent === '黄') as HTMLButtonElement
    };
};

export const verifyCanvasElements = (container: HTMLElement) => {
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
    expect(canvas).toHaveAttribute('width');
    expect(canvas).toHaveAttribute('height');
};

export const verifyBasicElements = (container : HTMLElement) => {
    const sliders = getSliders(container);
    expect(sliders.size).toBeInTheDocument();
    expect(sliders.position).toBeInTheDocument();
    expect(sliders.rotation).toBeInTheDocument();

    const buttons = getColorButtons(container);
    Object.values(buttons).forEach(button => {
        expect(button).toBeInTheDocument();
    });
};

export const verifyAllBasicElements = (container: HTMLElement) => {
    verifyCanvasElements(container);
    verifyBasicElements(container);
};

export const getSlidersWithValidation = (container : HTMLElement) => {
    const sliders = getSliders(container);
    verifyBasicElements(container);
    return sliders;
}

export const verifySliderValue = (slider: HTMLInputElement, expectedValue: string) => {
    expect(slider.value).toBe(expectedValue);
};
