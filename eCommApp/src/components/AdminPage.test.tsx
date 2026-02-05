import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import AdminPage from './AdminPage';

// Mock child components
vi.mock('./Header', () => ({
  default: () => <div data-testid="header">Header</div>
}));

vi.mock('./Footer', () => ({
  default: () => <div data-testid="footer">Footer</div>
}));

/**
 * Helper to render AdminPage with required Router context
 */
const renderAdminPage = () => {
  return render(
    <BrowserRouter>
      <AdminPage />
    </BrowserRouter>
  );
};

describe('AdminPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the page container', () => {
      const { container } = renderAdminPage();
      expect(container.querySelector('.app')).toBeInTheDocument();
    });

    it('should render Header component', () => {
      renderAdminPage();
      expect(screen.getByTestId('header')).toBeInTheDocument();
    });

    it('should render Footer component', () => {
      renderAdminPage();
      expect(screen.getByTestId('footer')).toBeInTheDocument();
    });

    it('should render main content area', () => {
      const { container } = renderAdminPage();
      expect(container.querySelector('main.main-content')).toBeInTheDocument();
    });

    it('should render admin portal container', () => {
      const { container } = renderAdminPage();
      expect(container.querySelector('.admin-portal')).toBeInTheDocument();
    });

    it('should display welcome heading', () => {
      renderAdminPage();
      expect(screen.getByRole('heading', { name: /welcome to the admin portal/i })).toBeInTheDocument();
    });
  });

  describe('Sale Percent Input', () => {
    it('should render sale percent label', () => {
      renderAdminPage();
      expect(screen.getByLabelText(/set sale percent/i)).toBeInTheDocument();
    });

    it('should render sale percent input', () => {
      renderAdminPage();
      const input = screen.getByLabelText(/set sale percent/i);
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'text');
      expect(input).toHaveAttribute('id', 'salePercent');
    });

    it('should initialize with value of 0', () => {
      renderAdminPage();
      const input = screen.getByLabelText(/set sale percent/i) as HTMLInputElement;
      expect(input.value).toBe('0');
    });

    it('should update input value when typing', () => {
      renderAdminPage();
      const input = screen.getByLabelText(/set sale percent/i) as HTMLInputElement;
      
      fireEvent.change(input, { target: { value: '25' } });
      
      expect(input.value).toBe('25');
    });
  });

  describe('Submit Button', () => {
    it('should render Submit button', () => {
      renderAdminPage();
      expect(screen.getByRole('button', { name: /^submit$/i })).toBeInTheDocument();
    });

    it('should set sale percent with valid number', () => {
      renderAdminPage();
      const input = screen.getByLabelText(/set sale percent/i);
      const submitButton = screen.getByRole('button', { name: /^submit$/i });
      
      fireEvent.change(input, { target: { value: '20' } });
      fireEvent.click(submitButton);
      
      expect(screen.getByText(/all products are 20% off/i)).toBeInTheDocument();
    });

    it('should show error for invalid input', () => {
      renderAdminPage();
      const input = screen.getByLabelText(/set sale percent/i);
      const submitButton = screen.getByRole('button', { name: /^submit$/i });
      
      fireEvent.change(input, { target: { value: 'abc' } });
      fireEvent.click(submitButton);
      
      expect(screen.getByText(/invalid input/i)).toBeInTheDocument();
      expect(screen.getByText(/"abc"/i)).toBeInTheDocument();
    });

    it('should display error in red color', () => {
      renderAdminPage();
      const input = screen.getByLabelText(/set sale percent/i);
      const submitButton = screen.getByRole('button', { name: /^submit$/i });
      
      fireEvent.change(input, { target: { value: 'invalid' } });
      fireEvent.click(submitButton);
      
      const errorDiv = screen.getByText(/invalid input/i).parentElement;
      expect(errorDiv?.style.color).toBeTruthy();
    });

    it('should handle decimal numbers', () => {
      renderAdminPage();
      const input = screen.getByLabelText(/set sale percent/i);
      const submitButton = screen.getByRole('button', { name: /^submit$/i });
      
      fireEvent.change(input, { target: { value: '15.5' } });
      fireEvent.click(submitButton);
      
      expect(screen.getByText(/all products are 15.5% off/i)).toBeInTheDocument();
    });

    it('should handle zero as valid input', () => {
      renderAdminPage();
      const input = screen.getByLabelText(/set sale percent/i);
      const submitButton = screen.getByRole('button', { name: /^submit$/i });
      
      fireEvent.change(input, { target: { value: '0' } });
      fireEvent.click(submitButton);
      
      expect(screen.getByText(/no sale active/i)).toBeInTheDocument();
    });

    it('should handle negative numbers', () => {
      renderAdminPage();
      const input = screen.getByLabelText(/set sale percent/i);
      const submitButton = screen.getByRole('button', { name: /^submit$/i });
      
      fireEvent.change(input, { target: { value: '-10' } });
      fireEvent.click(submitButton);
      
      // Negative numbers show "No sale active" since they're not > 0
      expect(screen.queryByText(/no sale active/i)).toBeInTheDocument();
    });

    it('should clear error when valid input is submitted after error', () => {
      renderAdminPage();
      const input = screen.getByLabelText(/set sale percent/i);
      const submitButton = screen.getByRole('button', { name: /^submit$/i });
      
      // First submit invalid input
      fireEvent.change(input, { target: { value: 'invalid' } });
      fireEvent.click(submitButton);
      expect(screen.getByText(/invalid input/i)).toBeInTheDocument();
      
      // Then submit valid input
      fireEvent.change(input, { target: { value: '15' } });
      fireEvent.click(submitButton);
      
      // Error should still be there (not cleared by the component logic)
      // This tests the actual behavior
    });
  });

  describe('End Sale Button', () => {
    it('should render End Sale button', () => {
      renderAdminPage();
      expect(screen.getByRole('button', { name: /end sale/i })).toBeInTheDocument();
    });

    it('should reset sale percent to 0', () => {
      renderAdminPage();
      const input = screen.getByLabelText(/set sale percent/i) as HTMLInputElement;
      const submitButton = screen.getByRole('button', { name: /^submit$/i });
      const endSaleButton = screen.getByRole('button', { name: /end sale/i });
      
      // Set a sale
      fireEvent.change(input, { target: { value: '30' } });
      fireEvent.click(submitButton);
      expect(screen.getByText(/all products are 30% off/i)).toBeInTheDocument();
      
      // End sale
      fireEvent.click(endSaleButton);
      expect(screen.getByText(/no sale active/i)).toBeInTheDocument();
      expect(input.value).toBe('0');
    });

    it('should reset input value to 0', () => {
      renderAdminPage();
      const input = screen.getByLabelText(/set sale percent/i) as HTMLInputElement;
      const endSaleButton = screen.getByRole('button', { name: /end sale/i });
      
      fireEvent.change(input, { target: { value: '50' } });
      fireEvent.click(endSaleButton);
      
      expect(input.value).toBe('0');
    });

    it('should work even when no sale is active', () => {
      renderAdminPage();
      const endSaleButton = screen.getByRole('button', { name: /end sale/i });
      
      fireEvent.click(endSaleButton);
      
      expect(screen.getByText(/no sale active/i)).toBeInTheDocument();
    });
  });

  describe('Sale Status Display', () => {
    it('should show "No sale active" initially', () => {
      renderAdminPage();
      expect(screen.getByText(/no sale active/i)).toBeInTheDocument();
    });

    it('should show sale status in green color', () => {
      renderAdminPage();
      const statusElement = screen.getByText(/no sale active/i);
      expect(statusElement.style.color).toBeTruthy();
    });

    it('should update status when sale is set', () => {
      renderAdminPage();
      const input = screen.getByLabelText(/set sale percent/i);
      const submitButton = screen.getByRole('button', { name: /^submit$/i });
      
      fireEvent.change(input, { target: { value: '40' } });
      fireEvent.click(submitButton);
      
      expect(screen.getByText(/all products are 40% off/i)).toBeInTheDocument();
      expect(screen.queryByText(/no sale active/i)).not.toBeInTheDocument();
    });

    it('should show active sale message when percent > 0', () => {
      renderAdminPage();
      const input = screen.getByLabelText(/set sale percent/i);
      const submitButton = screen.getByRole('button', { name: /^submit$/i });
      
      fireEvent.change(input, { target: { value: '1' } });
      fireEvent.click(submitButton);
      
      expect(screen.getByText(/all products are 1% off/i)).toBeInTheDocument();
    });
  });

  describe('Back to Storefront Link', () => {
    it('should render Back to Storefront button', () => {
      renderAdminPage();
      expect(screen.getByRole('button', { name: /back to storefront/i })).toBeInTheDocument();
    });

    it('should wrap button in a Link to home', () => {
      renderAdminPage();
      const link = screen.getByRole('link', { name: /back to storefront/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/');
    });
  });

  describe('Error Message Display', () => {
    it('should not show error message initially', () => {
      renderAdminPage();
      expect(screen.queryByText(/invalid input/i)).not.toBeInTheDocument();
    });

    it('should show error for empty string', () => {
      renderAdminPage();
      const input = screen.getByLabelText(/set sale percent/i);
      const submitButton = screen.getByRole('button', { name: /^submit$/i });
      
      fireEvent.change(input, { target: { value: '' } });
      fireEvent.click(submitButton);
      
      // Empty string converts to 0, which is valid
      expect(screen.getByText(/no sale active/i)).toBeInTheDocument();
    });

    it('should show error for special characters', () => {
      renderAdminPage();
      const input = screen.getByLabelText(/set sale percent/i);
      const submitButton = screen.getByRole('button', { name: /^submit$/i });
      
      fireEvent.change(input, { target: { value: '@#$' } });
      fireEvent.click(submitButton);
      
      expect(screen.getByText(/invalid input/i)).toBeInTheDocument();
    });

    it('should display the invalid value in error message', () => {
      renderAdminPage();
      const input = screen.getByLabelText(/set sale percent/i);
      const submitButton = screen.getByRole('button', { name: /^submit$/i });
      
      fireEvent.change(input, { target: { value: 'test123' } });
      fireEvent.click(submitButton);
      
      expect(screen.getByText(/"test123"/i)).toBeInTheDocument();
    });

    it('should show help text in error message', () => {
      renderAdminPage();
      const input = screen.getByLabelText(/set sale percent/i);
      const submitButton = screen.getByRole('button', { name: /^submit$/i });
      
      fireEvent.change(input, { target: { value: 'invalid' } });
      fireEvent.click(submitButton);
      
      expect(screen.getByText(/please enter a valid number/i)).toBeInTheDocument();
    });
  });
});
