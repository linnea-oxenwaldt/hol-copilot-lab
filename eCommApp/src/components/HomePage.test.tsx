import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import HomePage from './HomePage';

// Mock child components
vi.mock('./Header', () => ({
  default: () => <div data-testid="header">Header</div>
}));

vi.mock('./Footer', () => ({
  default: () => <div data-testid="footer">Footer</div>
}));

/**
 * Helper to render HomePage with required Router context
 */
const renderHomePage = () => {
  return render(
    <BrowserRouter>
      <HomePage />
    </BrowserRouter>
  );
};

describe('HomePage', () => {
  it('should render the page container', () => {
    const { container } = renderHomePage();
    const appDiv = container.querySelector('.app');
    expect(appDiv).toBeInTheDocument();
  });

  it('should render Header component', () => {
    renderHomePage();
    expect(screen.getByTestId('header')).toBeInTheDocument();
  });

  it('should render Footer component', () => {
    renderHomePage();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('should render main content area', () => {
    const { container } = renderHomePage();
    const main = container.querySelector('main');
    expect(main).toBeInTheDocument();
    expect(main).toHaveClass('main-content');
  });

  it('should display welcome heading', () => {
    renderHomePage();
    expect(screen.getByRole('heading', { name: /welcome to the the daily harvest/i })).toBeInTheDocument();
  });

  it('should display products page message', () => {
    renderHomePage();
    expect(screen.getByText(/check out our products page for some great deals/i)).toBeInTheDocument();
  });

  it('should wrap welcome text in paragraph', () => {
    const { container } = renderHomePage();
    const paragraphs = container.querySelectorAll('p');
    expect(paragraphs.length).toBeGreaterThanOrEqual(2);
  });

  it('should render components in correct order', () => {
    const { container } = renderHomePage();
    const appDiv = container.querySelector('.app');
    const children = appDiv?.children;
    
    expect(children?.[0]).toHaveAttribute('data-testid', 'header');
    expect(children?.[1].tagName).toBe('MAIN');
    expect(children?.[2]).toHaveAttribute('data-testid', 'footer');
  });
});
