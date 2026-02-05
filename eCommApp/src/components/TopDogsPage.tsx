import { useContext } from 'react';
import Header from './Header';
import Footer from './Footer';
import { DogVotesContext } from '../context/DogVotesContext';

const TopDogsPage = () => {
    const dogVotesContext = useContext(DogVotesContext);
    
    if (!dogVotesContext) {
        throw new Error('DogVotesContext must be used within DogVotesProvider');
    }
    
    const topDogs = dogVotesContext.getTopDogs(10); // Top 10 dogs
    
    return (
        <div className="app">
            <Header />
            <main className="main-content">
                <div className="top-dogs-container">
                    <h2>🏆 Top Dogs of the Day</h2>
                    
                    {topDogs.length === 0 ? (
                        <div className="empty-state">
                            <p>No dogs voted yet today!</p>
                            <p>Visit the <a href="/">home page</a> and start voting for your favorite dogs! 👍</p>
                        </div>
                    ) : (
                        <>
                            <p className="leaderboard-description">
                                Here are the most popular dogs today based on user votes!
                            </p>
                            <div className="top-dogs-grid">
                                {topDogs.map((dog, index) => (
                                    <div key={dog.id} className="dog-card">
                                        <div className="dog-rank">#{index + 1}</div>
                                        <img 
                                            src={dog.imageUrl} 
                                            alt={`Top dog #${index + 1}`}
                                            className="dog-card-image"
                                        />
                                        <div className="dog-votes">
                                            <span className="vote-count">{dog.votes}</span>
                                            <span className="vote-label">
                                                {dog.votes === 1 ? 'vote' : 'votes'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default TopDogsPage;
