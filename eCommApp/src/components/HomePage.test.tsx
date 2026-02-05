import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import HomePage from './HomePage';

// Mock child components
vi.mock('./Header', () => ({
  default: () => <div data-testid="header">Header</div>
}));

vi.mock('./Footer', () => ({
  default: () => <div data-testid="footer">Footer</div>
}));

// Mock fetch API
(globalThis as any).fetch = vi.fn();

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
  beforeEach(() => {
    vi.clearAllMocks();
    ((globalThis as any).fetch as any).mockResolvedValue({
      json: async () => ({
        status: 'success',
        message: 'https://images.dog.ceo/breeds/hound-afghan/n02088094_1003.jpg'
      })
    });
  });

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

  it('should display "Dog of the Moment" heading', () => {
    renderHomePage();
    expect(screen.getByRole('heading', { name: /dog of the moment/i })).toBeInTheDocument();
  });

  it('should fetch and display dog image on mount', async () => {
    renderHomePage();
    
    await waitFor(() => {
      const dogImage = screen.getByAltText('Random dog');
      expect(dogImage).toBeInTheDocument();
      expect(dogImage).toHaveAttribute('src', 'https://images.dog.ceo/breeds/hound-afghan/n02088094_1003.jpg');
    });
  });

  it('should display loading state initially', () => {
    renderHomePage();
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should render Next button', async () => {
    renderHomePage();
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
    });
  });

  it('should render thumbs up button', async () => {
    renderHomePage();
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /thumbs up/i })).toBeInTheDocument();
    });
  });

  it('should render thumbs down button', async () => {
    renderHomePage();
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /thumbs down/i })).toBeInTheDocument();
    });
  });

  it('should display happy emoji when thumbs up is clicked', async () => {
    const user = userEvent.setup();
    renderHomePage();
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /thumbs up/i })).toBeInTheDocument();
    });

    const thumbsUpButton = screen.getByRole('button', { name: /thumbs up/i });
    await user.click(thumbsUpButton);

    await waitFor(() => {
      const emojiDisplay = screen.getByTestId('emoji-display');
      expect(emojiDisplay).toHaveTextContent('😊');
    });
  });

  it('should display sad emoji when thumbs down is clicked', async () => {
    const user = userEvent.setup();
    renderHomePage();
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /thumbs down/i })).toBeInTheDocument();
    });

    const thumbsDownButton = screen.getByRole('button', { name: /thumbs down/i });
    await user.click(thumbsDownButton);

    await waitFor(() => {
      const emojiDisplay = screen.getByTestId('emoji-display');
      expect(emojiDisplay).toHaveTextContent('😢');
    });
  });

  it('should fetch new dog image when Next button is clicked', async () => {
    const user = userEvent.setup();
    ((globalThis as any).fetch as any).mockResolvedValueOnce({
      json: async () => ({
        status: 'success',
        message: 'https://images.dog.ceo/breeds/hound-afghan/n02088094_1003.jpg'
      })
    }).mockResolvedValueOnce({
      json: async () => ({
        status: 'success',
        message: 'https://images.dog.ceo/breeds/husky/n02110185_1469.jpg'
      })
    });

    renderHomePage();
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
    });

    const nextButton = screen.getByRole('button', { name: /next/i });
    await user.click(nextButton);

    await waitFor(() => {
      const dogImage = screen.getByAltText('Random dog');
      expect(dogImage).toHaveAttribute('src', 'https://images.dog.ceo/breeds/husky/n02110185_1469.jpg');
    });
  });

  it('should clear emoji when Next button is clicked', async () => {
    const user = userEvent.setup();
    renderHomePage();
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /thumbs up/i })).toBeInTheDocument();
    });

    // Click thumbs up to show emoji
    const thumbsUpButton = screen.getByRole('button', { name: /thumbs up/i });
    await user.click(thumbsUpButton);

    await waitFor(() => {
      expect(screen.getByTestId('emoji-display')).toBeInTheDocument();
    });

    // Click Next button
    const nextButton = screen.getByRole('button', { name: /next/i });
    await user.click(nextButton);

    // Emoji should be cleared
    await waitFor(() => {
      expect(screen.queryByTestId('emoji-display')).not.toBeInTheDocument();
    });
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
