import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Web3DExplorerComponent, { Web3DExplorerComponentProps } from '@/components/Web3DExplorerComponent';

describe('Web3DExplorerComponent', () => {
  test('renders basic component structure', () => {
    render(<Web3DExplorerComponent />);
    
    // Check if main heading is rendered
    expect(screen.getByRole('heading', { name: /web3d explorer component/i })).toBeInTheDocument();
    
    // Check if basic content is present
    expect(screen.getByText('Content goes here.')).toBeInTheDocument();
  });

  test('applies custom style and className props', () => {
    const customStyle = { backgroundColor: 'red', padding: '20px' };
    const customClassName = 'custom-explorer';
    
    const { container } = render(
      <Web3DExplorerComponent 
        style={customStyle} 
        className={customClassName}
      />
    );
    
    const explorerDiv = container.firstChild as HTMLElement;
    expect(explorerDiv).toHaveClass(customClassName);
    expect(explorerDiv).toHaveStyle('background-color: red');
    expect(explorerDiv).toHaveStyle('padding: 20px');
  });

  test('displays initial data when provided', () => {
    const initialData = {
      scene: 'testScene',
      objects: ['cube', 'sphere'],
      config: { debug: true }
    };
    
    render(<Web3DExplorerComponent initialData={initialData} />);
    
    // Check if JSON data is displayed
    const preElement = screen.getByText(/"scene": "testScene"/);
    expect(preElement).toBeInTheDocument();
    expect(screen.getByText(/"objects": \[/)).toBeInTheDocument();
    expect(screen.getByText(/"debug": true/)).toBeInTheDocument();
  });

  test('does not display pre element when no initial data provided', () => {
    const { container } = render(<Web3DExplorerComponent />);
    
    // Check that no pre element exists
    const preElement = container.querySelector('pre');
    expect(preElement).not.toBeInTheDocument();
  });

  test('accepts all props without errors', () => {
    const mockOnExplorerReady = jest.fn();
    const mockOnPerformanceUpdate = jest.fn();
    const config = { enableDebug: true };
    const initialData = { test: 'data' };
    
    // Should not throw any errors
    expect(() => {
      render(
        <Web3DExplorerComponent
          config={config}
          initialData={initialData}
          onExplorerReady={mockOnExplorerReady}
          onPerformanceUpdate={mockOnPerformanceUpdate}
          style={{ margin: '10px' }}
          className="test-class"
        />
      );
    }).not.toThrow();
  });

  test('renders with empty config object', () => {
    const emptyConfig = {};
    
    render(<Web3DExplorerComponent config={emptyConfig} />);
    
    expect(screen.getByRole('heading', { name: /web3d explorer component/i })).toBeInTheDocument();
  });

  test('component structure matches expected DOM hierarchy', () => {
    const { container } = render(<Web3DExplorerComponent />);
    
    // Check the basic DOM structure
    const mainDiv = container.firstChild;
    expect(mainDiv).toBeInTheDocument();
    expect(mainDiv).toHaveProperty('tagName', 'DIV');
    
    const heading = screen.getByRole('heading');
    const paragraph = screen.getByText('Content goes here.');
    
    expect(heading).toBeInTheDocument();
    expect(paragraph).toBeInTheDocument();
  });
});
