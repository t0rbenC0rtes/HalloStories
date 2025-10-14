import { useState } from "react";
import "./StoryForm.css";

function StoryForm({ onSubmit, onBack }) {
	const [name, setName] = useState("");
	const [title, setTitle] = useState("");
	const [story, setStory] = useState("");

	const handleSubmit = (e) => {
		e.preventDefault();
		
		if (!name.trim() || !title.trim() || !story.trim()) {
			alert("Veuillez remplir tous les champs !");
			return;
		}

		onSubmit({
			author: name.trim(),
			title: title.trim(),
			story: story.trim()
		});

		// Reset form
		setName("");
		setTitle("");
		setStory("");

		alert("Histoire soumise avec succès ! 🎃");
	};

	return (
		<div className="story-form-container">
			<button className="back-button" onClick={onBack}>
				← Retour à l'Accueil
			</button>
			
			<h2 className="form-title">📝 Soumettez votre Histoire Effrayante</h2>
			
			<form className="story-form" onSubmit={handleSubmit}>
				<div className="form-group">
					<label htmlFor="name">Votre Nom</label>
					<input
						type="text"
						id="name"
						value={name}
						onChange={(e) => setName(e.target.value)}
						placeholder="Entrez votre nom..."
						maxLength={50}
					/>
				</div>

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

				<button type="submit" className="submit-button">
					🎃 Soumettre l'Histoire
				</button>
			</form>
		</div>
	);
}

export default StoryForm;
