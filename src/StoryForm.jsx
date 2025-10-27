import { useState } from "react";
import "./StoryForm.css";

function StoryForm({ onSubmit, onBack, playerName, setPlayerName, showMessage }) {
	const [name, setName] = useState(playerName || "");
	const [title, setTitle] = useState("");
	const [story, setStory] = useState("");
	const [isReal, setIsReal] = useState("");
	const [showNamePrompt, setShowNamePrompt] = useState(!playerName);

	const handleNameSubmit = (e) => {
		e.preventDefault();
		if (!name.trim()) {
			showMessage("Veuillez entrer votre nom !", "warning");
			return;
		}
		setPlayerName(name.trim());
		setShowNamePrompt(false);
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		
		if (!title.trim() || !story.trim() || !isReal) {
			showMessage("Veuillez remplir tous les champs !", "warning");
			return;
		}

		if (!window.confirm("Êtes-vous sûr de vouloir soumettre cette histoire ? Elle ne pourra pas être modifiée.")) {
			return;
		}

		onSubmit({
			author: playerName,
			title: title.trim(),
			story: story.trim(),
			isReal: isReal === "true"
		});

		// Reset form (but keep player name)
		setTitle("");
		setStory("");
		setIsReal("");

		showMessage("Histoire soumise avec succès ! 🎃", "success");
	};

	if (showNamePrompt) {
		return (
			<div className="story-form-container">
				<button className="back-button" onClick={onBack}>
					← Retour à l'Accueil
				</button>
				
				<h2 className="form-title">📝 Qui êtes-vous ?</h2>
				<p className="form-subtitle">Entrez votre nom pour continuer</p>
				<p className="form-subtitle" style={{color:"red",fontFamily:"roboto",background:"white"}}>ATTENTION, veuillez utiliser votre pseudo twitch pour qu'on puisse vous reconnaître. Ce pseudo est définitif et ne peut être modifié.</p>
				
				<form className="player-name-form" onSubmit={handleNameSubmit}>
					<input
						type="text"
						value={name}
						onChange={(e) => setName(e.target.value)}
						placeholder="Entrez votre nom..."
						maxLength={50}
						className="player-name-input"
					/>
					<button type="submit" className="submit-button">
						Continuer
					</button>
				</form>
			</div>
		);
	}

	return (
		<div className="story-form-container">
			<button className="back-button" onClick={onBack}>
				← Retour à l'Accueil
			</button>
			
			<h2 className="form-title">📝 Soumettez votre Histoire Effrayante</h2>
			<p className="form-subtitle">Auteur : <strong>{playerName}</strong></p>
			
			<form className="story-form" onSubmit={handleSubmit}>
				<div className="form-group">
					<label htmlFor="title">Titre de l'Histoire</label>
					<input
						type="text"
						id="title"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						placeholder="Un titre court et mystérieux..."
						maxLength={100}
					/>
				</div>

				<div className="form-group">
					<label htmlFor="story">Votre Histoire</label>
					<textarea
						id="story"
						value={story}
						onChange={(e) => setStory(e.target.value)}
						placeholder="Racontez-nous votre conte macabre..."
						rows={10}
					/>
				</div>

				<div className="form-group">
					<label>Cette histoire est-elle... ?</label>
					<div className="radio-group">
						<label className="radio-label">
							<input
								type="radio"
								name="isReal"
								value="true"
								checked={isReal === "true"}
								onChange={(e) => setIsReal(e.target.value)}
							/>
							<span>Vraie</span>
						</label>
						<label className="radio-label">
							<input
								type="radio"
								name="isReal"
								value="false"
								checked={isReal === "false"}
								onChange={(e) => setIsReal(e.target.value)}
							/>
							<span>Fausse</span>
						</label>
					</div>
				</div>

				<button type="submit" className="submit-button">
					🎃 Soumettre l'Histoire
				</button>
			</form>
		</div>
	);
}

export default StoryForm;
