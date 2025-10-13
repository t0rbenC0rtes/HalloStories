import "./Stories.css";

function Stories({ stories, onBack }) {
	return (
		<div className="stories-container">
			<button className="back-button" onClick={onBack}>
				← Back to Home
			</button>
			
			<h2 className="stories-title">📖 All Stories</h2>
			<p className="stories-subtitle">Read the tales before you vote...</p>

			<div className="stories-list">
				{stories.length === 0 ? (
					<p className="no-stories">No stories yet... Be the first to share! 👻</p>
				) : (
					stories.map((story, index) => (
						<div key={story.id} className="story-card">
							<div className="story-number">Story #{index + 1}</div>
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
