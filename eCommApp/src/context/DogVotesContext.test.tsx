import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { DogVotesProvider, DogVotesContext } from './DogVotesContext';
import { useContext } from 'react';

// Helper component to test context
const TestComponent = () => {
    const context = useContext(DogVotesContext);
    if (!context) return <div>No context</div>;
    
    const { votedDogs, addVote, getTopDogs } = context;
    
    return (
        <div>
            <div data-testid="voted-dogs-count">{votedDogs.length}</div>
            <button 
                onClick={() => addVote('https://test.com/dog1.jpg')}
                data-testid="add-vote-btn"
            >
                Add Vote
            </button>
            <button 
                onClick={() => addVote('https://test.com/dog2.jpg')}
                data-testid="add-vote-btn-2"
            >
                Add Vote 2
            </button>
            <div data-testid="top-dogs">
                {getTopDogs(5).map((dog, index) => (
                    <div key={dog.id} data-testid={`top-dog-${index}`}>
                        {dog.imageUrl} - {dog.votes}
                    </div>
                ))}
            </div>
        </div>
    );
};

describe('DogVotesContext', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    afterEach(() => {
        localStorage.clear();
    });

    it('should provide context to children', () => {
        render(
            <DogVotesProvider>
                <TestComponent />
            </DogVotesProvider>
        );
        
        expect(screen.getByTestId('voted-dogs-count')).toHaveTextContent('0');
    });

    it('should add a vote for a new dog', async () => {
        render(
            <DogVotesProvider>
                <TestComponent />
            </DogVotesProvider>
        );
        
        const addVoteBtn = screen.getByTestId('add-vote-btn');
        addVoteBtn.click();
        
        await waitFor(() => {
            expect(screen.getByTestId('voted-dogs-count')).toHaveTextContent('1');
        });
    });

    it('should increment votes for the same dog', async () => {
        render(
            <DogVotesProvider>
                <TestComponent />
            </DogVotesProvider>
        );
        
        const addVoteBtn = screen.getByTestId('add-vote-btn');
        addVoteBtn.click();
        addVoteBtn.click();
        
        // Should still have 1 dog entry, but with 2 votes
        await waitFor(() => {
            expect(screen.getByTestId('voted-dogs-count')).toHaveTextContent('1');
            expect(screen.getByTestId('top-dog-0')).toHaveTextContent('2');
        });
    });

    it('should track multiple different dogs', async () => {
        render(
            <DogVotesProvider>
                <TestComponent />
            </DogVotesProvider>
        );
        
        screen.getByTestId('add-vote-btn').click();
        screen.getByTestId('add-vote-btn-2').click();
        
        await waitFor(() => {
            expect(screen.getByTestId('voted-dogs-count')).toHaveTextContent('2');
        });
    });

    it('should return top dogs sorted by votes', async () => {
        render(
            <DogVotesProvider>
                <TestComponent />
            </DogVotesProvider>
        );
        
        // Vote for dog2 three times
        screen.getByTestId('add-vote-btn-2').click();
        screen.getByTestId('add-vote-btn-2').click();
        screen.getByTestId('add-vote-btn-2').click();
        
        // Vote for dog1 once
        screen.getByTestId('add-vote-btn').click();
        
        await waitFor(() => {
            // Dog2 should be first with 3 votes
            const topDog = screen.getByTestId('top-dog-0');
            expect(topDog).toHaveTextContent('https://test.com/dog2.jpg - 3');
            
            // Dog1 should be second with 1 vote
            const secondDog = screen.getByTestId('top-dog-1');
            expect(secondDog).toHaveTextContent('https://test.com/dog1.jpg - 1');
        });
    });

    it('should persist votes to localStorage', async () => {
        render(
            <DogVotesProvider>
                <TestComponent />
            </DogVotesProvider>
        );
        
        screen.getByTestId('add-vote-btn').click();
        
        await waitFor(() => {
            const stored = localStorage.getItem('dogVotes');
            expect(stored).toBeTruthy();
            
            const votes = JSON.parse(stored!);
            expect(votes).toHaveLength(1);
            expect(votes[0].imageUrl).toBe('https://test.com/dog1.jpg');
        });
    });
});
