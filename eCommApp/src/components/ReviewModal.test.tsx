import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import ReviewModal from './ReviewModal';
import { Product } from '../types';

const mockProduct: Product = {
  id: '1',
  name: 'Test Product',
  price: 29.99,
  image: 'test.jpg',
  description: 'Test description',
  inStock: true,
  reviews: [
    {
      author: 'John Doe',
      comment: 'Great product!',
      date: '2025-01-01T00:00:00.000Z'
    },
    {
      author: 'Jane Smith',
      comment: 'Excellent quality',
      date: '2025-01-02T00:00:00.000Z'
    }
  ]
};

const mockProductNoReviews: Product = {
  ...mockProduct,
  reviews: []
};

describe('ReviewModal', () => {
  const mockOnClose = vi.fn();
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render null when product is null', () => {
      const { container } = render(
        <ReviewModal product={null} onClose={mockOnClose} onSubmit={mockOnSubmit} />
      );
      expect(container.firstChild).toBeNull();
    });

    it('should render modal when product is provided', () => {
      const { container } = render(
        <ReviewModal product={mockProduct} onClose={mockOnClose} onSubmit={mockOnSubmit} />
      );
      const backdrop = container.querySelector('.modal-backdrop');
      expect(backdrop).toBeInTheDocument();
    });

    it('should display product name in heading', () => {
      render(<ReviewModal product={mockProduct} onClose={mockOnClose} onSubmit={mockOnSubmit} />);
      expect(screen.getByRole('heading', { name: /reviews for test product/i })).toBeInTheDocument();
    });

    it('should render modal content container', () => {
      const { container } = render(
        <ReviewModal product={mockProduct} onClose={mockOnClose} onSubmit={mockOnSubmit} />
      );
      expect(container.querySelector('.modal-content')).toBeInTheDocument();
    });

    it('should render reviews list container', () => {
      const { container } = render(
        <ReviewModal product={mockProduct} onClose={mockOnClose} onSubmit={mockOnSubmit} />
      );
      expect(container.querySelector('.reviews-list')).toBeInTheDocument();
    });
  });

  describe('Existing Reviews Display', () => {
    it('should display all existing reviews', () => {
      render(<ReviewModal product={mockProduct} onClose={mockOnClose} onSubmit={mockOnSubmit} />);
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('should display review comments', () => {
      render(<ReviewModal product={mockProduct} onClose={mockOnClose} onSubmit={mockOnSubmit} />);
      expect(screen.getByText('Great product!')).toBeInTheDocument();
      expect(screen.getByText('Excellent quality')).toBeInTheDocument();
    });

    it('should display "No reviews yet" when product has no reviews', () => {
      render(<ReviewModal product={mockProductNoReviews} onClose={mockOnClose} onSubmit={mockOnSubmit} />);
      expect(screen.getByText(/no reviews yet/i)).toBeInTheDocument();
    });

    it('should format review dates', () => {
      render(<ReviewModal product={mockProduct} onClose={mockOnClose} onSubmit={mockOnSubmit} />);
      // Date formatting will depend on locale, so just check it's present
      expect(screen.getByText(/1\/1\/2025|2025-01-01/i)).toBeInTheDocument();
    });

    it('should render reviews with correct CSS class', () => {
      const { container } = render(
        <ReviewModal product={mockProduct} onClose={mockOnClose} onSubmit={mockOnSubmit} />
      );
      const reviews = container.querySelectorAll('.review');
      expect(reviews).toHaveLength(2);
    });
  });

  describe('Review Form', () => {
    it('should render review form', () => {
      const { container } = render(
        <ReviewModal product={mockProduct} onClose={mockOnClose} onSubmit={mockOnSubmit} />
      );
      expect(container.querySelector('.review-form')).toBeInTheDocument();
    });

    it('should display "Leave a Review" heading', () => {
      render(<ReviewModal product={mockProduct} onClose={mockOnClose} onSubmit={mockOnSubmit} />);
      expect(screen.getByRole('heading', { name: /leave a review/i })).toBeInTheDocument();
    });

    it('should render author name input', () => {
      render(<ReviewModal product={mockProduct} onClose={mockOnClose} onSubmit={mockOnSubmit} />);
      const nameInput = screen.getByPlaceholderText(/your name/i);
      expect(nameInput).toBeInTheDocument();
      expect(nameInput).toHaveAttribute('required');
    });

    it('should render comment textarea', () => {
      render(<ReviewModal product={mockProduct} onClose={mockOnClose} onSubmit={mockOnSubmit} />);
      const commentTextarea = screen.getByPlaceholderText(/your review/i);
      expect(commentTextarea).toBeInTheDocument();
      expect(commentTextarea).toHaveAttribute('required');
    });

    it('should render submit button', () => {
      render(<ReviewModal product={mockProduct} onClose={mockOnClose} onSubmit={mockOnSubmit} />);
      expect(screen.getByRole('button', { name: /^submit$/i })).toBeInTheDocument();
    });

    it('should call onSubmit with review data when form is submitted', () => {
      render(<ReviewModal product={mockProduct} onClose={mockOnClose} onSubmit={mockOnSubmit} />);
      
      const nameInput = screen.getByPlaceholderText(/your name/i);
      const commentTextarea = screen.getByPlaceholderText(/your review/i);
      const submitButton = screen.getByRole('button', { name: /^submit$/i });

      fireEvent.change(nameInput, { target: { value: 'Test Author' } });
      fireEvent.change(commentTextarea, { target: { value: 'Test comment' } });
      fireEvent.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      const submittedReview = mockOnSubmit.mock.calls[0][0];
      expect(submittedReview.author).toBe('Test Author');
      expect(submittedReview.comment).toBe('Test comment');
      expect(submittedReview.date).toBeDefined();
    });

    it('should include ISO date string in submitted review', () => {
      render(<ReviewModal product={mockProduct} onClose={mockOnClose} onSubmit={mockOnSubmit} />);
      
      const nameInput = screen.getByPlaceholderText(/your name/i);
      const commentTextarea = screen.getByPlaceholderText(/your review/i);
      const submitButton = screen.getByRole('button', { name: /^submit$/i });

      fireEvent.change(nameInput, { target: { value: 'Test' } });
      fireEvent.change(commentTextarea, { target: { value: 'Comment' } });
      fireEvent.click(submitButton);

      const submittedReview = mockOnSubmit.mock.calls[0][0];
      // Check that date is a valid ISO string
      expect(new Date(submittedReview.date).toISOString()).toBe(submittedReview.date);
    });
  });

  describe('Modal Interactions', () => {
    it('should render close button', () => {
      render(<ReviewModal product={mockProduct} onClose={mockOnClose} onSubmit={mockOnSubmit} />);
      expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
    });

    it('should have close-button class on close button', () => {
      render(<ReviewModal product={mockProduct} onClose={mockOnClose} onSubmit={mockOnSubmit} />);
      const closeButton = screen.getByRole('button', { name: /close/i });
      expect(closeButton).toHaveClass('close-button');
    });

    it('should call onClose when close button is clicked', () => {
      render(<ReviewModal product={mockProduct} onClose={mockOnClose} onSubmit={mockOnSubmit} />);
      const closeButton = screen.getByRole('button', { name: /close/i });
      fireEvent.click(closeButton);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when backdrop is clicked', () => {
      const { container } = render(
        <ReviewModal product={mockProduct} onClose={mockOnClose} onSubmit={mockOnSubmit} />
      );
      const backdrop = container.querySelector('.modal-backdrop');
      if (backdrop) {
        fireEvent.click(backdrop);
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      }
    });

    it('should not close when modal content is clicked', () => {
      const { container } = render(
        <ReviewModal product={mockProduct} onClose={mockOnClose} onSubmit={mockOnSubmit} />
      );
      const content = container.querySelector('.modal-content');
      if (content) {
        fireEvent.click(content);
        expect(mockOnClose).not.toHaveBeenCalled();
      }
    });
  });
});
