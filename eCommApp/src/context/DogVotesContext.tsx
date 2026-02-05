import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { DogVote } from '../types';

interface DogVotesContextType {
    votedDogs: DogVote[];
    addVote: (imageUrl: string) => void;
    getTopDogs: (limit: number) => DogVote[];
    resetDailyVotes: () => void;
}

export const DogVotesContext = createContext<DogVotesContextType | undefined>(undefined);

const STORAGE_KEY = 'dogVotes';
const LAST_RESET_KEY = 'lastVoteReset';

// Check if votes should be reset (older than 24 hours)
const shouldResetVotes = (): boolean => {
    const lastReset = localStorage.getItem(LAST_RESET_KEY);
    if (!lastReset) return true;
    
    const lastResetDate = new Date(lastReset);
    const now = new Date();
    const hoursDiff = (now.getTime() - lastResetDate.getTime()) / (1000 * 60 * 60);
    
    return hoursDiff >= 24;
};

// Load votes from localStorage
const loadVotes = (): DogVote[] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return [];
        
        const votes = JSON.parse(stored);
        // Convert timestamp strings back to Date objects, with fallback for missing timestamps
        return votes.map((vote: any) => ({
            ...vote,
            timestamp: vote.timestamp ? new Date(vote.timestamp) : new Date()
        }));
    } catch (error) {
        console.error('Error loading votes from localStorage:', error);
        return [];
    }
};

// Save votes to localStorage
const saveVotes = (votes: DogVote[]) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(votes));
    } catch (error) {
        console.error('Error saving votes to localStorage:', error);
    }
};

export const DogVotesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [votedDogs, setVotedDogs] = useState<DogVote[]>([]);

    // Initialize votes from localStorage
    useEffect(() => {
        if (shouldResetVotes()) {
            // Reset votes if they're too old
            localStorage.removeItem(STORAGE_KEY);
            localStorage.setItem(LAST_RESET_KEY, new Date().toISOString());
            setVotedDogs([]);
        } else {
            // Load existing votes
            const loaded = loadVotes();
            setVotedDogs(loaded);
        }
    }, []);

    // Save votes whenever they change
    useEffect(() => {
        if (votedDogs.length > 0) {
            saveVotes(votedDogs);
        }
    }, [votedDogs]);

    const addVote = (imageUrl: string) => {
        setVotedDogs(prevVotes => {
            // Find if this dog image already has votes
            const existingVote = prevVotes.find(vote => vote.imageUrl === imageUrl);
            
            if (existingVote) {
                // Increment vote count for existing dog
                return prevVotes.map(vote =>
                    vote.imageUrl === imageUrl
                        ? { ...vote, votes: vote.votes + 1 }
                        : vote
                );
            } else {
                // Add new dog vote
                const newVote: DogVote = {
                    id: `vote-${Date.now()}-${Math.random()}`,
                    imageUrl,
                    votes: 1,
                    timestamp: new Date()
                };
                return [...prevVotes, newVote];
            }
        });
    };

    const getTopDogs = (limit: number): DogVote[] => {
        // Sort by votes descending and return top N
        return [...votedDogs]
            .sort((a, b) => b.votes - a.votes)
            .slice(0, limit);
    };

    const resetDailyVotes = () => {
        setVotedDogs([]);
        localStorage.removeItem(STORAGE_KEY);
        localStorage.setItem(LAST_RESET_KEY, new Date().toISOString());
    };

    return (
        <DogVotesContext.Provider value={{ votedDogs, addVote, getTopDogs, resetDailyVotes }}>
            {children}
        </DogVotesContext.Provider>
    );
};
