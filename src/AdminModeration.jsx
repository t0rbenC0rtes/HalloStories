import { useState } from "react";
import "./AdminModeration.css";

function AdminModeration({ stories, onApprove, onReject }) {
	const [password, setPassword] = useState("");
	const [isAuthenticated, setIsAuthenticated] = useState(false);

	const handlePasswordSubmit = (e) => {
		e.preventDefault();
		if (password === import.meta.env.VITE_ADMIN_PASSWORD) {
			setIsAuthenticated(true);
		} else {
			alert("Mot de passe incorrect !");
			setPassword("");
		}
	};

	if (!isAuthenticated) {
		return (
			<div className="admin-container">
				<div className="admin-login">
					<h1 className="admin-title">🔒 Accès Administrateur</h1>
					<p className="admin-subtitle">Modération des Histoires</p>
					
					<form onSubmit={handlePasswordSubmit} className="admin-password-form">
						<input
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder="Mot de passe..."
							className="admin-password-input"
						/>
						<button type="submit" className="admin-login-button">
							Se Connecter
						</button>
					</form>
				</div>
			</div>
		);
	}

	const pendingStories = stories.filter(story => story.status === "pending");
	const approvedStories = stories.filter(story => story.status === "approved");
	const rejectedStories = stories.filter(story => story.status === "rejected");

	return (
		<div className="admin-container">
			<div className="admin-header">
				<h1 className="admin-title">👻 Modération des Histoires</h1>
				<div className="admin-stats">
					<span className="stat-badge pending">⏳ En attente: {pendingStories.length}</span>
					<span className="stat-badge approved">✅ Approuvées: {approvedStories.length}</span>
					<span className="stat-badge rejected">❌ Rejetées: {rejectedStories.length}</span>
				</div>
			</div>

			{pendingStories.length === 0 ? (
				<div className="no-pending">
					<p>🎉 Aucune histoire en attente de modération</p>
				</div>
			) : (
				<div className="moderation-list">
					{pendingStories.map((story, index) => (
						<div key={story.id} className="moderation-card">
							<div className="moderation-header">
								<span className="story-number">Histoire #{index + 1}</span>
								<span className="story-type">
									{story.isReal ? "🟢 Vraie" : "🔴 Fausse"}
								</span>
							</div>
							
							<h3 className="moderation-story-title">{story.title}</h3>
							<p className="moderation-author">Par : <strong>{story.author}</strong></p>
							<p className="moderation-story-text">{story.story}</p>
							
							<div className="moderation-actions">
								<button
									className="approve-button"
									onClick={() => onApprove(story.id)}
								>
									✅ Approuver
								</button>
								<button
									className="reject-button"
									onClick={() => onReject(story.id)}
								>
									❌ Rejeter
								</button>
							</div>
						</div>
					))}
				</div>
			)}

			{(approvedStories.length > 0 || rejectedStories.length > 0) && (
				<div className="moderation-history">
					<h2 className="history-title">📋 Historique</h2>
					
					{approvedStories.length > 0 && (
						<div className="history-section">
							<h3 className="history-subtitle">✅ Histoires Approuvées ({approvedStories.length})</h3>
							<div className="history-list">
								{approvedStories.map((story) => (
									<div key={story.id} className="history-item approved">
										<strong>{story.title}</strong> - {story.author}
									</div>
								))}
							</div>
						</div>
					)}

					{rejectedStories.length > 0 && (
						<div className="history-section">
							<h3 className="history-subtitle">❌ Histoires Rejetées ({rejectedStories.length})</h3>
							<div className="history-list">
								{rejectedStories.map((story) => (
									<div key={story.id} className="history-item rejected">
										<strong>{story.title}</strong> - {story.author}
									</div>
								))}
							</div>
						</div>
					)}
				</div>
			)}
		</div>
	);
}

export default AdminModeration;
