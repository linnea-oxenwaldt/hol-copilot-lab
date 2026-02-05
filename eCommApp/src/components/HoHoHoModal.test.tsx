import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import HoHoHoModal from './HoHoHoModal';

describe('HoHoHoModal', () => {
    it('should render the modal with "Ho Ho Ho!" text', () => {
        const mockOnClose = vi.fn();
        render(<HoHoHoModal onClose={mockOnClose} />);
        
        expect(screen.getByText('Ho Ho Ho!')).toBeInTheDocument();
    });

    it('should render "Merry Christmas" button', () => {
        const mockOnClose = vi.fn();
        render(<HoHoHoModal onClose={mockOnClose} />);
        
        expect(screen.getByRole('button', { name: /merry christmas/i })).toBeInTheDocument();
    });

    it('should call onClose when "Merry Christmas" button is clicked', () => {
        const mockOnClose = vi.fn();
        render(<HoHoHoModal onClose={mockOnClose} />);
        
        const button = screen.getByRole('button', { name: /merry christmas/i });
        fireEvent.click(button);
        
        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when backdrop is clicked', () => {
        const mockOnClose = vi.fn();
        const { container } = render(<HoHoHoModal onClose={mockOnClose} />);
        
        const backdrop = container.querySelector('.modal-backdrop');
        if (backdrop) {
            fireEvent.click(backdrop);
            expect(mockOnClose).toHaveBeenCalledTimes(1);
        }
    });

    it('should not call onClose when modal content is clicked', () => {
        const mockOnClose = vi.fn();
        const { container } = render(<HoHoHoModal onClose={mockOnClose} />);
        
        const modalContent = container.querySelector('.modal-content');
        if (modalContent) {
            fireEvent.click(modalContent);
            expect(mockOnClose).not.toHaveBeenCalled();
        }
    });
});
