import { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';

// Fallback dog images - using placeholder.com which is more reliable
const FALLBACK_DOG_IMAGES = [
    'https://via.placeholder.com/500x500/8B4513/FFFFFF?text=Dog+1',
    'https://via.placeholder.com/500x500/A0522D/FFFFFF?text=Dog+2',
    'https://via.placeholder.com/500x500/D2691E/FFFFFF?text=Dog+3',
    'https://via.placeholder.com/500x500/CD853F/FFFFFF?text=Dog+4',
    'https://via.placeholder.com/500x500/DEB887/000000?text=Dog+5'
];

const HomePage = () => {
    const [dogImage, setDogImage] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [emoji, setEmoji] = useState<string>('');
    const [imageIndex, setImageIndex] = useState<number>(0);

    const fetchDogImage = async () => {
        setLoading(true);
        try {
            const response = await fetch('https://dog.ceo/api/breeds/image/random');
            const data = await response.json();
            if (data.status === 'success') {
                setDogImage(data.message);
            }
        } catch (error) {
            console.error('Error fetching dog image:', error);
            // Use fallback image if API fails
            setDogImage(FALLBACK_DOG_IMAGES[imageIndex % FALLBACK_DOG_IMAGES.length]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDogImage();
    }, []);

    const handleNext = () => {
        setEmoji('');
        setImageIndex(prevIndex => prevIndex + 1);
        fetchDogImage();
    };

    const handleThumbsUp = () => {
        setEmoji('😊');
    };

    const handleThumbsDown = () => {
        setEmoji('😢');
    };

    return (
        <div className="app">
            <Header />
            <main className="main-content">
                <div className="dog-feature-container">
                    <h2>Welcome to the The Daily Harvest!</h2>
                    <p>Check out our products page for some great deals.</p>
                    
                    <div className="dog-section">
                        <h3>Dog of the Moment</h3>
                        {loading ? (
                            <div className="loading">Loading...</div>
                        ) : (
                            <div className="dog-display">
                                <div className="dog-image-container">
                                    <img 
                                        src={dogImage} 
                                        alt="Random dog" 
                                        className="dog-image"
                                    />
                                    <div className="dog-buttons">
                                        <button 
                                            className="thumb-button thumbs-up" 
                                            onClick={handleThumbsUp}
                                            aria-label="Thumbs up"
                                        >
                                            👍
                                        </button>
                                        <button 
                                            className="thumb-button thumbs-down" 
                                            onClick={handleThumbsDown}
                                            aria-label="Thumbs down"
                                        >
                                            👎
                                        </button>
                                    </div>
                                </div>
                                {emoji && (
                                    <div className="emoji-display" data-testid="emoji-display">
                                        {emoji}
                                    </div>
                                )}
                                <button 
                                    className="next-button" 
                                    onClick={handleNext}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default HomePage;
