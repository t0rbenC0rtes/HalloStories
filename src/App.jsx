import { useState, useEffect } from "react";
import "./App.css";
import StoryForm from "./StoryForm";
import Stories from "./Stories";
import VotingSection from "./VotingSection";
import Results from "./Results";

function App() {
	const [currentView, setCurrentView] = useState("home");
	const [stories, setStories] = useState([]);
	const [votes, setVotes] = useState([]);

	// Load data from localStorage on mount
	useEffect(() => {
		const savedStories = localStorage.getItem("hallostories_stories");
		const savedVotes = localStorage.getItem("hallostories_votes");

		if (savedStories) {
			setStories(JSON.parse(savedStories));
		}
		if (savedVotes) {
			setVotes(JSON.parse(savedVotes));
		}
	}, []);

	// Save stories to localStorage whenever they change
	useEffect(() => {
		if (stories.length > 0) {
			localStorage.setItem(
				"hallostories_stories",
				JSON.stringify(stories)
			);
		}
	}, [stories]);

	// Save votes to localStorage whenever they change
	useEffect(() => {
		if (votes.length > 0) {
			localStorage.setItem("hallostories_votes", JSON.stringify(votes));
		}
	}, [votes]);

	const addStory = (story) => {
		const newStory = {
			id: Date.now() + Math.random(),
			...story,
			timestamp: new Date().toISOString(),
		};
		setStories([...stories, newStory]);
	};

	const addVote = (vote) => {
		setVotes([...votes, vote]);
	};

	// Check if all participants have voted
	const checkVotingStatus = () => {
		if (stories.length === 0) return { allVoted: false, message: "No stories yet" };

		// Get all unique participants (story authors + voters)
		const storyAuthors = [...new Set(stories.map(s => s.author))];
		const voters = [...new Set(votes.map(v => v.voter))];
		const allParticipants = [...new Set([...storyAuthors, ...voters])];

		// Check if each participant has voted on all stories
		const expectedVotesPerPerson = stories.length;
		const votingComplete = allParticipants.every(participant => {
			const participantVotes = votes.filter(v => v.voter === participant).length;
			return participantVotes === expectedVotesPerPerson;
		});

		return {
			allVoted: votingComplete && allParticipants.length > 0,
			totalParticipants: allParticipants.length,
			totalVotes: votes.length,
			expectedVotes: allParticipants.length * expectedVotesPerPerson,
			message: votingComplete && allParticipants.length > 0
				? "All players have voted! ✓"
				: `Waiting for votes... (${votes.length}/${allParticipants.length * expectedVotesPerPerson})`
		};
	};

	const votingStatus = checkVotingStatus();

	const checkPassword = () => {
		const password = prompt("Enter admin password:");
		return password === import.meta.env.VITE_ADMIN_PASSWORD;
	};

	const handleResultsClick = () => {
		if (checkPassword()) {
			setCurrentView("results");
		} else {
			alert("Incorrect password! 🎃");
		}
	};

	const resetGame = () => {
		if (!checkPassword()) {
			alert("Incorrect password! 🎃");
			return;
		}

		if (
			window.confirm(
				"Are you sure you want to reset all stories and votes?"
			)
		) {
			setStories([]);
			setVotes([]);
			localStorage.removeItem("hallostories_stories");
			localStorage.removeItem("hallostories_votes");
			setCurrentView("home");
		}
	};

	return (
		<div className="app">
			<header className="app-header">
				<h1 className="app-title">🎃 HalloStories 🎃</h1>
				<p className="app-subtitle">
					Guess who wrote each spooky tale...
				</p>
			</header>

			{currentView === "home" && (
				<div className="home-view">
					<div className="button-container">
						<button
							className="main-button"
							onClick={() => setCurrentView("submit")}
						>
							📝 Send a Story
						</button>
						<button
							className="main-button"
							onClick={() => setCurrentView("stories")}
							disabled={stories.length === 0}
						>
							📖 Read Stories
						</button>
						<button
							className="main-button"
							onClick={() => setCurrentView("voting")}
							disabled={stories.length === 0}
						>
							🗳️ Vote & Guess
						</button>
						<button
							className="main-button secondary"
							onClick={handleResultsClick}
						>
							🏆 View Results
						</button>
					</div>
					{stories.length > 0 && (
						<div className="game-stats">
							<p>📚 {stories.length} stories submitted</p>
							<p>🗳️ {votes.length} votes cast</p>
							<div className={`voting-status ${votingStatus.allVoted ? 'all-voted' : 'waiting'}`}>
								<div className="status-indicator">
									{votingStatus.allVoted ? '🟢' : '🔴'}
								</div>
								<div className="status-message">
									{votingStatus.message}
								</div>
							</div>
						</div>
					)}
					<button className="reset-button" onClick={resetGame}>
						Reset Game
					</button>
				</div>
			)}

			{currentView === "submit" && (
				<StoryForm
					onSubmit={addStory}
					onBack={() => setCurrentView("home")}
				/>
			)}

			{currentView === "stories" && (
				<Stories
					stories={stories}
					onBack={() => setCurrentView("home")}
				/>
			)}

			{currentView === "voting" && (
				<VotingSection
					stories={stories}
					votes={votes}
					onVote={addVote}
					onBack={() => setCurrentView("home")}
				/>
			)}

			{currentView === "results" && (
				<Results
					stories={stories}
					votes={votes}
					onBack={() => setCurrentView("home")}
				/>
			)}
		</div>
	);
}

export default App;
