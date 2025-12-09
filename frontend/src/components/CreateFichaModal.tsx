import { CreateFichaForm } from './CreateFichaForm';
import { CreateConsultanteModal } from './CreateConsultanteModal';
import { useState, useEffect, useLayoutEffect, useCallback, useRef, memo } from 'react';
import { createPortal } from 'react-dom';
import './CreateFichaModal.css';

interface Consultante {
  id_consultante: number;
  id_usuario: number;
  usuario: {
    id_usuario: number;
    nombre: string;
    ci: string;
  };
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

// Ref persistente fuera del componente para preservar el estado incluso cuando el componente se desmonta
const persistentShowCreateConsultanteModalRef = { current: false };

function CreateFichaModalComponent({ isOpen, onClose, onSuccess }: Props) {
  const [hasChildModal, setHasChildModal] = useState(false);
  const [showCreateConsultanteModal, setShowCreateConsultanteModal] = useState(false);
  const handleConsultanteCreatedRef = useRef<((consultante: Consultante) => Promise<void>) | null>(null);
  // Usar el ref persistente en lugar de crear uno nuevo
  const showCreateConsultanteModalRef = persistentShowCreateConsultanteModalRef;
  
  // Debug: rastrear cuando el componente se monta/desmonta
  useEffect(() => {
    const timestamp = new Date().toISOString();
    console.log(`🔍 [${timestamp}] [CreateFichaModal] Componente montado - showCreateConsultanteModalRef.current:`, showCreateConsultanteModalRef.current);
    return () => {
      const unmountTimestamp = new Date().toISOString();
      console.log(`🔍 [${unmountTimestamp}] [CreateFichaModal] Componente desmontado - showCreateConsultanteModalRef.current:`, showCreateConsultanteModalRef.current);
      console.trace(`🔍 [${unmountTimestamp}] [CreateFichaModal] Stack trace de desmontaje`);
    };
  }, []);
  
  // NO restaurar el estado aquí - esto causa re-renders que desmontan el componente
  // En su lugar, usar solo el ref para determinar si el modal está abierto

  // Debug: rastrear cambios en hasChildModal
  useEffect(() => {
    const timestamp = new Date().toISOString();
    console.log(`🔍 [${timestamp}] [CreateFichaModal] hasChildModal cambió a:`, hasChildModal);
  }, [hasChildModal]);

  // Actualizar ref cuando cambia el estado
  // IMPORTANTE: Solo actualizar el ref cuando el estado cambia a true
  // NO actualizar el ref cuando el estado cambia a false - solo se resetea cuando se cierra explícitamente
  // Esto previene que el ref se resetee cuando CreateFichaForm se desmonta
  // Usar useLayoutEffect para actualizar de forma síncrona antes del render
  useLayoutEffect(() => {
    const timestamp = new Date().toISOString();
    console.log(`🔍 [${timestamp}] [CreateFichaModal] showCreateConsultanteModal cambió a:`, showCreateConsultanteModal);
    console.log(`🔍 [${timestamp}] [CreateFichaModal] showCreateConsultanteModalRef.current antes:`, showCreateConsultanteModalRef.current);
    // Solo actualizar el ref cuando el estado cambia a true
    // NO actualizar cuando cambia a false - el ref solo se resetea cuando se cierra explícitamente
    if (showCreateConsultanteModal) {
      console.log(`🔍 [${timestamp}] [CreateFichaModal] Actualizando ref a true (abrir modal)`);
      showCreateConsultanteModalRef.current = true;
    } else {
      // El estado es false - NO actualizar el ref aquí
      // El ref solo se resetea cuando se cierra explícitamente (en onClose o onSuccess)
      console.log(`🔍 [${timestamp}] [CreateFichaModal] Estado es false - preservando ref (solo se resetea al cerrar explícitamente)`);
    }
    console.log(`🔍 [${timestamp}] [CreateFichaModal] showCreateConsultanteModalRef.current después:`, showCreateConsultanteModalRef.current);
  }, [showCreateConsultanteModal]);

  // Debug: rastrear cambios en showCreateConsultanteModal
  useEffect(() => {
    const timestamp = new Date().toISOString();
    console.log(`🔍 [${timestamp}] [CreateFichaModal] showCreateConsultanteModal cambió a:`, showCreateConsultanteModal);
    console.log(`🔍 [${timestamp}] [CreateFichaModal] isOpen:`, isOpen);
    console.log(`🔍 [${timestamp}] [CreateFichaModal] hasChildModal actual:`, hasChildModal);
    console.log(`🔍 [${timestamp}] [CreateFichaModal] showCreateConsultanteModalRef.current:`, showCreateConsultanteModalRef.current);
    // Solo actualizar hasChildModal si el modal padre está abierto
    // Esto evita que se resetee cuando CreateFichaForm se desmonta
    // IMPORTANTE: Usar SOLO el ref para determinar si el modal hijo está abierto
    // Esto previene que se cierre cuando CreateFichaForm se desmonta y el estado se resetea
    if (isOpen) {
      // Usar SOLO el ref - no confiar en el estado porque puede resetearse cuando CreateFichaForm se desmonta
      const shouldHaveChildModal = showCreateConsultanteModalRef.current;
      // Solo actualizar si el valor realmente cambió para evitar loops infinitos
      if (shouldHaveChildModal && !hasChildModal) {
        setHasChildModal(true);
      } else if (!shouldHaveChildModal && hasChildModal) {
        setHasChildModal(false);
      }
    }
  }, [showCreateConsultanteModal, isOpen]); // Removido hasChildModal de las dependencias para evitar loops

  // Debug: rastrear cambios en isOpen
  useEffect(() => {
    const timestamp = new Date().toISOString();
    console.log(`🔍 [${timestamp}] [CreateFichaModal] isOpen cambió a:`, isOpen);
    if (!isOpen) {
      // Solo resetear cuando el modal se cierra completamente
      // NO resetear showCreateConsultanteModal aquí porque puede estar abierto
      setHasChildModal(false);
      // Resetear showCreateConsultanteModal solo cuando el modal padre se cierra
      setShowCreateConsultanteModal(false);
      showCreateConsultanteModalRef.current = false;
      console.trace(`🔍 [${timestamp}] [CreateFichaModal] Stack trace cuando isOpen se pone en false`);
    } else {
      // Cuando el modal se abre, NO restaurar el estado aquí para evitar re-renders
      // El estado se sincronizará automáticamente cuando el usuario interactúe con el modal
      console.log(`🔍 [${timestamp}] [CreateFichaModal] Modal abierto - showCreateConsultanteModalRef.current:`, showCreateConsultanteModalRef.current);
    }
  }, [isOpen]);

  // Estabilizar callbacks para evitar re-renders innecesarios
  const handleChildModalOpen = useCallback(() => {
    const timestamp = new Date().toISOString();
    console.log(`🔍 [${timestamp}] [CreateFichaModal] handleChildModalOpen llamado`);
    console.trace(`🔍 [${timestamp}] [CreateFichaModal] Stack trace de handleChildModalOpen`);
    setShowCreateConsultanteModal(true);
  }, []);

  const handleChildModalClose = useCallback(() => {
    const timestamp = new Date().toISOString();
    console.log(`🔍 [${timestamp}] [CreateFichaModal] handleChildModalClose llamado`);
    console.trace(`🔍 [${timestamp}] [CreateFichaModal] Stack trace de handleChildModalClose`);
    setShowCreateConsultanteModal(false);
  }, []);

  const handleOpenCreateConsultanteModal = useCallback(() => {
    const timestamp = new Date().toISOString();
    console.log(`🔍 [${timestamp}] [CreateFichaModal] handleOpenCreateConsultanteModal llamado`);
    console.log(`🔍 [${timestamp}] [CreateFichaModal] Ref antes de actualizar:`, showCreateConsultanteModalRef.current);
    // Actualizar el ref PRIMERO para preservar el estado
    showCreateConsultanteModalRef.current = true;
    console.log(`🔍 [${timestamp}] [CreateFichaModal] Ref después de actualizar:`, showCreateConsultanteModalRef.current);
    // Luego actualizar el estado
    setShowCreateConsultanteModal(true);
    // También actualizar hasChildModal inmediatamente
    setHasChildModal(true);
  }, []);

  const handleSuccess = useCallback(() => {
    if (onSuccess) {
      onSuccess();
    }
    onClose();
  }, [onSuccess, onClose]);

  // Estabilizar el callback onConsultanteCreated para evitar que CreateFichaForm se desmonte
  const handleConsultanteCreatedCallback = useCallback((handleConsultanteCreated: (consultante: Consultante) => Promise<void>) => {
    const timestamp = new Date().toISOString();
    console.log(`🔍 [${timestamp}] [CreateFichaModal] Guardando handleConsultanteCreated desde CreateFichaForm`);
    // Guardar el callback para usarlo cuando se cree el consultante
    handleConsultanteCreatedRef.current = handleConsultanteCreated;
  }, []);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const timestamp = new Date().toISOString();
    console.log(`🔍 [${timestamp}] [CreateFichaModal] Overlay click`);
    console.log(`🔍 [${timestamp}] [CreateFichaModal] target:`, e.target);
    console.log(`🔍 [${timestamp}] [CreateFichaModal] currentTarget:`, e.currentTarget);
    console.log(`🔍 [${timestamp}] [CreateFichaModal] hasChildModal:`, hasChildModal);
    // Solo cerrar si se hace clic directamente en el overlay, no en el contenido
    // Y verificar que no haya un modal hijo abierto (como el de crear consultante)
    if (e.target === e.currentTarget && !hasChildModal) {
      console.log(`🔍 [${timestamp}] [CreateFichaModal] Clic en overlay - cerrando modal`);
      onClose();
    } else if (hasChildModal) {
      console.log(`🔍 [${timestamp}] [CreateFichaModal] Clic bloqueado - hay modal hijo abierto`);
      // Si hay un modal hijo, prevenir el cierre
      e.stopPropagation();
    } else {
      console.log(`🔍 [${timestamp}] [CreateFichaModal] Clic bloqueado - target !== currentTarget`);
    }
  };

  // NO retornar null cuando isOpen es false - esto causa que el componente se desmonte
  // En su lugar, renderizar el portal siempre pero ocultarlo con CSS
  // Renderizar usando portal para evitar que se desmonte cuando FichasList se re-renderiza
  const modalContent = (
    <div 
      className={`modal-overlay ${!isOpen ? 'hidden' : ''}`}
      style={{ display: isOpen ? 'flex' : 'none' }}
      onClick={handleOverlayClick}
      onMouseDown={(e) => {
        // Prevenir que el mouseDown cierre el modal si hay un modal hijo
        if (hasChildModal && e.target === e.currentTarget) {
          e.stopPropagation();
        }
      }}
    >
      <div 
        className="create-ficha-modal" 
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>Crear Nueva Ficha</h2>
          <button 
            className="close-btn" 
            onClick={() => {
              const timestamp = new Date().toISOString();
              console.log(`🔍 [${timestamp}] [CreateFichaModal] Botón cerrar clickeado`);
              console.log(`🔍 [${timestamp}] [CreateFichaModal] hasChildModal:`, hasChildModal);
              // Solo cerrar si no hay modal hijo
              if (!hasChildModal) {
                console.log(`🔍 [${timestamp}] [CreateFichaModal] Cerrando modal desde botón`);
                onClose();
              } else {
                console.log(`🔍 [${timestamp}] [CreateFichaModal] Cierre bloqueado - hay modal hijo`);
              }
            }} 
            title="Cerrar"
            disabled={hasChildModal}
          >
            ×
          </button>
        </div>
        <div className="modal-content" onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
          <CreateFichaForm 
            key="create-ficha-form-stable"
            onSuccess={handleSuccess} 
            onOpenCreateConsultanteModal={handleOpenCreateConsultanteModal}
            onConsultanteCreated={handleConsultanteCreatedCallback}
          />
          {/* Renderizar el modal de consultante aquí para que no se desmonte con CreateFichaForm */}
          <CreateConsultanteModal
            // Usar SOLO el ref para preservar el estado cuando CreateFichaForm se desmonta
            // El ref es la fuente de verdad que preserva el estado incluso cuando el estado se resetea
            // Esto previene que el modal se cierre cuando CreateFichaForm se desmonta
            // Usar el ref directamente, no el estado, para evitar que se cierre cuando el componente se desmonta
            isOpen={showCreateConsultanteModalRef.current || showCreateConsultanteModal}
            onClose={() => {
              const timestamp = new Date().toISOString();
              console.log(`🔍 [${timestamp}] [CreateFichaModal] CreateConsultanteModal onClose`);
              // Cerrar explícitamente - actualizar tanto el estado como el ref
              setShowCreateConsultanteModal(false);
              showCreateConsultanteModalRef.current = false;
            }}
            onSuccess={async (consultante) => {
              const timestamp = new Date().toISOString();
              console.log(`🔍 [${timestamp}] [CreateFichaModal] CreateConsultanteModal onSuccess:`, consultante);
              // Cerrar el modal - actualizar tanto el estado como el ref
              showCreateConsultanteModalRef.current = false;
              setShowCreateConsultanteModal(false);
              // Llamar al callback de CreateFichaForm si existe
              if (handleConsultanteCreatedRef.current) {
                console.log(`🔍 [${timestamp}] [CreateFichaModal] Llamando handleConsultanteCreated desde CreateFichaForm`);
                await handleConsultanteCreatedRef.current(consultante);
              }
            }}
          />
        </div>
      </div>
    </div>
  );

  // Renderizar usando portal para evitar que se desmonte cuando FichasList se re-renderiza
  return createPortal(modalContent, document.body);
}

// Usar React.memo para evitar re-renders innecesarios que causan desmontajes
export const CreateFichaModal = memo(CreateFichaModalComponent, (prevProps, nextProps) => {
  // Solo re-renderizar si las props realmente cambiaron
  return (
    prevProps.isOpen === nextProps.isOpen &&
    prevProps.onClose === nextProps.onClose &&
    prevProps.onSuccess === nextProps.onSuccess
  );
});
