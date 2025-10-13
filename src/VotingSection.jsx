import { useState, useEffect } from "react";
import "./VotingSection.css";

function VotingSection({ stories, votes, onVote, onBack }) {
	const [voterName, setVoterName] = useState("");
	const [hasEnteredName, setHasEnteredName] = useState(false);
	const [userVotes, setUserVotes] = useState({});

	// Get unique author names (no duplicates)
	const authors = [...new Set(stories.map(story => story.author))].sort();

	// Check which stories this voter has already voted on
	useEffect(() => {
		if (hasEnteredName && voterName) {
			const myVotes = votes.filter(v => v.voter === voterName);
			const votesMap = {};
			myVotes.forEach(v => {
				votesMap[v.storyId] = v.guessedAuthor;
			});
			setUserVotes(votesMap);
		}
	}, [hasEnteredName, voterName, votes]);

	const handleNameSubmit = (e) => {
		e.preventDefault();
		if (!voterName.trim()) {
			alert("Please enter your name!");
			return;
		}
		setHasEnteredName(true);
	};

	const handleVote = (storyId, guessedAuthor) => {
		// Check if already voted on this story
		if (userVotes[storyId]) {
			alert("You've already voted on this story! Votes cannot be changed.");
			return;
		}

		if (!guessedAuthor) {
			alert("Please select an author!");
			return;
		}

		onVote({
			voter: voterName,
			storyId: storyId,
			guessedAuthor: guessedAuthor,
			timestamp: new Date().toISOString()
		});

		// Update local state to reflect the vote
		setUserVotes({
			...userVotes,
			[storyId]: guessedAuthor
		});

		alert("Vote recorded! 🎃");
	};

	if (!hasEnteredName) {
		return (
			<div className="voting-container">
				<button className="back-button" onClick={onBack}>
					← Back to Home
				</button>
				
				<h2 className="voting-title">🗳️ Enter Voting</h2>
				<p className="voting-subtitle">Who are you?</p>

				<form className="voter-name-form" onSubmit={handleNameSubmit}>
					<input
						type="text"
						value={voterName}
						onChange={(e) => setVoterName(e.target.value)}
						placeholder="Enter your name..."
						maxLength={50}
						className="voter-name-input"
					/>
					<button type="submit" className="enter-voting-button">
						Enter Voting Area
					</button>
				</form>
			</div>
		);
	}

	return (
		<div className="voting-container">
			<button className="back-button" onClick={onBack}>
				← Back to Home
			</button>
			
			<h2 className="voting-title">🗳️ Guess the Authors</h2>
			<p className="voting-subtitle">Voting as: <strong>{voterName}</strong></p>

			<div className="voting-list">
				{stories.map((story, index) => (
					<div key={story.id} className="voting-card">
						<div className="voting-story-number">Story #{index + 1}</div>
						<h3 className="voting-story-title">{story.title}</h3>
						
						<div className="voting-controls">
							<label htmlFor={`vote-${story.id}`}>Who wrote this?</label>
							<div className="voting-input-group">
								<select
									id={`vote-${story.id}`}
									disabled={!!userVotes[story.id]}
									defaultValue=""
									onChange={(e) => {
										if (e.target.value) {
											handleVote(story.id, e.target.value);
										}
									}}
								>
									<option value="">-- Select Author --</option>
									{authors.map(author => (
										<option key={author} value={author}>
											{author}
										</option>
									))}
								</select>
								{userVotes[story.id] && (
									<span className="vote-locked">
										✓ Voted: {userVotes[story.id]}
									</span>
								)}
							</div>
						</div>
					</div>
				))}
			</div>

			<div className="voting-stats">
				<p>You've voted on {Object.keys(userVotes).length} of {stories.length} stories</p>
			</div>
		</div>
	);
}

export default VotingSection;
