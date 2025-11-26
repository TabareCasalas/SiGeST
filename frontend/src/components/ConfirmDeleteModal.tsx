import { FaExclamationTriangle, FaTrash } from 'react-icons/fa';
import './ConfirmDeleteModal.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  itemName?: string;
  warningText?: string;
  loading?: boolean;
}

export function ConfirmDeleteModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Confirmar Eliminación',
  message,
  itemName,
  warningText,
  loading = false 
}: Props) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="confirm-delete-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-icon">
            <FaExclamationTriangle className="icon-delete" />
          </div>
          <h2>{title}</h2>
        </div>
        <div className="modal-body">
          <p className="confirm-message">
            {message}
          </p>
          {itemName && (
            <div className="item-info">
              <div className="info-row">
                <span className="info-label">Elemento:</span>
                <span className="info-value">{itemName}</span>
              </div>
            </div>
          )}
          {warningText && (
            <div className="danger-box">
              <FaExclamationTriangle className="danger-icon" />
              <div>
                <p className="danger-title">⚠️ Esta acción no se puede deshacer</p>
                <p className="danger-text">{warningText}</p>
              </div>
            </div>
          )}
        </div>
        <div className="modal-actions">
          <button
            type="button"
            className="btn-cancel"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="btn-confirm-delete"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              'Eliminando...'
            ) : (
              <>
                <FaTrash /> Eliminar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

