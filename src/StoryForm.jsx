import { useState } from "react";
import "./StoryForm.css";

function StoryForm({ onSubmit, onBack }) {
	const [name, setName] = useState("");
	const [title, setTitle] = useState("");
	const [story, setStory] = useState("");

	const handleSubmit = (e) => {
		e.preventDefault();
		
		if (!name.trim() || !title.trim() || !story.trim()) {
			alert("Please fill in all fields!");
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

		alert("Story submitted successfully! 🎃");
	};

	return (
		<div className="story-form-container">
			<button className="back-button" onClick={onBack}>
				← Back to Home
			</button>
			
			<h2 className="form-title">📝 Submit Your Spooky Story</h2>
			
			<form className="story-form" onSubmit={handleSubmit}>
				<div className="form-group">
					<label htmlFor="name">Your Name</label>
					<input
						type="text"
						id="name"
						value={name}
						onChange={(e) => setName(e.target.value)}
						placeholder="Enter your name..."
						maxLength={50}
					/>
				</div>

				<div className="form-group">
					<label htmlFor="title">Story Title</label>
					<input
						type="text"
						id="title"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						placeholder="A short, mysterious title..."
						maxLength={100}
					/>
				</div>

				<div className="form-group">
					<label htmlFor="story">Your Story</label>
					<textarea
						id="story"
						value={story}
						onChange={(e) => setStory(e.target.value)}
						placeholder="Tell us your spooky tale..."
						rows={10}
					/>
				</div>

				<button type="submit" className="submit-button">
					🎃 Submit Story
				</button>
			</form>
		</div>
	);
}

export default StoryForm;
