import { useState } from "react";
import "./Stories.css";

function Stories({ stories, onBack }) {
	const [expandedStories, setExpandedStories] = useState({});

	const toggleStory = (storyId) => {
		setExpandedStories(prev => ({
			...prev,
			[storyId]: !prev[storyId]
		}));
	};

	// Truncate story to show first 2 lines (approximately 100 characters)
	const getPreview = (text) => {
		const maxLength = 100;
		if (text.length <= maxLength) return text;
		return text.substring(0, maxLength) + "...";
	};

	return (
		<div className="stories-container">
			<button className="back-button" onClick={onBack}>
				← Retour à l'Accueil
			</button>
			
			<h2 className="stories-title">📖 Toutes les Histoires</h2>
			<p className="stories-subtitle">Lisez les contes avant de voter...</p>

			<div className="stories-list">
				{stories.length === 0 ? (
					<p className="no-stories">Aucune histoire pour le moment... Soyez le premier à partager ! 👻</p>
				) : (
					stories.map((story, index) => {
						const isExpanded = expandedStories[story.id];
						
						return (
							<div 
								key={story.id} 
								className={`story-card ${isExpanded ? 'expanded' : 'collapsed'}`}
								onClick={() => toggleStory(story.id)}
							>
								<div className="story-header">
									<div className="story-header-left">
										<div className="story-number">Histoire #{index + 1}</div>
										<h3 className="story-title">{story.title}</h3>										
									</div>
									<div className="expand-icon">
										{isExpanded ? '▲' : '▼'}
									</div>
								</div>
								
								<div className={`story-content ${isExpanded ? 'show' : 'hide'}`}>
									{isExpanded ? story.story : getPreview(story.story)}
								</div>
							</div>
						);
					})
				)}
			</div>
		</div>
	);
}

export default Stories;
