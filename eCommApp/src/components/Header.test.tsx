import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Header from './Header';

/**
 * Helper to render Header with required Router context
 */
const renderHeader = () => {
  return render(
    <BrowserRouter>
      <Header />
    </BrowserRouter>
  );
};

describe('Header', () => {
  it('should render header element', () => {
    const { container } = renderHeader();
    const header = container.querySelector('header');
    expect(header).toBeInTheDocument();
  });

  it('should have correct CSS class', () => {
    const { container } = renderHeader();
    const header = container.querySelector('header');
    expect(header).toHaveClass('app-header');
  });

  it('should display site title', () => {
    renderHeader();
    expect(screen.getByRole('heading', { name: /the daily harvest/i })).toBeInTheDocument();
  });

  it('should render navigation element', () => {
    const { container } = renderHeader();
    const nav = container.querySelector('nav');
    expect(nav).toBeInTheDocument();
  });

  it('should render Home link', () => {
    renderHeader();
    const homeLink = screen.getByRole('link', { name: /home/i });
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('should render Products link', () => {
    renderHeader();
    const productsLink = screen.getByRole('link', { name: /products/i });
    expect(productsLink).toBeInTheDocument();
    expect(productsLink).toHaveAttribute('href', '/products');
  });

  it('should render Cart link', () => {
    renderHeader();
    const cartLink = screen.getByRole('link', { name: /cart/i });
    expect(cartLink).toBeInTheDocument();
    expect(cartLink).toHaveAttribute('href', '/cart');
  });

  it('should render Admin Login button', () => {
    renderHeader();
    const loginButton = screen.getByRole('button', { name: /admin login/i });
    expect(loginButton).toBeInTheDocument();
  });

  it('should wrap Admin Login button in a link', () => {
    renderHeader();
    const loginLink = screen.getByRole('link', { name: /admin login/i });
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute('href', '/login');
  });

  it('should render all navigation links', () => {
    renderHeader();
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(4); // Home, Products, Cart, Login
  });
});
