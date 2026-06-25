import { Modal } from "./Modal";

export function ConfirmDialog({ isOpen, onClose, onConfirm, title = "Confirm Action", message, confirmLabel = "Confirm", danger = false }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">{message}</p>
      <div className="flex gap-2 justify-end">
        <button className="btn-secondary" onClick={onClose}>Cancel</button>
        <button className={danger ? "btn-danger" : "btn-primary"} onClick={() => { onConfirm(); onClose(); }}>
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
