import { render, screen } from '../test/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TopDogsPage from './TopDogsPage';

// Mock child components
vi.mock('./Header', () => ({
    default: () => <div data-testid="header">Header</div>
}));

vi.mock('./Footer', () => ({
    default: () => <div data-testid="footer">Footer</div>
}));

// Mock DogVotesContext
const mockGetTopDogs = vi.fn();
const mockAddVote = vi.fn();
const mockResetDailyVotes = vi.fn();

vi.mock('../context/DogVotesContext', () => ({
    DogVotesContext: {
        Provider: ({ children }: { children: React.ReactNode }) => children,
    },
    DogVotesProvider: ({ children }: { children: React.ReactNode }) => children,
    useContext: () => ({
        votedDogs: [],
        addVote: mockAddVote,
        getTopDogs: mockGetTopDogs,
        resetDailyVotes: mockResetDailyVotes,
    }),
}));

// Need to mock useContext at the React level
vi.mock('react', async () => {
    const actual = await vi.importActual('react');
    return {
        ...actual,
        useContext: () => ({
            votedDogs: [],
            addVote: mockAddVote,
            getTopDogs: mockGetTopDogs,
            resetDailyVotes: mockResetDailyVotes,
        }),
    };
});

describe('TopDogsPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render the page container', () => {
        mockGetTopDogs.mockReturnValue([]);
        const { container } = render(<TopDogsPage />);
        const appDiv = container.querySelector('.app');
        expect(appDiv).toBeInTheDocument();
    });

    it('should render Header component', () => {
        mockGetTopDogs.mockReturnValue([]);
        render(<TopDogsPage />);
        expect(screen.getByTestId('header')).toBeInTheDocument();
    });

    it('should render Footer component', () => {
        mockGetTopDogs.mockReturnValue([]);
        render(<TopDogsPage />);
        expect(screen.getByTestId('footer')).toBeInTheDocument();
    });

    it('should display empty state when no votes', () => {
        mockGetTopDogs.mockReturnValue([]);
        render(<TopDogsPage />);
        
        expect(screen.getByText(/No dogs voted yet today!/i)).toBeInTheDocument();
        expect(screen.getByText(/start voting for your favorite dogs/i)).toBeInTheDocument();
    });

    it('should display top dogs when votes exist', () => {
        const mockDogs = [
            {
                id: 'vote-1',
                imageUrl: 'https://test.com/dog1.jpg',
                votes: 10,
                timestamp: new Date(),
            },
            {
                id: 'vote-2',
                imageUrl: 'https://test.com/dog2.jpg',
                votes: 5,
                timestamp: new Date(),
            },
        ];
        
        mockGetTopDogs.mockReturnValue(mockDogs);
        render(<TopDogsPage />);
        
        expect(screen.getByText('🏆 Top Dogs of the Day')).toBeInTheDocument();
        expect(screen.getByText('10')).toBeInTheDocument();
        expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('should display vote counts correctly', () => {
        const mockDogs = [
            {
                id: 'vote-1',
                imageUrl: 'https://test.com/dog1.jpg',
                votes: 1,
                timestamp: new Date(),
            },
            {
                id: 'vote-2',
                imageUrl: 'https://test.com/dog2.jpg',
                votes: 2,
                timestamp: new Date(),
            },
        ];
        
        mockGetTopDogs.mockReturnValue(mockDogs);
        render(<TopDogsPage />);
        
        // Singular "vote"
        expect(screen.getByText('vote')).toBeInTheDocument();
        // Plural "votes"
        expect(screen.getByText('votes')).toBeInTheDocument();
    });

    it('should display rankings correctly', () => {
        const mockDogs = [
            {
                id: 'vote-1',
                imageUrl: 'https://test.com/dog1.jpg',
                votes: 10,
                timestamp: new Date(),
            },
            {
                id: 'vote-2',
                imageUrl: 'https://test.com/dog2.jpg',
                votes: 5,
                timestamp: new Date(),
            },
        ];
        
        mockGetTopDogs.mockReturnValue(mockDogs);
        render(<TopDogsPage />);
        
        expect(screen.getByText('#1')).toBeInTheDocument();
        expect(screen.getByText('#2')).toBeInTheDocument();
    });

    it('should call getTopDogs with limit of 10', () => {
        mockGetTopDogs.mockReturnValue([]);
        render(<TopDogsPage />);
        
        expect(mockGetTopDogs).toHaveBeenCalledWith(10);
    });
});
