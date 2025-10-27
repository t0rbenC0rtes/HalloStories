import { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import "./App.css";
import StoryForm from "./StoryForm";
import Stories from "./Stories";
import VotingSection from "./VotingSection";
import Results from "./Results";
import AdminModeration from "./AdminModeration";
import PasswordModal from "./PasswordModal";
import MessageModal from "./MessageModal";
import ConfirmModal from "./ConfirmModal";
import { storiesApi, votesApi, gameApi } from "./api";

function App() {
	const [currentView, setCurrentView] = useState("home");
	const [stories, setStories] = useState([]);
	const [votes, setVotes] = useState([]);
	const [playerName, setPlayerName] = useState("");
	const [showRulesModal, setShowRulesModal] = useState(false);
	const [showPasswordModal, setShowPasswordModal] = useState(false);
	const [showResetConfirm, setShowResetConfirm] = useState(false);
	const [messageModal, setMessageModal] = useState({ isOpen: false, message: "", type: "info" });
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// Load data from API on mount
	useEffect(() => {
		const loadData = async () => {
			try {
				setLoading(true);
				const [storiesData, votesData] = await Promise.all([
					storiesApi.getAll(),
					votesApi.getAll(),
				]);
				setStories(storiesData);
				setVotes(votesData);

				// Load player name from localStorage (still client-side only)
				const savedPlayerName = localStorage.getItem("hallostories_player_name");
				if (savedPlayerName) {
					setPlayerName(savedPlayerName);
				}
			} catch (err) {
				console.error('Failed to load data:', err);
				setError('Impossible de charger les données. Vérifiez que le serveur est démarré.');
			} finally {
				setLoading(false);
			}
		};

		loadData();
		
		// Poll for updates every 30 seconds (only fetch data, don't reload page)
		const interval = setInterval(async () => {
			try {
				const [storiesData, votesData] = await Promise.all([
					storiesApi.getAll(),
					votesApi.getAll(),
				]);
				setStories(storiesData);
				setVotes(votesData);
			} catch (err) {
				console.error('Failed to refresh data:', err);
			}
		}, 30000); // 30 seconds
		return () => clearInterval(interval);
	}, []);

	const showMessage = (message, type = "info") => {
		setMessageModal({ isOpen: true, message, type });
	};

	const closeMessage = () => {
		setMessageModal({ isOpen: false, message: "", type: "info" });
	};

	const addStory = async (story) => {
		try {
			const newStory = await storiesApi.create(story);
			setStories([...stories, newStory]);
			setCurrentView("home");
		} catch (err) {
			console.error('Failed to add story:', err);
			showMessage('Erreur lors de la soumission de l\'histoire. Réessayez.', 'error');
		}
	};

	const approveStory = async (storyId) => {
		try {
			const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD;
			const updatedStory = await storiesApi.approve(storyId, adminPassword);
			setStories(
				stories.map((story) =>
					story.id === storyId ? updatedStory : story
				)
			);
		} catch (err) {
			console.error('Failed to approve story:', err);
			showMessage('Erreur lors de l\'approbation de l\'histoire.', 'error');
		}
	};

	const rejectStory = async (storyId) => {
		try {
			const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD;
			const updatedStory = await storiesApi.reject(storyId, adminPassword);
			setStories(
				stories.map((story) =>
					story.id === storyId ? updatedStory : story
				)
			);
		} catch (err) {
			console.error('Failed to reject story:', err);
			showMessage('Erreur lors du rejet de l\'histoire.', 'error');
		}
	};

	const handleSetPlayerName = (name) => {
		setPlayerName(name);
		localStorage.setItem("hallostories_player_name", name);
	};

	const addVote = async (vote) => {
		try {
			const newVote = await votesApi.create(vote);
			setVotes([...votes, newVote]);
		} catch (err) {
			console.error('Failed to add vote:', err);
			showMessage(err.message || 'Erreur lors de la soumission du vote.', 'error');
		}
	};

	// Check if all participants have voted
	const checkVotingStatus = () => {
		const approvedStories = stories.filter(
			(story) => story.status === "approved"
		);
		if (approvedStories.length === 0)
			return {
				allVoted: false,
				message: "Aucune histoire pour le moment",
			};

		// Get all unique participants who have engaged with the game
		// - Story authors MUST vote (they submitted stories)
		// - Anyone who has started voting (has at least 1 vote) MUST complete all votes
		const storyAuthors = [...new Set(approvedStories.map((s) => s.author))];
		const voters = [...new Set(votes.map((v) => v.voter))];
		const allParticipants = [...new Set([...storyAuthors, ...voters])];

		// Check if each participant has voted on ALL stories
		const expectedVotesPerPerson = approvedStories.length;
		const votingComplete = allParticipants.every((participant) => {
			const participantVotes = votes.filter(
				(v) => v.voter === participant
			).length;
			return participantVotes === expectedVotesPerPerson;
		});

		// Count how many participants have completed voting
		const completedParticipants = allParticipants.filter((participant) => {
			const participantVotes = votes.filter(
				(v) => v.voter === participant
			).length;
			return participantVotes === expectedVotesPerPerson;
		}).length;

		return {
			allVoted: votingComplete && allParticipants.length > 0,
			totalParticipants: allParticipants.length,
			totalVotes: votes.length,
			expectedVotes: allParticipants.length * expectedVotesPerPerson,
			message:
				votingComplete && allParticipants.length > 0
					? "Tous les joueurs ont voté ! ✓"
					: `En attente de votes... (${completedParticipants}/${allParticipants.length} joueurs ont terminé)`,
		};
	};

	const votingStatus = checkVotingStatus();

	// Get voting progress for display on button
	const getVotingProgress = () => {
		const approvedStories = stories.filter(
			(story) => story.status === "approved"
		);
		if (approvedStories.length === 0) return null;

		// Use the current playerName from state
		if (!playerName) {
			return {
				text: "Aucun vote pour le moment",
				isComplete: false,
			};
		}

		const userVotes = votes.filter(
			(v) => v.voter === playerName
		).length;
		const isComplete = userVotes === approvedStories.length;

		return {
			text: `${userVotes}/${approvedStories.length} histoires votées`,
			isComplete: isComplete,
		};
	};

	const votingProgress = getVotingProgress();

	const handlePasswordSubmit = (password) => {
		if (password === import.meta.env.VITE_ADMIN_PASSWORD) {
			setShowPasswordModal(false);
			setCurrentView("results");
		} else {
			setShowPasswordModal(false);
			showMessage("Mot de passe incorrect ! 🎃", "error");
		}
	};

	const handleResultsClick = () => {
		setShowPasswordModal(true);
	};

	// Filter approved stories for regular views
	const approvedStories = stories.filter(
		(story) => story.status === "approved"
	);

	const handleResetGame = () => {
		setShowResetConfirm(true);
	};

	const handleConfirmReset = async () => {
		try {
			const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD;
			await gameApi.reset(adminPassword);
			setStories([]);
			setVotes([]);
			setPlayerName("");
			localStorage.removeItem("hallostories_player_name");
			setCurrentView("home");
			showMessage("Jeu réinitialisé avec succès ! 🎃", "success");
		} catch (err) {
			console.error('Failed to reset game:', err);
			showMessage('Erreur lors de la réinitialisation du jeu.', 'error');
		}
	};

	if (loading) {
		return (
			<div className="app">
				<div className="loading-container">
					<h1 className="loading-title">🎃 Chargement...</h1>
					<p>Connexion au serveur...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="app">
				<div className="error-container">
					<h1 className="error-title">❌ Erreur</h1>
					<p>{error}</p>
					<button className="main-button" onClick={() => window.location.reload()}>
						Réessayer
					</button>
				</div>
			</div>
		);
	}

	return (
		<Routes>
			<Route
				path="/admin"
				element={
					<AdminModeration
						stories={stories}
						onApprove={approveStory}
						onReject={rejectStory}
						onResetGame={handleResetGame}
					/>
				}
			/>
			<Route
				path="/"
				element={
					<div className="app">
						<header className="app-header">
							<h1 className="app-title">
								<img
									src="/peur2rien.png"
									alt=""
									style={{
										width: "70px",
										transform: "rotateY(180deg)",
									}}
								/>
								HalloStories
								<img
									src="/peur2rien.png"
									alt=""
									style={{ width: "70px" }}
								/>
							</h1>
							<p className="app-subtitle">
								Devinez qui a écrit chaque histoire macabre...
							</p>
						</header>

						{currentView === "home" && (
							<div className="home-view">
								<div className="home-content">
									<img
										src="/morphwings.gif"
										alt="Halloween decoration"
										className="side-gif left-gif"
									/>

									<div className="button-container">
										<button
											className="main-button"
											onClick={() =>
												setCurrentView("submit")
											}
										>
											Envoyer une Histoire
										</button>
										<button
											className="main-button"
											onClick={() =>
												setCurrentView("stories")
											}
											disabled={
												approvedStories.length === 0
											}
										>
											Lire les Histoires
										</button>
										<button
											className="main-button voting-button"
											onClick={() =>
												setCurrentView("voting")
											}
											disabled={
												approvedStories.length === 0
											}
										>
											<span className="button-text">
												Voter & Deviner
											</span>
											{votingProgress && (
												<span
													className={`voting-progress ${
														votingProgress.isComplete
															? "complete"
															: "incomplete"
													}`}
												>
													{votingProgress.text}
												</span>
											)}
										</button>
										<button
											className="main-button secondary"
											onClick={handleResultsClick}
										>
											Voir les Résultats
										</button>
										<button
											className="main-button rules-button"
											onClick={() =>
												setShowRulesModal(true)
											}
										>
											Règles du Jeu
										</button>
									</div>

									<img
										src="/morphwings.gif"
										alt="Halloween decoration"
										className="side-gif right-gif"
									/>
								</div>

								{approvedStories.length > 0 && (
									<div className="game-stats">
										<p>
											📚 {approvedStories.length}{" "}
											histoires envoyées
										</p>
										<p>🗳️ {votes.length} votes exprimés</p>
										<div
											className={`voting-status ${
												votingStatus.allVoted
													? "all-voted"
													: "waiting"
											}`}
										>
											<div className="status-indicator">
												{votingStatus.allVoted
													? "🟢"
													: "🔴"}
											</div>
											<div className="status-message">
												{votingStatus.message}
											</div>
										</div>
									</div>
								)}

								{showRulesModal && (
									<div
										className="modal-overlay"
										onClick={() => setShowRulesModal(false)}
									>
										<div
											className="modal-content"
											onClick={(e) => e.stopPropagation()}
										>
											<h2 className="modal-title">
												📜 Règles du Jeu
											</h2>
											<div className="modal-body">
												<h3>🎯 Objectif</h3>
												<p>
													Devinez qui a écrit chaque
													histoire et si elle est
													vraie ou fausse !
												</p>

												<h3>
													📝 Phase 1 : Soumission des
													Histoires
												</h3>
												<ul>
													<li>
														Chaque joueur soumet une
														histoire qui lui est
														arrivée (vraie ou
														inventée)
													</li>
													<li>
														Indiquez si votre
														histoire est vraie ou
														fausse
													</li>
												</ul>

												<h3>📖 Phase 2 : Lecture</h3>
												<ul>
													<li>
														Lisez toutes les
														histoires soumises
													</li>
													<li>
														Essayez de deviner qui a
														écrit quoi
													</li>
												</ul>

												<h3>🗳️ Phase 3 : Vote</h3>
												<ul>
													<li>
														Pour chaque histoire,
														devinez l'auteur
													</li>
													<li>
														Devinez aussi si
														l'histoire est vraie ou
														fausse
													</li>
													<li>
														Une fois votre vote
														soumis, il ne peut pas
														être modifié !
													</li>
												</ul>

												<h3>🏆 Phase 4 : Résultats</h3>
												<ul>
													<li>
														<strong>1 point</strong>{" "}
														si vous devinez
														correctement l'auteur
													</li>
													<li>
														<strong>1 point</strong>{" "}
														si vous devinez si
														l'histoire est
														vraie/fausse
													</li>
													<li>
														<strong>
															Maximum 2 points par
															histoire
														</strong>
													</li>
													<li>
														Le joueur avec le plus
														de points gagne !
													</li>
												</ul>

												<div className="modal-tip">
													💡 <strong>Astuce :</strong>{" "}
													Soyez créatif avec vos
													histoires pour tromper les
													autres joueurs !
												</div>
											</div>
											<button
												className="modal-close-button"
												onClick={() =>
													setShowRulesModal(false)
												}
											>
												Fermer
											</button>
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
								showMessage={showMessage}
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
								showMessage={showMessage}
							/>
						)}

						{currentView === "results" && (
							<Results
								stories={approvedStories}
								votes={votes}
								onBack={() => setCurrentView("home")}
							/>
						)}

						<PasswordModal
							isOpen={showPasswordModal}
							onClose={() => setShowPasswordModal(false)}
							onSubmit={handlePasswordSubmit}
							title="Accès aux Résultats"
						/>

						<MessageModal
							isOpen={messageModal.isOpen}
							onClose={closeMessage}
							message={messageModal.message}
							type={messageModal.type}
						/>

						<ConfirmModal
							isOpen={showResetConfirm}
							onClose={() => setShowResetConfirm(false)}
							onConfirm={handleConfirmReset}
							message="Êtes-vous sûr de vouloir réinitialiser toutes les histoires et votes ?"
							confirmText="Réinitialiser"
							cancelText="Annuler"
						/>
					</div>
				}
			/>
		</Routes>
	);
}

export default App;
