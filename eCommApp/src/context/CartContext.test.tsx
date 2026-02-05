import { render, renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { CartProvider, CartContext } from './CartContext';
import { Product } from '../types';
import { useContext } from 'react';

const mockProduct: Product = {
  id: '1',
  name: 'Test Product',
  price: 29.99,
  image: 'test.jpg',
  description: 'Test description',
  inStock: true,
  reviews: []
};

const mockProduct2: Product = {
  id: '2',
  name: 'Another Product',
  price: 49.99,
  image: 'test2.jpg',
  description: 'Another test description',
  inStock: true,
  reviews: []
};

/**
 * Helper component to test context consumer
 */
const TestConsumer = ({ onRender }: { onRender: (value: any) => void }) => {
  const context = useContext(CartContext);
  onRender(context);
  return null;
};

describe('CartContext', () => {
  describe('CartProvider', () => {
    it('should provide cart context to children', () => {
      let contextValue: any;
      
      render(
        <CartProvider>
          <TestConsumer onRender={(value) => { contextValue = value; }} />
        </CartProvider>
      );

      expect(contextValue).toBeDefined();
      expect(contextValue.cartItems).toEqual([]);
      expect(typeof contextValue.addToCart).toBe('function');
      expect(typeof contextValue.clearCart).toBe('function');
    });

    it('should initialize with empty cart', () => {
      let contextValue: any;
      
      render(
        <CartProvider>
          <TestConsumer onRender={(value) => { contextValue = value; }} />
        </CartProvider>
      );

      expect(contextValue.cartItems).toEqual([]);
    });
  });

  describe('addToCart', () => {
    it('should add new product to cart', () => {
      let contextValue: any;
      
      const { rerender } = render(
        <CartProvider>
          <TestConsumer onRender={(value) => { contextValue = value; }} />
        </CartProvider>
      );

      act(() => {
        contextValue.addToCart(mockProduct);
      });

      rerender(
        <CartProvider>
          <TestConsumer onRender={(value) => { contextValue = value; }} />
        </CartProvider>
      );

      // Since CartProvider remounts, we need to test differently
      // Let's create a proper test with a custom wrapper
    });

    it('should add product with quantity 1 for new items', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <CartProvider>{children}</CartProvider>
      );

      const { result } = renderHook(
        () => useContext(CartContext),
        { wrapper }
      );

      expect(result.current?.cartItems).toEqual([]);

      act(() => {
        result.current?.addToCart(mockProduct);
      });

      expect(result.current?.cartItems).toHaveLength(1);
      expect(result.current?.cartItems[0]).toEqual({
        ...mockProduct,
        quantity: 1
      });
    });

    it('should increment quantity for existing product', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <CartProvider>{children}</CartProvider>
      );

      const { result } = renderHook(
        () => useContext(CartContext),
        { wrapper }
      );

      act(() => {
        result.current?.addToCart(mockProduct);
      });

      expect(result.current?.cartItems[0].quantity).toBe(1);

      act(() => {
        result.current?.addToCart(mockProduct);
      });

      expect(result.current?.cartItems).toHaveLength(1);
      expect(result.current?.cartItems[0].quantity).toBe(2);
    });

    it('should handle multiple different products', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <CartProvider>{children}</CartProvider>
      );

      const { result } = renderHook(
        () => useContext(CartContext),
        { wrapper }
      );

      act(() => {
        result.current?.addToCart(mockProduct);
        result.current?.addToCart(mockProduct2);
      });

      expect(result.current?.cartItems).toHaveLength(2);
      expect(result.current?.cartItems[0].id).toBe('1');
      expect(result.current?.cartItems[1].id).toBe('2');
    });

    it('should maintain other products when incrementing one', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <CartProvider>{children}</CartProvider>
      );

      const { result } = renderHook(
        () => useContext(CartContext),
        { wrapper }
      );

      act(() => {
        result.current?.addToCart(mockProduct);
        result.current?.addToCart(mockProduct2);
        result.current?.addToCart(mockProduct); // Add first product again
      });

      expect(result.current?.cartItems).toHaveLength(2);
      expect(result.current?.cartItems[0].quantity).toBe(2);
      expect(result.current?.cartItems[1].quantity).toBe(1);
    });
  });

  describe('clearCart', () => {
    it('should clear all items from cart', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <CartProvider>{children}</CartProvider>
      );

      const { result } = renderHook(
        () => useContext(CartContext),
        { wrapper }
      );

      act(() => {
        result.current?.addToCart(mockProduct);
        result.current?.addToCart(mockProduct2);
      });

      expect(result.current?.cartItems).toHaveLength(2);

      act(() => {
        result.current?.clearCart();
      });

      expect(result.current?.cartItems).toEqual([]);
    });

    it('should work on already empty cart', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <CartProvider>{children}</CartProvider>
      );

      const { result } = renderHook(
        () => useContext(CartContext),
        { wrapper }
      );

      expect(result.current?.cartItems).toEqual([]);

      act(() => {
        result.current?.clearCart();
      });

      expect(result.current?.cartItems).toEqual([]);
    });
  });
});
