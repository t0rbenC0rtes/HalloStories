import { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import "./App.css";
import StoryForm from "./StoryForm";
import Stories from "./Stories";
import VotingSection from "./VotingSection";
import Results from "./Results";
import AdminModeration from "./AdminModeration";

function App() {
	const [currentView, setCurrentView] = useState("home");
	const [stories, setStories] = useState([]);
	const [votes, setVotes] = useState([]);
	const [playerName, setPlayerName] = useState("");

	// Load data from localStorage on mount
	useEffect(() => {
		const savedStories = localStorage.getItem("hallostories_stories");
		const savedVotes = localStorage.getItem("hallostories_votes");
		const savedPlayerName = localStorage.getItem("hallostories_player_name");

		if (savedStories) {
			setStories(JSON.parse(savedStories));
		}
		if (savedVotes) {
			setVotes(JSON.parse(savedVotes));
		}
		if (savedPlayerName) {
			setPlayerName(savedPlayerName);
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
			status: "pending", // All new stories start as pending
			timestamp: new Date().toISOString(),
		};
		setStories([...stories, newStory]);
		setCurrentView("home"); // Navigate back to home after submitting story
	};

	const approveStory = (storyId) => {
		setStories(stories.map(story =>
			story.id === storyId ? { ...story, status: "approved" } : story
		));
	};

	const rejectStory = (storyId) => {
		setStories(stories.map(story =>
			story.id === storyId ? { ...story, status: "rejected" } : story
		));
	};

	const handleSetPlayerName = (name) => {
		setPlayerName(name);
		localStorage.setItem("hallostories_player_name", name);
	};

	const addVote = (vote) => {
		setVotes([...votes, vote]);
	};

	// Check if all participants have voted
	const checkVotingStatus = () => {
		const approvedStories = stories.filter(story => story.status === "approved");
		if (approvedStories.length === 0) return { allVoted: false, message: "Aucune histoire pour le moment" };

		// Get all unique participants (story authors + voters)
		const storyAuthors = [...new Set(approvedStories.map(s => s.author))];
		const voters = [...new Set(votes.map(v => v.voter))];
		const allParticipants = [...new Set([...storyAuthors, ...voters])];

		// Check if each participant has voted on all stories
		const expectedVotesPerPerson = approvedStories.length;
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
				? "Tous les joueurs ont voté ! ✓"
				: `En attente de votes... (${votes.length}/${allParticipants.length * expectedVotesPerPerson})`
		};
	};

	const votingStatus = checkVotingStatus();

	// Get voting progress for display on button
	const getVotingProgress = () => {
		const approvedStories = stories.filter(story => story.status === "approved");
		if (approvedStories.length === 0) return null;
		
		// Try to get voter name from recent votes or localStorage
		const recentVoter = votes.length > 0 ? votes[votes.length - 1].voter : null;
		const savedVoterName = localStorage.getItem("hallostories_voter_name") || recentVoter;
		
		if (!savedVoterName) {
			return {
				text: "Aucun vote pour le moment",
				isComplete: false
			};
		}

		const userVotes = votes.filter(v => v.voter === savedVoterName).length;
		const isComplete = userVotes === approvedStories.length;

		return {
			text: `${userVotes}/${approvedStories.length} histoires votées`,
			isComplete: isComplete
		};
	};

	const votingProgress = getVotingProgress();

	const checkPassword = () => {
		const password = prompt("Entrez le mot de passe administrateur :");
		return password === import.meta.env.VITE_ADMIN_PASSWORD;
	};

	const handleResultsClick = () => {
		if (checkPassword()) {
			setCurrentView("results");
		} else {
			alert("Mot de passe incorrect ! 🎃");
		}
	};



	// Filter approved stories for regular views
	const approvedStories = stories.filter(story => story.status === "approved");

	const handleResetGame = () => {
		if (
			window.confirm(
				"Êtes-vous sûr de vouloir réinitialiser toutes les histoires et votes ?"
			)
		) {
			setStories([]);
			setVotes([]);
			setPlayerName("");
			localStorage.removeItem("hallostories_stories");
			localStorage.removeItem("hallostories_votes");
			localStorage.removeItem("hallostories_player_name");
			localStorage.removeItem("hallostories_voter_name");
			setCurrentView("home");
		}
	};

	return (
		<Routes>
			<Route path="/admin" element={
				<AdminModeration
					stories={stories}
					onApprove={approveStory}
					onReject={rejectStory}
					onResetGame={handleResetGame}
				/>
			} />
			<Route path="/" element={
				<div className="app">
					<header className="app-header">
						<h1 className="app-title">🎃 HalloStories 🎃</h1>
						<p className="app-subtitle">
							Devinez qui a écrit chaque histoire macabre...
						</p>
					</header>

					{currentView === "home" && (
				<div className="home-view">
					<div className="home-content">
						<img src="/morphwings.gif" alt="Halloween decoration" className="side-gif left-gif" />
						
						<div className="button-container">
							<button
								className="main-button"
								onClick={() => setCurrentView("submit")}
							>
								📝 Envoyer une Histoire
							</button>
						<button
							className="main-button"
							onClick={() => setCurrentView("stories")}
							disabled={approvedStories.length === 0}
						>
							📖 Lire les Histoires
						</button>
						<button
							className="main-button voting-button"
							onClick={() => setCurrentView("voting")}
							disabled={approvedStories.length === 0}
						>
							<span className="button-text">🗳️ Voter & Deviner</span>
							{votingProgress && (
								<span className={`voting-progress ${votingProgress.isComplete ? 'complete' : 'incomplete'}`}>
									{votingProgress.text}
								</span>
							)}
						</button>
						<button
							className="main-button secondary"
							onClick={handleResultsClick}
						>
							🏆 Voir les Résultats
						</button>
						</div>
						
						<img src="/morphwings.gif" alt="Halloween decoration" className="side-gif right-gif" />
					</div>
					
					{approvedStories.length > 0 && (
						<div className="game-stats">
							<p>📚 {approvedStories.length} histoires approuvées</p>
							<p>🗳️ {votes.length} votes exprimés</p>
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
				</div>
			)}

			{currentView === "submit" && (
				<StoryForm
					onSubmit={addStory}
					onBack={() => setCurrentView("home")}
					playerName={playerName}
					setPlayerName={handleSetPlayerName}
				/>
			)}

			{currentView === "stories" && (
				<Stories
					stories={approvedStories}
					onBack={() => setCurrentView("home")}
				/>
			)}

			{currentView === "voting" && (
				<VotingSection
					stories={approvedStories}
					votes={votes}
					onVote={addVote}
					onBack={() => setCurrentView("home")}
					playerName={playerName}
					setPlayerName={handleSetPlayerName}
				/>
			)}

			{currentView === "results" && (
				<Results
					stories={approvedStories}
					votes={votes}
					onBack={() => setCurrentView("home")}
				/>
			)}
				</div>
			} />
		</Routes>
	);
}

export default App;
