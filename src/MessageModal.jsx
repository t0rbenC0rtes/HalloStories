import "./MessageModal.css";

function MessageModal({ isOpen, onClose, message, type = "info" }) {
	if (!isOpen) return null;

	const getIcon = () => {
		switch (type) {
			case "success":
				return "✓";
			case "error":
				return "⚠";
			case "warning":
				return "⚡";
			default:
				return "ℹ";
		}
	};

	return (
		<div className="message-modal-overlay" onClick={onClose}>
			<div className="message-modal-content" onClick={(e) => e.stopPropagation()}>
				<div className={`message-modal-icon ${type}`}>
					{getIcon()}
				</div>
				<div className="message-modal-text">{message}</div>
				<button onClick={onClose} className="message-modal-button">
					OK
				</button>
			</div>
		</div>
	);
}

export default MessageModal;
