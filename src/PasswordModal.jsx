import { useState } from "react";
import "./PasswordModal.css";

function PasswordModal({ isOpen, onClose, onSubmit, title = "Mot de passe requis" }) {
	const [password, setPassword] = useState("");

	if (!isOpen) return null;

	const handleSubmit = (e) => {
		e.preventDefault();
		onSubmit(password);
		setPassword("");
	};

	const handleCancel = () => {
		setPassword("");
		onClose();
	};

	return (
		<div className="password-modal-overlay" onClick={handleCancel}>
			<div className="password-modal-content" onClick={(e) => e.stopPropagation()}>
				<h3 className="password-modal-title">{title}</h3>
				<form onSubmit={handleSubmit}>
					<input
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						placeholder="Mot de passe..."
						className="password-modal-input"
						autoFocus
						autoComplete="off"
						autoCorrect="off"
						autoCapitalize="off"
						spellCheck="false"
					/>
					<div className="password-modal-buttons">
						<button type="button" onClick={handleCancel} className="password-modal-cancel">
							Annuler
						</button>
						<button type="submit" className="password-modal-submit">
							Confirmer
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}

export default PasswordModal;
