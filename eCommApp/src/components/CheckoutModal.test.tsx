import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import CheckoutModal from './CheckoutModal';

describe('CheckoutModal', () => {
  const mockOnConfirm = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render modal with backdrop', () => {
    const { container } = render(
      <CheckoutModal onConfirm={mockOnConfirm} onCancel={mockOnCancel} />
    );
    const backdrop = container.querySelector('.modal-backdrop');
    expect(backdrop).toBeInTheDocument();
  });

  it('should render modal content', () => {
    const { container } = render(
      <CheckoutModal onConfirm={mockOnConfirm} onCancel={mockOnCancel} />
    );
    const content = container.querySelector('.modal-content');
    expect(content).toBeInTheDocument();
  });

  it('should display confirmation heading', () => {
    render(<CheckoutModal onConfirm={mockOnConfirm} onCancel={mockOnCancel} />);
    expect(screen.getByRole('heading', { name: /are you sure/i })).toBeInTheDocument();
  });

  it('should display confirmation message', () => {
    render(<CheckoutModal onConfirm={mockOnConfirm} onCancel={mockOnCancel} />);
    expect(screen.getByText(/do you want to proceed with the checkout/i)).toBeInTheDocument();
  });

  it('should render Continue Checkout button', () => {
    render(<CheckoutModal onConfirm={mockOnConfirm} onCancel={mockOnCancel} />);
    expect(screen.getByRole('button', { name: /continue checkout/i })).toBeInTheDocument();
  });

  it('should render Return to cart button', () => {
    render(<CheckoutModal onConfirm={mockOnConfirm} onCancel={mockOnCancel} />);
    expect(screen.getByRole('button', { name: /return to cart/i })).toBeInTheDocument();
  });

  it('should call onConfirm when Continue Checkout is clicked', () => {
    render(<CheckoutModal onConfirm={mockOnConfirm} onCancel={mockOnCancel} />);
    const confirmButton = screen.getByRole('button', { name: /continue checkout/i });
    fireEvent.click(confirmButton);
    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    expect(mockOnCancel).not.toHaveBeenCalled();
  });

  it('should call onCancel when Return to cart is clicked', () => {
    render(<CheckoutModal onConfirm={mockOnConfirm} onCancel={mockOnCancel} />);
    const cancelButton = screen.getByRole('button', { name: /return to cart/i });
    fireEvent.click(cancelButton);
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });

  it('should have cancel-btn class on cancel button', () => {
    render(<CheckoutModal onConfirm={mockOnConfirm} onCancel={mockOnCancel} />);
    const cancelButton = screen.getByRole('button', { name: /return to cart/i });
    expect(cancelButton).toHaveClass('cancel-btn');
  });

  it('should render action buttons container', () => {
    const { container } = render(
      <CheckoutModal onConfirm={mockOnConfirm} onCancel={mockOnCancel} />
    );
    const actionsDiv = container.querySelector('.checkout-modal-actions');
    expect(actionsDiv).toBeInTheDocument();
  });

  it('should allow multiple confirm clicks', () => {
    render(<CheckoutModal onConfirm={mockOnConfirm} onCancel={mockOnCancel} />);
    const confirmButton = screen.getByRole('button', { name: /continue checkout/i });
    
    fireEvent.click(confirmButton);
    fireEvent.click(confirmButton);
    fireEvent.click(confirmButton);
    
    expect(mockOnConfirm).toHaveBeenCalledTimes(3);
  });
});
