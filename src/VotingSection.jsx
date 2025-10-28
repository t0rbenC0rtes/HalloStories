import { useState, useEffect } from "react";
import ConfirmModal from "./ConfirmModal";
import "./VotingSection.css";

function VotingSection({ stories, votes, onVote, onBack, playerName, setPlayerName, showMessage }) {
	const [voterName, setVoterName] = useState(playerName || "");
	const [hasEnteredName, setHasEnteredName] = useState(!!playerName);
	const [showNamePrompt, setShowNamePrompt] = useState(!playerName);
	const [userVotes, setUserVotes] = useState({});
	const [pendingVotes, setPendingVotes] = useState({});
	const [showBatchConfirm, setShowBatchConfirm] = useState(false);

	// Get unique author names (no duplicates)
	const authors = [...new Set(stories.map(story => story.author))].sort();

	// Check which stories this voter has already voted on
	useEffect(() => {
		if (hasEnteredName && playerName) {
			const myVotes = votes.filter(v => v.voter === playerName);
			const votesMap = {};
			myVotes.forEach(v => {
				// Handle both snake_case (from Supabase) and camelCase (legacy)
				const storyId = v.story_id || v.storyId;
				const guessedAuthor = v.guessed_author || v.guessedAuthor;
				const guessedReal = v.guessed_real !== undefined ? v.guessed_real : v.guessedReal;
				
				votesMap[storyId] = {
					guessedAuthor: guessedAuthor,
					guessedReal: guessedReal
				};
			});
			setUserVotes(votesMap);
		}
	}, [hasEnteredName, playerName, votes]);

	const handleNameSubmit = (e) => {
		e.preventDefault();
		if (!voterName.trim()) {
			showMessage("Veuillez entrer votre nom !", "warning");
			return;
		}
		setPlayerName(voterName.trim());
		setHasEnteredName(true);
		setShowNamePrompt(false);
	};

	const handleAuthorChange = (storyId, guessedAuthor) => {
		setPendingVotes({
			...pendingVotes,
			[storyId]: {
				...pendingVotes[storyId],
				guessedAuthor
			}
		});
	};

	const handleRealFakeChange = (storyId, guessedReal) => {
		setPendingVotes({
			...pendingVotes,
			[storyId]: {
				...pendingVotes[storyId],
				guessedReal: guessedReal === "true"
			}
		});
	};

	// Get ready votes (complete selections that haven't been submitted yet)
	const getReadyVotes = () => {
		const ready = [];
		Object.entries(pendingVotes).forEach(([storyId, vote]) => {
			// Only include if not already voted and has both fields filled
			if (!userVotes[storyId] && vote.guessedAuthor && vote.guessedReal !== undefined) {
				ready.push({ storyId, ...vote });
			}
		});
		return ready;
	};

	const handleBatchSubmit = () => {
		const readyVotes = getReadyVotes();
		if (readyVotes.length === 0) {
			showMessage("Veuillez sélectionner un auteur ET si l'histoire est vraie ou fausse pour au moins une histoire !", "warning");
			return;
		}
		setShowBatchConfirm(true);
	};

	const handleConfirmBatchVotes = () => {
		const readyVotes = getReadyVotes();
		
		// Submit all ready votes
		readyVotes.forEach(({ storyId, guessedAuthor, guessedReal }) => {
			onVote({
				voter: playerName,
				storyId: storyId,
				guessedAuthor: guessedAuthor,
				guessedReal: guessedReal,
				timestamp: new Date().toISOString()
			});
		});

		// Update local state to reflect all submitted votes
		const newUserVotes = { ...userVotes };
		const newPendingVotes = { ...pendingVotes };
		
		readyVotes.forEach(({ storyId, guessedAuthor, guessedReal }) => {
			newUserVotes[storyId] = { guessedAuthor, guessedReal };
			delete newPendingVotes[storyId];
		});

		setUserVotes(newUserVotes);
		setPendingVotes(newPendingVotes);

		const count = readyVotes.length;
		showMessage(`${count} vote${count > 1 ? 's' : ''} enregistré${count > 1 ? 's' : ''} ! 🎃`, "success");
	};

	if (showNamePrompt) {
		return (
			<div className="voting-container">
				<button className="back-button" onClick={onBack}>
					← Retour à l'Accueil
				</button>
				
				<h2 className="voting-title">🗳️ Entrer dans le Vote</h2>
				<p className="voting-subtitle">Qui êtes-vous ?</p>

				<form className="voter-name-form" onSubmit={handleNameSubmit}>
					<input
						type="text"
						value={voterName}
						onChange={(e) => setVoterName(e.target.value)}
						placeholder="Entrez votre nom..."
						maxLength={50}
						className="voter-name-input"
					/>
					<button type="submit" className="enter-voting-button">
						Entrer dans l'Espace Vote
					</button>
				</form>
			</div>
		);
	}

	return (
		<div className="voting-container">
			<button className="back-button" onClick={onBack}>
				← Retour à l'Accueil
			</button>
			
			<h2 className="voting-title">🗳️ Devinez les Auteurs</h2>
			<p className="voting-subtitle">Vous votez en tant que : <strong>{playerName}</strong></p>

			<div className="voting-list">
				{stories.map((story, index) => {
					const isLocked = !!userVotes[story.id];
					const pending = pendingVotes[story.id] || {};
					
					return (
						<div key={story.id} className={`voting-card ${isLocked ? 'locked' : ''}`}>
							<div className="voting-story-number">Histoire #{index + 1}</div>
							<h3 className="voting-story-title">{story.title}</h3>
							
							{isLocked ? (
								<div className="vote-locked-display">
									<p>✓ Vote enregistré :</p>
									<p>Auteur : <strong>{userVotes[story.id].guessedAuthor}</strong></p>
									<p>Histoire : <strong>{userVotes[story.id].guessedReal ? "Vraie" : "Fausse"}</strong></p>
								</div>
							) : (
								<>
									<div className="voting-controls">
										<label htmlFor={`vote-author-${story.id}`}>Qui a écrit ceci ?</label>
										<select
											id={`vote-author-${story.id}`}
											value={pending.guessedAuthor || ""}
											onChange={(e) => handleAuthorChange(story.id, e.target.value)}
										>
											<option value="">-- Sélectionnez un Auteur --</option>
											{authors.map(author => (
												<option key={author} value={author}>
													{author}
												</option>
											))}
										</select>
									</div>

									<div className="voting-controls">
										<label>Cette histoire est-elle... ?</label>
										<div className="radio-group">
											<label className="radio-label">
												<input
													type="radio"
													name={`real-${story.id}`}
													value="true"
													checked={pending.guessedReal === true}
													onChange={(e) => handleRealFakeChange(story.id, e.target.value)}
												/>
												<span>Vraie</span>
											</label>
											<label className="radio-label">
												<input
													type="radio"
													name={`real-${story.id}`}
													value="false"
													checked={pending.guessedReal === false}
													onChange={(e) => handleRealFakeChange(story.id, e.target.value)}
												/>
												<span>Fausse</span>
											</label>
										</div>
									</div>
								</>
							)}
						</div>
					);
				})}
			</div>

			<div className="voting-stats">
				<p>Vous avez voté pour {Object.keys(userVotes).length} sur {stories.length} histoires</p>
			</div>

			<button 
				className="batch-vote-button"
				onClick={handleBatchSubmit}
				disabled={getReadyVotes().length === 0}
			>
				Voter ({getReadyVotes().length} {getReadyVotes().length > 1 ? 'histoires prêtes' : 'histoire prête'})
			</button>

			<ConfirmModal
				isOpen={showBatchConfirm}
				onClose={() => setShowBatchConfirm(false)}
				onConfirm={handleConfirmBatchVotes}
				message="Confirmer le vote ? Vous pouvez voter plusieurs fois, mais les votes ne peuvent pas être modifiés."
				confirmText="Confirmer"
				cancelText="Annuler"
			/>
		</div>
	);
}

export default VotingSection;
