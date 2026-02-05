import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Footer from './Footer';

describe('Footer', () => {
  it('should render footer element', () => {
    const { container } = render(<Footer />);
    const footer = container.querySelector('footer');
    expect(footer).toBeInTheDocument();
  });

  it('should have correct CSS class', () => {
    const { container } = render(<Footer />);
    const footer = container.querySelector('footer');
    expect(footer).toHaveClass('app-footer');
  });

  it('should display copyright text', () => {
    render(<Footer />);
    expect(screen.getByText(/© 2025 The Daily Harvest. All rights reserved./i)).toBeInTheDocument();
  });

  it('should render copyright text in a paragraph', () => {
    const { container } = render(<Footer />);
    const paragraph = container.querySelector('p');
    expect(paragraph).toBeInTheDocument();
    expect(paragraph?.textContent).toContain('© 2025 The Daily Harvest');
  });
});
