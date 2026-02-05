import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import CartPage from './CartPage';
import { CartContext, CartItem } from '../context/CartContext';

// Mock components
vi.mock('./Header', () => ({
    default: () => <div data-testid="header">Header</div>
}));

vi.mock('./Footer', () => ({
    default: () => <div data-testid="footer">Footer</div>
}));

vi.mock('./CheckoutModal', () => ({
    default: ({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) => (
        <div data-testid="checkout-modal">
            <button onClick={onConfirm} data-testid="confirm-checkout">Confirm</button>
            <button onClick={onCancel} data-testid="cancel-checkout">Cancel</button>
        </div>
    )
}));

const mockCartItems: CartItem[] = [
    {
        id: '1',
        name: 'Test Product 1',
        price: 29.99,
        quantity: 2,
        image: 'test1.jpg',
        reviews: [],
        inStock: true
    },
    {
        id: '2',
        name: 'Test Product 2',
        price: 49.99,
        quantity: 1,
        image: 'test2.jpg',
        reviews: [],
        inStock: true
    }
];

const mockCartContext = {
    cartItems: mockCartItems,
    addToCart: vi.fn(),
    clearCart: vi.fn()
};

/**
 * Renders the CartPage component wrapped in a CartContext.Provider with test data.
 * @param cartContext - Optional cart context configuration (defaults to mockCartContext)
 */
const renderWithCartContext = (cartContext = mockCartContext) => {
    return render(
        <CartContext.Provider value={cartContext}>
            <CartPage />
        </CartContext.Provider>
    );
};

/**
 * Opens the checkout modal by clicking the checkout button.
 */
const openCheckoutModal = () => {
    const checkoutButton = screen.getByRole('button', { name: /checkout/i });
    fireEvent.click(checkoutButton);
};

/**
 * Completes the checkout process by opening the modal and confirming.
 */
const completeCheckout = () => {
    openCheckoutModal();
    const confirmButton = screen.getByTestId('confirm-checkout');
    fireEvent.click(confirmButton);
};

/**
 * Creates a test cart item with default values that can be overridden.
 * @param overrides - Partial CartItem properties to customize the test item
 * @returns A complete CartItem object for testing
 */
const createTestItem = (overrides: Partial<CartItem> = {}): CartItem => ({
    id: '3',
    name: 'Test Product',
    price: 10.00,
    quantity: 1,
    image: 'test3.jpg',
    reviews: [],
    inStock: true,
    ...overrides
});

describe('CartPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Basic Rendering', () => {
        it('renders header component', () => {
            renderWithCartContext();
            
            const header = screen.getByTestId('header');
            
            expect(header).toBeInTheDocument();
            expect(header).toHaveTextContent('Header');
        });

        it('renders footer component', () => {
            renderWithCartContext();
            
            const footer = screen.getByTestId('footer');
            
            expect(footer).toBeInTheDocument();
            expect(footer).toHaveTextContent('Footer');
        });

        it('displays cart heading', () => {
            renderWithCartContext();
            
            expect(screen.getByRole('heading', { name: 'Your Cart', level: 2 })).toBeInTheDocument();
        });

        it('displays first product details', () => {
            renderWithCartContext();
            
            expect(screen.getByRole('heading', { name: 'Test Product 1', level: 3 })).toBeInTheDocument();
            expect(screen.getByText('Price: $29.99')).toBeInTheDocument();
            expect(screen.getByText('Quantity: 2')).toBeInTheDocument();
        });

        it('displays second product details', () => {
            renderWithCartContext();
            
            expect(screen.getByRole('heading', { name: 'Test Product 2', level: 3 })).toBeInTheDocument();
            expect(screen.getByText('Price: $49.99')).toBeInTheDocument();
            expect(screen.getByText('Quantity: 1')).toBeInTheDocument();
        });

        it('renders correct number of product images', () => {
            renderWithCartContext();
            
            const cartItems = screen.getAllByRole('img');
            expect(cartItems).toHaveLength(mockCartItems.length);
        });

        it('displays empty cart message when cart is empty', () => {
            renderWithCartContext({ ...mockCartContext, cartItems: [] });
            
            expect(screen.getByText('Your cart is empty.')).toBeInTheDocument();
            expect(screen.queryByRole('img')).not.toBeInTheDocument();
        });
    });

    describe('Image Rendering', () => {
        it('renders product 1 image with correct src', () => {
            renderWithCartContext();
            
            const product1Image = screen.getByAltText('Test Product 1');
            expect(product1Image).toHaveAttribute('src', 'products/productImages/test1.jpg');
        });

        it('renders product 2 image with correct src', () => {
            renderWithCartContext();
            
            const product2Image = screen.getByAltText('Test Product 2');
            expect(product2Image).toHaveAttribute('src', 'products/productImages/test2.jpg');
        });

        it('applies cart-item-image CSS class to images', () => {
            renderWithCartContext();
            
            const images = screen.getAllByRole('img');
            images.forEach(img => {
                expect(img).toHaveClass('cart-item-image');
            });
        });

        it('renders images for all cart items', () => {
            renderWithCartContext();
            
            const images = screen.getAllByRole('img');
            expect(images).toHaveLength(2);
            
            mockCartItems.forEach((item, index) => {
                expect(images[index]).toHaveAttribute('alt', item.name);
                expect(images[index]).toHaveAttribute('src', `products/productImages/${item.image}`);
            });
        });
    });

    describe('Checkout Button', () => {
        it('displays when cart has items', () => {
            renderWithCartContext();
            
            const checkoutButton = screen.getByRole('button', { name: /checkout/i });
            expect(checkoutButton).toBeInTheDocument();
        });

        it('has correct CSS class', () => {
            renderWithCartContext();
            
            const checkoutButton = screen.getByRole('button', { name: /checkout/i });
            expect(checkoutButton).toHaveClass('checkout-btn');
        });

        it('is enabled when cart has items', () => {
            renderWithCartContext();
            
            const checkoutButton = screen.getByRole('button', { name: /checkout/i });
            expect(checkoutButton).toBeEnabled();
        });

        it('does not display when cart is empty', () => {
            renderWithCartContext({ ...mockCartContext, cartItems: [] });
            
            expect(screen.queryByRole('button', { name: /checkout/i })).not.toBeInTheDocument();
        });
    });

    describe('Checkout Modal', () => {
        it('does not show initially', () => {
            renderWithCartContext();
            
            expect(screen.queryByTestId('checkout-modal')).not.toBeInTheDocument();
        });

        it('shows modal when checkout is clicked', () => {
            renderWithCartContext();
            
            openCheckoutModal();
            
            expect(screen.getByTestId('checkout-modal')).toBeInTheDocument();
        });

        it('displays confirm button in modal', () => {
            renderWithCartContext();
            
            openCheckoutModal();
            
            const confirmButton = screen.getByTestId('confirm-checkout');
            expect(confirmButton).toBeInTheDocument();
            expect(confirmButton).toHaveTextContent('Confirm');
        });

        it('displays cancel button in modal', () => {
            renderWithCartContext();
            
            openCheckoutModal();
            
            const cancelButton = screen.getByTestId('cancel-checkout');
            expect(cancelButton).toBeInTheDocument();
            expect(cancelButton).toHaveTextContent('Cancel');
        });

        it('closes modal when cancel button is clicked', () => {
            renderWithCartContext();
            
            // Arrange
            openCheckoutModal();
            expect(screen.getByTestId('checkout-modal')).toBeInTheDocument();
            
            // Act
            const cancelButton = screen.getByTestId('cancel-checkout');
            fireEvent.click(cancelButton);
            
            // Assert
            expect(screen.queryByTestId('checkout-modal')).not.toBeInTheDocument();
        });

        it('does not call clearCart when cancel is clicked', () => {
            renderWithCartContext();
            
            // Arrange
            openCheckoutModal();
            
            // Act
            fireEvent.click(screen.getByTestId('cancel-checkout'));
            
            // Assert
            expect(mockCartContext.clearCart).not.toHaveBeenCalled();
        });

        it('keeps cart items visible after canceling', () => {
            renderWithCartContext();
            
            // Arrange
            openCheckoutModal();
            
            // Act
            fireEvent.click(screen.getByTestId('cancel-checkout'));
            
            // Assert
            expect(screen.getByRole('heading', { name: 'Test Product 1', level: 3 })).toBeInTheDocument();
            expect(screen.getByRole('heading', { name: 'Test Product 2', level: 3 })).toBeInTheDocument();
        });

        it('allows reopening after canceling', () => {
            renderWithCartContext();
            
            // Arrange - First open and cancel
            openCheckoutModal();
            fireEvent.click(screen.getByTestId('cancel-checkout'));
            expect(screen.queryByTestId('checkout-modal')).not.toBeInTheDocument();
            
            // Act - Reopen
            openCheckoutModal();
            
            // Assert
            expect(screen.getByTestId('checkout-modal')).toBeInTheDocument();
        });
    });

    describe('Checkout Process', () => {
        it('calls clearCart when checkout is confirmed', () => {
            renderWithCartContext();
            
            // Act
            completeCheckout();
            
            // Assert
            expect(mockCartContext.clearCart).toHaveBeenCalledTimes(1);
        });

        it('displays order processed message after checkout', () => {
            renderWithCartContext();
            
            // Act
            completeCheckout();
            
            // Assert
            expect(screen.getByRole('heading', { name: 'Your order has been processed!', level: 2 })).toBeInTheDocument();
        });

        it('closes modal after successful checkout', () => {
            renderWithCartContext();
            
            // Act
            completeCheckout();
            
            // Assert
            expect(screen.queryByTestId('checkout-modal')).not.toBeInTheDocument();
        });

        it('displays processed items after checkout', () => {
            renderWithCartContext();
            
            // Act
            completeCheckout();
            
            // Assert
            expect(screen.getByRole('heading', { name: 'Test Product 1', level: 3 })).toBeInTheDocument();
            expect(screen.getByRole('heading', { name: 'Test Product 2', level: 3 })).toBeInTheDocument();
        });

        it('preserves item quantities in order summary', () => {
            renderWithCartContext();
            
            // Act
            completeCheckout();
            
            // Assert
            expect(screen.getByText('Quantity: 2')).toBeInTheDocument();
            expect(screen.getByText('Quantity: 1')).toBeInTheDocument();
        });

        it('preserves item prices in order summary', () => {
            renderWithCartContext();
            
            // Act
            completeCheckout();
            
            // Assert
            expect(screen.getByText('Price: $29.99')).toBeInTheDocument();
            expect(screen.getByText('Price: $49.99')).toBeInTheDocument();
        });

        it('does not show checkout button in order processed state', () => {
            renderWithCartContext();
            
            // Act
            completeCheckout();
            
            // Assert
            expect(screen.queryByRole('button', { name: /checkout/i })).not.toBeInTheDocument();
        });
    });

    describe('Edge Cases', () => {
        it('handles single item in cart', () => {
            const singleItemContext = {
                ...mockCartContext,
                cartItems: [mockCartItems[0]]
            };
            renderWithCartContext(singleItemContext);
            
            expect(screen.getByRole('heading', { name: 'Test Product 1', level: 3 })).toBeInTheDocument();
            expect(screen.queryByRole('heading', { name: 'Test Product 2', level: 3 })).not.toBeInTheDocument();
            expect(screen.getAllByRole('img')).toHaveLength(1);
        });

        describe('Quantity Variations', () => {
            it.each([
                { quantity: 0, description: 'zero quantity' },
                { quantity: 1, description: 'single quantity' },
                { quantity: 100, description: 'medium quantity' },
                { quantity: 1000, description: 'large quantity' },
                { quantity: 9999, description: 'very large quantity' }
            ])('handles item with $description ($quantity)', ({ quantity }) => {
                const item = createTestItem({ quantity, id: `qty-${quantity}` });
                renderWithCartContext({ ...mockCartContext, cartItems: [item] });
                
                expect(screen.getByText(`Quantity: ${quantity}`)).toBeInTheDocument();
            });
        });

        describe('Price Formatting', () => {
            it.each([
                { price: 0, expected: '$0.00', description: 'zero price' },
                { price: 0.01, expected: '$0.01', description: 'one cent' },
                { price: 9.99, expected: '$9.99', description: 'single digit dollar' },
                { price: 10.00, expected: '$10.00', description: 'round number' },
                { price: 12.345, expected: '$12.35', description: 'decimal price (rounds up)' },
                { price: 12.344, expected: '$12.34', description: 'decimal price (rounds down)' },
                { price: 99.99, expected: '$99.99', description: 'double digit dollar' },
                { price: 100.00, expected: '$100.00', description: 'triple digit dollar' },
                { price: 999.99, expected: '$999.99', description: 'large price' }
            ])('formats $description correctly ($price -> $expected)', ({ price, expected }) => {
                const item = createTestItem({ price, id: `price-${price}` });
                renderWithCartContext({ ...mockCartContext, cartItems: [item] });
                
                expect(screen.getByText(`Price: ${expected}`)).toBeInTheDocument();
            });
        });

        describe('Product Name Variations', () => {
            it.each([
                {
                    name: 'Short Name',
                    description: 'short product name'
                },
                {
                    name: 'This is a very long product name that might cause layout issues in the cart page display',
                    description: 'very long product name'
                },
                {
                    name: 'Product & Co. <Special> "Quotes"',
                    description: 'special characters (&, <, >, ")'
                },
                {
                    name: 'Product with emojis',
                    description: 'emojis'
                },
                {
                    name: 'Français Español',
                    description: 'international characters'
                },
                {
                    name: 'Product with newlines',
                    description: 'newline characters'
                },
                {
                    name: 'Product with spaces',
                    description: 'leading/trailing spaces'
                }
            ])('handles product name with $description', ({ name }) => {
                const item = createTestItem({ name, id: `name-${name.substring(0, 20)}` });
                renderWithCartContext({ ...mockCartContext, cartItems: [item] });
                
                expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
                expect(screen.getByAltText(name)).toBeInTheDocument();
            });
        });

        describe('Cart Size Variations', () => {
            it.each([
                { count: 1, description: 'single item' },
                { count: 5, description: 'few items' },
                { count: 10, description: 'ten items' },
                { count: 25, description: 'moderate items' },
                { count: 50, description: 'many items' },
                { count: 100, description: 'very many items' }
            ])('handles cart with $description ($count)', ({ count }) => {
                const items: CartItem[] = Array.from({ length: count }, (_, i) => ({
                    id: `item-${i}`,
                    name: `Product ${i}`,
                    price: 10.00 + i * 0.5,
                    quantity: 1,
                    image: `test${i}.jpg`,
                    reviews: [],
                    inStock: true
                }));
                renderWithCartContext({ ...mockCartContext, cartItems: items });
                
                expect(screen.getAllByRole('img')).toHaveLength(count);
                expect(screen.getByRole('heading', { name: 'Product 0', level: 3 })).toBeInTheDocument();
                expect(screen.getByRole('heading', { name: `Product ${count - 1}`, level: 3 })).toBeInTheDocument();
            });
        });

        describe('Combined Edge Cases', () => {
            it('handles item with all edge case properties combined', () => {
                const extremeItem = createTestItem({
                    id: '999',
                    name: 'Extreme Product & Co. <Special> "Quotes" with very long name that exceeds normal limits',
                    price: 9999.999,
                    quantity: 9999,
                    image: 'extreme-product.jpg'
                });
                renderWithCartContext({ ...mockCartContext, cartItems: [extremeItem] });
                
                expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(extremeItem.name);
                expect(screen.getByText('Price: $10000.00')).toBeInTheDocument();
                expect(screen.getByText('Quantity: 9999')).toBeInTheDocument();
                expect(screen.getByAltText(extremeItem.name)).toHaveAttribute('src', 'products/productImages/extreme-product.jpg');
            });
        });
    });

    describe('Context Error Handling', () => {
        it('throws error when CartContext is not provided', () => {
            const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
            
            expect(() => render(<CartPage />)).toThrow('CartContext must be used within a CartProvider');
            
            consoleError.mockRestore();
        });
    });
});
