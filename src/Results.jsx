import "./Results.css";

function Results({ stories, votes, onBack }) {
	// Calculate scores for each voter
	const calculateScores = () => {
		const scores = {};

		votes.forEach(vote => {
			// Find the actual author of the story
			const story = stories.find(s => s.id === vote.storyId);
			if (!story) return;

			// Initialize voter score if not exists
			if (!scores[vote.voter]) {
				scores[vote.voter] = {
					correct: 0,
					total: 0
				};
			}

			scores[vote.voter].total++;

			// Check if guess was correct
			if (vote.guessedAuthor === story.author) {
				scores[vote.voter].correct++;
			}
		});

		// Convert to array and sort by correct guesses
		return Object.entries(scores)
			.map(([voter, score]) => ({
				voter,
				correct: score.correct,
				total: score.total,
				percentage: Math.round((score.correct / score.total) * 100)
			}))
			.sort((a, b) => {
				// Sort by correct answers first, then by percentage
				if (b.correct !== a.correct) {
					return b.correct - a.correct;
				}
				return b.percentage - a.percentage;
			});
	};

	const leaderboard = calculateScores();

	// Get unique voters who have voted
	const uniqueVoters = [...new Set(votes.map(v => v.voter))];

	return (
		<div className="results-container">
			<button className="back-button" onClick={onBack}>
				← Back to Home
			</button>
			
			<h2 className="results-title">🏆 Leaderboard</h2>
			<p className="results-subtitle">Who knows their friends best?</p>

			<div className="results-stats">
				<div className="stat-box">
					<div className="stat-number">{stories.length}</div>
					<div className="stat-label">Stories</div>
				</div>
				<div className="stat-box">
					<div className="stat-number">{uniqueVoters.length}</div>
					<div className="stat-label">Voters</div>
				</div>
				<div className="stat-box">
					<div className="stat-number">{votes.length}</div>
					<div className="stat-label">Total Votes</div>
				</div>
			</div>

			{leaderboard.length === 0 ? (
				<p className="no-results">No votes yet... Start guessing! 👻</p>
			) : (
				<div className="leaderboard">
					{leaderboard.map((player, index) => (
						<div 
							key={player.voter} 
							className={`leaderboard-item ${index === 0 ? 'winner' : ''}`}
						>
							<div className="rank">
								{index === 0 && '👑'}
								{index === 1 && '🥈'}
								{index === 2 && '🥉'}
								{index > 2 && `#${index + 1}`}
							</div>
							<div className="player-info">
								<div className="player-name">{player.voter}</div>
								<div className="player-score">
									{player.correct} correct out of {player.total} guesses
								</div>
							</div>
							<div className="percentage">{player.percentage}%</div>
						</div>
					))}
				</div>
			)}

			<div className="story-reveal">
				<h3>📚 Story Authors Revealed</h3>
				<div className="reveal-list">
					{stories.map((story, index) => (
						<div key={story.id} className="reveal-item">
							<div className="reveal-title">
								<span className="reveal-number">#{index + 1}</span>
								<span>{story.title}</span>
							</div>
							<div className="reveal-author">by {story.author}</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

export default Results;
