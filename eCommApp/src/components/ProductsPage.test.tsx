import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import ProductsPage from './ProductsPage';
import { CartContext } from '../context/CartContext';
import { Product } from '../types';

// Mock child components
vi.mock('./Header', () => ({
  default: () => <div data-testid="header">Header</div>
}));

vi.mock('./Footer', () => ({
  default: () => <div data-testid="footer">Footer</div>
}));

vi.mock('./ReviewModal', () => ({
  default: ({ product, onClose, onSubmit }: any) => 
    product ? (
      <div data-testid="review-modal">
        <span>Review Modal for {product.name}</span>
        <button onClick={onClose}>Close Modal</button>
        <button onClick={() => onSubmit({ author: 'Test', comment: 'Great!', date: new Date().toISOString() })}>
          Submit Review
        </button>
      </div>
    ) : null
}));

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Apple',
    price: 2.99,
    image: 'apple.jpg',
    description: 'Fresh apples',
    inStock: true,
    reviews: []
  },
  {
    id: '2',
    name: 'Grapes',
    price: 4.99,
    image: 'grapes.jpg',
    description: 'Sweet grapes',
    inStock: false,
    reviews: [{ author: 'John', comment: 'Tasty', date: '2025-01-01' }]
  }
];

const mockAddToCart = vi.fn();
const mockCartContext = {
  cartItems: [],
  addToCart: mockAddToCart,
  clearCart: vi.fn()
};

/**
 * Helper to render ProductsPage with required contexts
 */
const renderProductsPage = (cartContext = mockCartContext) => {
  return render(
    <BrowserRouter>
      <CartContext.Provider value={cartContext}>
        <ProductsPage />
      </CartContext.Provider>
    </BrowserRouter>
  );
};

describe('ProductsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.fetch = vi.fn() as any;
  });

  describe('Context Requirements', () => {
    it('should throw error when CartContext is not provided', () => {
      // Suppress error output for this test
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        render(
          <BrowserRouter>
            <ProductsPage />
          </BrowserRouter>
        );
      }).toThrow('CartContext must be used within a CartProvider');
      
      spy.mockRestore();
    });
  });

  describe('Loading State', () => {
    it('should show loading message initially', () => {
      (globalThis.fetch as any).mockImplementation(() => new Promise(() => {})); // Never resolves
      
      renderProductsPage();
      
      expect(screen.getByText(/loading products/i)).toBeInTheDocument();
    });

    it('should render header and footer during loading', () => {
      (globalThis.fetch as any).mockImplementation(() => new Promise(() => {}));
      
      renderProductsPage();
      
      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByTestId('footer')).toBeInTheDocument();
    });

    it('should have loading div with correct class', () => {
      (globalThis.fetch as any).mockImplementation(() => new Promise(() => {}));
      
      const { container } = renderProductsPage();
      const loadingDiv = container.querySelector('.loading');
      
      expect(loadingDiv).toBeInTheDocument();
      expect(loadingDiv?.textContent).toBe('Loading products...');
    });
  });

  describe('Product Loading', () => {
    it('should fetch products from all JSON files', async () => {
      (globalThis.fetch as any).mockImplementation((url: string) =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockProducts.find(p => url.includes(p.name.toLowerCase())) || mockProducts[0])
        })
      );

      renderProductsPage();

      await waitFor(() => {
        expect(globalThis.fetch).toHaveBeenCalledWith('products/apple.json');
        expect(globalThis.fetch).toHaveBeenCalledWith('products/grapes.json');
        expect(globalThis.fetch).toHaveBeenCalledWith('products/orange.json');
        expect(globalThis.fetch).toHaveBeenCalledWith('products/pear.json');
      });
    });

    it('should display products after loading', async () => {
      (globalThis.fetch as any).mockImplementation((url: string) =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockProducts.find(p => url.includes(p.name.toLowerCase())) || mockProducts[0])
        })
      );

      renderProductsPage();

      await waitFor(() => {
        expect(screen.getAllByText('Apple').length).toBeGreaterThan(0);
      });
    });

    it('should handle fetch errors gracefully', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      (globalThis.fetch as any).mockRejectedValue(new Error('Fetch failed'));

      renderProductsPage();

      await waitFor(() => {
        expect(consoleError).toHaveBeenCalledWith(
          'Error loading products:',
          expect.any(Error)
        );
      });

      consoleError.mockRestore();
    });

    it('should handle failed response status', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      (globalThis.fetch as any).mockResolvedValue({
        ok: false
      });

      renderProductsPage();

      await waitFor(() => {
        expect(consoleError).toHaveBeenCalled();
      });

      consoleError.mockRestore();
    });
  });

  describe('Product Display', () => {
    beforeEach(async () => {
      (globalThis.fetch as any).mockImplementation((url: string) => {
        const product = mockProducts.find(p => url.includes(p.name.toLowerCase())) || mockProducts[0];
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(product)
        });
      });
    });

    it('should display "Our Products" heading', async () => {
      renderProductsPage();

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /our products/i })).toBeInTheDocument();
      });
    });

    it('should render products grid', async () => {
      const { container } = renderProductsPage();

      await waitFor(() => {
        expect(container.querySelector('.products-grid')).toBeInTheDocument();
      });
    });

    it('should render product cards', async () => {
      const { container } = renderProductsPage();

      await waitFor(() => {
        const cards = container.querySelectorAll('.product-card');
        expect(cards.length).toBeGreaterThan(0);
      });
    });

    it('should display product images', async () => {
      renderProductsPage();

      await waitFor(() => {
        const images = screen.getAllByAltText('Apple');
        expect(images.length).toBeGreaterThan(0);
        expect(images[0]).toHaveAttribute('src', expect.stringContaining('apple.jpg'));
      });
    });

    it('should display product names', async () => {
      renderProductsPage();

      await waitFor(() => {
        expect(screen.getAllByText('Apple').length).toBeGreaterThan(0);
      });
    });

    it('should display product prices formatted', async () => {
      renderProductsPage();

      await waitFor(() => {
        expect(screen.getAllByText('$2.99').length).toBeGreaterThan(0);
      });
    });

    it('should display product descriptions when available', async () => {
      renderProductsPage();

      await waitFor(() => {
        expect(screen.getAllByText('Fresh apples').length).toBeGreaterThan(0);
      });
    });
  });

  describe('Add to Cart', () => {
    beforeEach(async () => {
      (globalThis.fetch as any).mockImplementation((url: string) => {
        const product = mockProducts.find(p => url.includes(p.name.toLowerCase())) || mockProducts[0];
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(product)
        });
      });
    });

    it('should show "Add to Cart" for in-stock products', async () => {
      renderProductsPage();

      await waitFor(() => {
        const buttons = screen.getAllByRole('button', { name: /add to cart/i });
        expect(buttons.length).toBeGreaterThan(0);
      });
    });

    it('should show "Out of Stock" for unavailable products', async () => {
      renderProductsPage();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /out of stock/i })).toBeInTheDocument();
      });
    });

    it('should call addToCart when button is clicked', async () => {
      renderProductsPage();

      await waitFor(() => {
        const addButton = screen.getAllByRole('button', { name: /add to cart/i })[0];
        fireEvent.click(addButton);
        expect(mockAddToCart).toHaveBeenCalledTimes(1);
      });
    });

    it('should disable button for out of stock products', async () => {
      renderProductsPage();

      await waitFor(() => {
        const outOfStockButton = screen.getByRole('button', { name: /out of stock/i });
        expect(outOfStockButton).toBeDisabled();
      });
    });

    it('should add disabled class to out of stock buttons', async () => {
      renderProductsPage();

      await waitFor(() => {
        const outOfStockButton = screen.getByRole('button', { name: /out of stock/i });
        expect(outOfStockButton).toHaveClass('disabled');
      });
    });
  });

  describe('Review Modal', () => {
    beforeEach(async () => {
      (globalThis.fetch as any).mockImplementation((url: string) => {
        const product = mockProducts.find(p => url.includes(p.name.toLowerCase())) || mockProducts[0];
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(product)
        });
      });
    });

    it('should not show review modal initially', async () => {
      renderProductsPage();

      await waitFor(() => {
        expect(screen.queryByTestId('review-modal')).not.toBeInTheDocument();
      });
    });

    it('should open review modal when product image is clicked', async () => {
      renderProductsPage();

      await waitFor(() => {
        const images = screen.getAllByAltText('Apple');
        fireEvent.click(images[0]);
      });

      expect(screen.getByTestId('review-modal')).toBeInTheDocument();
    });

    it('should close review modal when close is clicked', async () => {
      renderProductsPage();

      await waitFor(() => {
        const images = screen.getAllByAltText('Apple');
        fireEvent.click(images[0]);
      });

      const closeButton = screen.getByRole('button', { name: /close modal/i });
      fireEvent.click(closeButton);

      expect(screen.queryByTestId('review-modal')).not.toBeInTheDocument();
    });

    it('should update product reviews when review is submitted', async () => {
      renderProductsPage();

      await waitFor(() => {
        const images = screen.getAllByAltText('Apple');
        fireEvent.click(images[0]);
      });

      const submitButton = screen.getByRole('button', { name: /submit review/i });
      fireEvent.click(submitButton);

      // Modal should still be open with updated product
      expect(screen.getByTestId('review-modal')).toBeInTheDocument();
    });
  });

  describe('Component Structure', () => {
    beforeEach(async () => {
      (globalThis.fetch as any).mockImplementation((url: string) => {
        const product = mockProducts.find(p => url.includes(p.name.toLowerCase())) || mockProducts[0];
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(product)
        });
      });
    });

    it('should render main content area', async () => {
      const { container } = renderProductsPage();

      await waitFor(() => {
        expect(container.querySelector('main.main-content')).toBeTruthy();
      });
    });
  });
});
