import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import ContactUsPage from './ContactUsPage';

// Mock components
vi.mock('./Header', () => ({
    default: () => <div data-testid="header">Header</div>
}));

vi.mock('./Footer', () => ({
    default: () => <div data-testid="footer">Footer</div>
}));

describe('ContactUsPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the contact form with all fields', () => {
        render(<ContactUsPage />);
        
        expect(screen.getByText('Contact Us')).toBeInTheDocument();
        expect(screen.getByLabelText('Name:')).toBeInTheDocument();
        expect(screen.getByLabelText('Email:')).toBeInTheDocument();
        expect(screen.getByLabelText('Pet Name:')).toBeInTheDocument();
        expect(screen.getByLabelText('Favorite Color:')).toBeInTheDocument();
        expect(screen.getByLabelText('What did you eat for dinner yesterday?')).toBeInTheDocument();
        expect(screen.getByLabelText('Request:')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
    });

    it('allows user to fill in the form', () => {
        render(<ContactUsPage />);
        
        const nameInput = screen.getByLabelText('Name:') as HTMLInputElement;
        const emailInput = screen.getByLabelText('Email:') as HTMLInputElement;
        const petNameInput = screen.getByLabelText('Pet Name:') as HTMLInputElement;
        const favoriteColorInput = screen.getByLabelText('Favorite Color:') as HTMLInputElement;
        const dinnerInput = screen.getByLabelText('What did you eat for dinner yesterday?') as HTMLInputElement;
        const requestInput = screen.getByLabelText('Request:') as HTMLTextAreaElement;
        
        fireEvent.change(nameInput, { target: { value: 'John Doe' } });
        fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
        fireEvent.change(petNameInput, { target: { value: 'Fluffy' } });
        fireEvent.change(favoriteColorInput, { target: { value: 'Blue' } });
        fireEvent.change(dinnerInput, { target: { value: 'Pizza' } });
        fireEvent.change(requestInput, { target: { value: 'I need help with something' } });
        
        expect(nameInput.value).toBe('John Doe');
        expect(emailInput.value).toBe('john@example.com');
        expect(petNameInput.value).toBe('Fluffy');
        expect(favoriteColorInput.value).toBe('Blue');
        expect(dinnerInput.value).toBe('Pizza');
        expect(requestInput.value).toBe('I need help with something');
    });

    it('displays modal with "Loser!" when form is submitted', () => {
        render(<ContactUsPage />);
        
        const nameInput = screen.getByLabelText('Name:');
        const emailInput = screen.getByLabelText('Email:');
        const petNameInput = screen.getByLabelText('Pet Name:');
        const favoriteColorInput = screen.getByLabelText('Favorite Color:');
        const dinnerInput = screen.getByLabelText('What did you eat for dinner yesterday?');
        const requestInput = screen.getByLabelText('Request:');
        const submitButton = screen.getByRole('button', { name: 'Submit' });
        
        fireEvent.change(nameInput, { target: { value: 'John Doe' } });
        fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
        fireEvent.change(petNameInput, { target: { value: 'Fluffy' } });
        fireEvent.change(favoriteColorInput, { target: { value: 'Blue' } });
        fireEvent.change(dinnerInput, { target: { value: 'Pizza' } });
        fireEvent.change(requestInput, { target: { value: 'I need help' } });
        
        fireEvent.click(submitButton);
        
        expect(screen.getByText('Loser!')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument();
    });

    it('clears form and closes modal when Continue button is clicked', () => {
        render(<ContactUsPage />);
        
        const nameInput = screen.getByLabelText('Name:') as HTMLInputElement;
        const emailInput = screen.getByLabelText('Email:') as HTMLInputElement;
        const petNameInput = screen.getByLabelText('Pet Name:') as HTMLInputElement;
        const favoriteColorInput = screen.getByLabelText('Favorite Color:') as HTMLInputElement;
        const dinnerInput = screen.getByLabelText('What did you eat for dinner yesterday?') as HTMLInputElement;
        const requestInput = screen.getByLabelText('Request:') as HTMLTextAreaElement;
        const submitButton = screen.getByRole('button', { name: 'Submit' });
        
        // Fill form
        fireEvent.change(nameInput, { target: { value: 'John Doe' } });
        fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
        fireEvent.change(petNameInput, { target: { value: 'Fluffy' } });
        fireEvent.change(favoriteColorInput, { target: { value: 'Blue' } });
        fireEvent.change(dinnerInput, { target: { value: 'Pizza' } });
        fireEvent.change(requestInput, { target: { value: 'I need help' } });
        
        // Submit form
        fireEvent.click(submitButton);
        
        // Click Continue
        const continueButton = screen.getByRole('button', { name: 'Continue' });
        fireEvent.click(continueButton);
        
        // Check modal is closed
        expect(screen.queryByText('Loser!')).not.toBeInTheDocument();
        
        // Check form is cleared
        expect(nameInput.value).toBe('');
        expect(emailInput.value).toBe('');
        expect(petNameInput.value).toBe('');
        expect(favoriteColorInput.value).toBe('');
        expect(dinnerInput.value).toBe('');
        expect(requestInput.value).toBe('');
    });
});
