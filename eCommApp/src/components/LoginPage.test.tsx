import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from './LoginPage';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

// Mock child components
vi.mock('./Header', () => ({
  default: () => <div data-testid="header">Header</div>
}));

vi.mock('./Footer', () => ({
  default: () => <div data-testid="footer">Footer</div>
}));

/**
 * Helper to render LoginPage with required Router context
 */
const renderLoginPage = () => {
  return render(
    <BrowserRouter>
      <LoginPage />
    </BrowserRouter>
  );
};

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the page container', () => {
      const { container } = renderLoginPage();
      expect(container.querySelector('.app')).toBeInTheDocument();
    });

    it('should render Header component', () => {
      renderLoginPage();
      expect(screen.getByTestId('header')).toBeInTheDocument();
    });

    it('should render Footer component', () => {
      renderLoginPage();
      expect(screen.getByTestId('footer')).toBeInTheDocument();
    });

    it('should render main content area', () => {
      const { container } = renderLoginPage();
      const main = container.querySelector('main');
      expect(main).toBeInTheDocument();
      expect(main).toHaveClass('main-content');
    });

    it('should render login container', () => {
      const { container } = renderLoginPage();
      expect(container.querySelector('.login-container')).toBeInTheDocument();
    });

    it('should display "Admin Login" heading', () => {
      renderLoginPage();
      expect(screen.getByRole('heading', { name: /admin login/i })).toBeInTheDocument();
    });
  });

  describe('Form Elements', () => {
    it('should render username input', () => {
      renderLoginPage();
      const usernameInput = screen.getByPlaceholderText(/username/i);
      expect(usernameInput).toBeInTheDocument();
      expect(usernameInput).toHaveAttribute('type', 'text');
    });

    it('should render password input', () => {
      renderLoginPage();
      const passwordInput = screen.getByPlaceholderText(/password/i);
      expect(passwordInput).toBeInTheDocument();
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('should render login button', () => {
      renderLoginPage();
      expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    });

    it('should render form element', () => {
      const { container } = renderLoginPage();
      const form = container.querySelector('form');
      expect(form).toBeInTheDocument();
    });
  });

  describe('Form Interactions', () => {
    it('should update username when typing', () => {
      renderLoginPage();
      const usernameInput = screen.getByPlaceholderText(/username/i) as HTMLInputElement;
      
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      
      expect(usernameInput.value).toBe('testuser');
    });

    it('should update password when typing', () => {
      renderLoginPage();
      const passwordInput = screen.getByPlaceholderText(/password/i) as HTMLInputElement;
      
      fireEvent.change(passwordInput, { target: { value: 'testpass' } });
      
      expect(passwordInput.value).toBe('testpass');
    });

    it('should not show error message initially', () => {
      renderLoginPage();
      expect(screen.queryByText(/invalid credentials/i)).not.toBeInTheDocument();
    });
  });

  describe('Login Success', () => {
    it('should navigate to /admin with correct credentials', () => {
      renderLoginPage();
      
      const usernameInput = screen.getByPlaceholderText(/username/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);
      const loginButton = screen.getByRole('button', { name: /login/i });

      fireEvent.change(usernameInput, { target: { value: 'admin' } });
      fireEvent.change(passwordInput, { target: { value: 'admin' } });
      fireEvent.click(loginButton);

      expect(mockNavigate).toHaveBeenCalledWith('/admin');
      expect(mockNavigate).toHaveBeenCalledTimes(1);
    });

    it('should clear form fields on successful login', () => {
      renderLoginPage();
      
      const usernameInput = screen.getByPlaceholderText(/username/i) as HTMLInputElement;
      const passwordInput = screen.getByPlaceholderText(/password/i) as HTMLInputElement;
      const loginButton = screen.getByRole('button', { name: /login/i });

      fireEvent.change(usernameInput, { target: { value: 'admin' } });
      fireEvent.change(passwordInput, { target: { value: 'admin' } });
      fireEvent.click(loginButton);

      expect(usernameInput.value).toBe('');
      expect(passwordInput.value).toBe('');
    });

    it('should not show error on successful login', () => {
      renderLoginPage();
      
      const usernameInput = screen.getByPlaceholderText(/username/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);
      const loginButton = screen.getByRole('button', { name: /login/i });

      fireEvent.change(usernameInput, { target: { value: 'admin' } });
      fireEvent.change(passwordInput, { target: { value: 'admin' } });
      fireEvent.click(loginButton);

      expect(screen.queryByText(/invalid credentials/i)).not.toBeInTheDocument();
    });
  });

  describe('Login Failure', () => {
    it('should show error with wrong username', () => {
      renderLoginPage();
      
      const usernameInput = screen.getByPlaceholderText(/username/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);
      const loginButton = screen.getByRole('button', { name: /login/i });

      fireEvent.change(usernameInput, { target: { value: 'wronguser' } });
      fireEvent.change(passwordInput, { target: { value: 'admin' } });
      fireEvent.click(loginButton);

      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should show error with wrong password', () => {
      renderLoginPage();
      
      const usernameInput = screen.getByPlaceholderText(/username/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);
      const loginButton = screen.getByRole('button', { name: /login/i });

      fireEvent.change(usernameInput, { target: { value: 'admin' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
      fireEvent.click(loginButton);

      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should show error with both wrong credentials', () => {
      renderLoginPage();
      
      const usernameInput = screen.getByPlaceholderText(/username/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);
      const loginButton = screen.getByRole('button', { name: /login/i });

      fireEvent.change(usernameInput, { target: { value: 'wronguser' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
      fireEvent.click(loginButton);

      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should show error with empty credentials', () => {
      renderLoginPage();
      
      const loginButton = screen.getByRole('button', { name: /login/i });
      fireEvent.click(loginButton);

      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should display error in red color', () => {
      renderLoginPage();
      
      const usernameInput = screen.getByPlaceholderText(/username/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);
      const loginButton = screen.getByRole('button', { name: /login/i });

      fireEvent.change(usernameInput, { target: { value: 'wrong' } });
      fireEvent.change(passwordInput, { target: { value: 'wrong' } });
      fireEvent.click(loginButton);

      const errorMessage = screen.getByText(/invalid credentials/i);
      expect(errorMessage.style.color).toBeTruthy();
    });
  });

  describe('Form Submission', () => {
    it('should prevent default form submission', () => {
      renderLoginPage();
      
      const form = screen.getByRole('button', { name: /login/i }).closest('form');
      const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
      const spy = vi.spyOn(submitEvent, 'preventDefault');
      
      form?.dispatchEvent(submitEvent);
      
      expect(spy).toHaveBeenCalled();
    });

    it('should handle form submission via Enter key', () => {
      renderLoginPage();
      
      const usernameInput = screen.getByPlaceholderText(/username/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);

      fireEvent.change(usernameInput, { target: { value: 'admin' } });
      fireEvent.change(passwordInput, { target: { value: 'admin' } });
      
      // Simulate pressing Enter in password field
      fireEvent.submit(passwordInput.closest('form')!);

      expect(mockNavigate).toHaveBeenCalledWith('/admin');
    });
  });
});
