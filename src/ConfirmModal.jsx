import "./ConfirmModal.css";

function ConfirmModal({
	isOpen,
	onClose,
	onConfirm,
	message,
	confirmText = "Confirmer",
	cancelText = "Annuler",
}) {
	if (!isOpen) return null;

	const handleConfirm = () => {
		onConfirm();
		onClose();
	};

	return (
		<div className="confirm-modal-overlay" onClick={onClose}>
			<div
				className="confirm-modal-content"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="confirm-modal-icon">⚠</div>
				<div className="confirm-modal-text">{message}</div>
				<div className="confirm-modal-buttons">
					<button
						onClick={handleConfirm}
						className="confirm-modal-confirm"
					>
						{confirmText}
					</button>
					<button onClick={onClose} className="confirm-modal-cancel">
						{cancelText}
					</button>
				</div>
			</div>
		</div>
	);
}

export default ConfirmModal;
