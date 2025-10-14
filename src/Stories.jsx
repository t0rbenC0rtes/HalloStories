import "./Stories.css";

function Stories({ stories, onBack }) {
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
					stories.map((story, index) => (
						<div key={story.id} className="story-card">
							<div className="story-number">Histoire #{index + 1}</div>
							<h3 className="story-title">{story.title}</h3>
							<div className="story-content">
								{story.story}
							</div>
						</div>
					))
				)}
			</div>
		</div>
	);
}

export default Stories;
