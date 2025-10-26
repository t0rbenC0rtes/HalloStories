import "./Results.css";

function Results({ stories, votes, onBack }) {
	// Calculate scores for each voter
	const calculateScores = () => {
		const scores = {};

		votes.forEach(vote => {
			// Handle both snake_case (from Supabase) and camelCase (legacy)
			const storyId = vote.story_id || vote.storyId;
			const guessedAuthor = vote.guessed_author || vote.guessedAuthor;
			const guessedReal = vote.guessed_real !== undefined ? vote.guessed_real : vote.guessedReal;
			
			// Find the actual author of the story
			const story = stories.find(s => String(s.id) === String(storyId));
			if (!story) return;

			// Handle snake_case for story fields too
			const storyAuthor = story.author;
			const storyIsReal = story.is_real !== undefined ? story.is_real : story.isReal;

			// Initialize voter score if not exists
			if (!scores[vote.voter]) {
				scores[vote.voter] = {
					points: 0,
					authorCorrect: 0,
					realFakeCorrect: 0,
					totalVotes: 0
				};
			}

			scores[vote.voter].totalVotes++;

			// Check if author guess was correct
			if (guessedAuthor === storyAuthor) {
				scores[vote.voter].authorCorrect++;
				scores[vote.voter].points++;
			}

			// Check if real/fake guess was correct
			if (guessedReal === storyIsReal) {
				scores[vote.voter].realFakeCorrect++;
				scores[vote.voter].points++;
			}
		});

		// Convert to array and sort by points
		return Object.entries(scores)
			.map(([voter, score]) => ({
				voter,
				points: score.points,
				maxPoints: score.totalVotes * 2,
				authorCorrect: score.authorCorrect,
				realFakeCorrect: score.realFakeCorrect,
				totalVotes: score.totalVotes,
				percentage: Math.round((score.points / (score.totalVotes * 2)) * 100)
			}))
			.sort((a, b) => {
				// Sort by points first, then by percentage
				if (b.points !== a.points) {
					return b.points - a.points;
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
				← Retour à l'Accueil
			</button>
			
			<h2 className="results-title">🏆 Classement</h2>
			<p className="results-subtitle">Qui connaît le mieux ses amis ?</p>

			<div className="results-stats">
				<div className="stat-box">
					<div className="stat-number">{stories.length}</div>
					<div className="stat-label">Histoires</div>
				</div>
				<div className="stat-box">
					<div className="stat-number">{uniqueVoters.length}</div>
					<div className="stat-label">Votants</div>
				</div>
				<div className="stat-box">
					<div className="stat-number">{votes.length}</div>
					<div className="stat-label">Total Votes</div>
				</div>
			</div>

			{leaderboard.length === 0 ? (
				<p className="no-results">Aucun vote pour le moment... Commencez à deviner ! 👻</p>
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
									<strong>{player.points}/{player.maxPoints} points</strong>
								</div>
								<div className="player-details">
									Auteurs : {player.authorCorrect}/{player.totalVotes} • 
									Vrai/Faux : {player.realFakeCorrect}/{player.totalVotes}
								</div>
							</div>
							<div className="percentage">{player.percentage}%</div>
						</div>
					))}
				</div>
			)}

			<div className="story-reveal">
				<h3>📚 Révélations des Histoires</h3>
				<div className="reveal-list">
					{stories.map((story, index) => {
						// Handle both snake_case (from Supabase) and camelCase (legacy)
						const storyIsReal = story.is_real !== undefined ? story.is_real : story.isReal;
						
						return (
							<div key={story.id} className="reveal-item">
								<div className="reveal-title">
									<span className="reveal-number">#{index + 1}</span>
									<span>{story.title}</span>
								</div>
								<div className="reveal-info">
									<span className="reveal-author">par {story.author}</span>
									<span className="reveal-real">{storyIsReal ? '✓ Vraie' : '✗ Fausse'}</span>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}

export default Results;
