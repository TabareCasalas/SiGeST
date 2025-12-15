import { FaExclamationTriangle, FaTrash } from 'react-icons/fa';
import './ConfirmDeleteGrupoModal.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  grupo: {
    id_grupo: number;
    nombre: string;
  } | null;
  loading?: boolean;
}

export function ConfirmDeleteGrupoModal({ isOpen, onClose, onConfirm, grupo, loading = false }: Props) {
  if (!isOpen || !grupo) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="confirm-delete-grupo-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-icon">
            <FaExclamationTriangle className="icon-delete" />
          </div>
          <h2>Eliminar Grupo</h2>
        </div>
        <div className="modal-body">
          <p className="confirm-message">
            ¿Está seguro de que desea <strong>eliminar</strong> permanentemente el grupo?
          </p>
          <div className="grupo-info">
            <div className="info-row">
              <span className="info-label">Nombre del Grupo:</span>
              <span className="info-value">{grupo.nombre}</span>
            </div>
          </div>
          <div className="danger-box">
            <FaExclamationTriangle className="danger-icon" />
            <div>
              <p className="danger-title">⚠️ Esta acción no se puede deshacer</p>
              <p className="danger-text">
                El grupo será eliminado permanentemente del sistema. Todos los datos asociados 
                serán eliminados. Esta acción no se puede deshacer.
              </p>
            </div>
          </div>
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






