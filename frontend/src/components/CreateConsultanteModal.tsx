import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ApiService } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { FaTimes, FaUser, FaIdCard, FaEnvelope, FaPhone, FaMapMarkerAlt, FaSave } from 'react-icons/fa';
import './CreateConsultanteModal.css';

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
  onSuccess: (consultante: Consultante) => void;
}

// Estado persistente del formulario para preservar los datos cuando el componente se desmonta
const persistentFormDataRef = {
  current: {
    nombre: '',
    ci: '',
    domicilio: '',
    telefono: '',
    correo: '',
    est_civil: 'Soltero' as 'Soltero' | 'Casado' | 'Divorciado' | 'Viudo' | 'Unión Libre',
    nro_padron: '',
  }
};

export function CreateConsultanteModal({ isOpen, onClose, onSuccess }: Props) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const isClosingRef = useRef(false);
  // Usar el estado persistente como valor inicial y sincronizar con él
  const [formData, setFormData] = useState(persistentFormDataRef.current);
  
  // Sincronizar el estado local con el ref persistente cuando el componente se monta
  useEffect(() => {
    if (isOpen) {
      setFormData(persistentFormDataRef.current);
    }
  }, [isOpen]);
  
  // Actualizar el ref persistente cuando el formulario cambia
  useEffect(() => {
    persistentFormDataRef.current = formData;
  }, [formData]);

  // Debug: rastrear cambios en isOpen
  useEffect(() => {
    const timestamp = new Date().toISOString();
    console.log(`🔍 [${timestamp}] [CreateConsultanteModal] isOpen cambió a:`, isOpen);
    console.log(`🔍 [${timestamp}] [CreateConsultanteModal] loading:`, loading);
    console.log(`🔍 [${timestamp}] [CreateConsultanteModal] isClosingRef.current:`, isClosingRef.current);
    if (!isOpen) {
      console.log(`🔍 [${timestamp}] [CreateConsultanteModal] Modal cerrado. isClosingRef:`, isClosingRef.current);
      console.trace(`🔍 [${timestamp}] [CreateConsultanteModal] Stack trace cuando isOpen se pone en false`);
    } else {
      console.log(`🔍 [${timestamp}] [CreateConsultanteModal] Modal abierto`);
    }
  }, [isOpen, loading]);

  // Prevenir que el modal se cierre automáticamente
  useEffect(() => {
    if (isOpen) {
      isClosingRef.current = false;
      // Prevenir cierre con tecla Escape
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && !loading && !isClosingRef.current) {
          isClosingRef.current = true;
          onClose();
        }
      };
      
      document.addEventListener('keydown', handleEscape);
      
      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen, loading, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre || !formData.ci || !formData.domicilio || !formData.telefono || !formData.correo || !formData.nro_padron) {
      showToast('Por favor complete todos los campos requeridos', 'warning');
      return;
    }

    // Validar CI (debe tener al menos 7 dígitos)
    const ciLimpia = formData.ci.replace(/\D/g, '');
    if (ciLimpia.length < 7) {
      showToast('La cédula de identidad debe tener al menos 7 dígitos', 'warning');
      return;
    }

    // Validar número de padrón (debe ser numérico)
    if (!/^\d+$/.test(formData.nro_padron)) {
      showToast('El número de padrón debe ser numérico', 'warning');
      return;
    }

    setLoading(true);
    try {
      // Paso 1: Crear usuario con rol consultante
      const usuario = await ApiService.createUsuario({
        nombre: formData.nombre,
        ci: ciLimpia,
        domicilio: formData.domicilio,
        telefono: formData.telefono,
        correo: formData.correo,
        rol: 'consultante',
      });

      // Paso 2: Crear registro de consultante
      const consultante = await ApiService.createConsultante({
        id_usuario: usuario.id_usuario,
        est_civil: formData.est_civil,
        nro_padron: parseInt(formData.nro_padron),
      });

      showToast('Consultante creado exitosamente', 'success');
      
      // Resetear formulario (tanto el estado local como el persistente)
      const resetFormData = {
        nombre: '',
        ci: '',
        domicilio: '',
        telefono: '',
        correo: '',
        est_civil: 'Soltero' as const,
        nro_padron: '',
      };
      setFormData(resetFormData);
      persistentFormDataRef.current = resetFormData;

      // Marcar que estamos cerrando intencionalmente
      isClosingRef.current = true;
      
      // Llamar callback de éxito
      onSuccess(consultante);
      
      // Cerrar el modal después de un pequeño delay para asegurar que el callback se complete
      setTimeout(() => {
        onClose();
      }, 100);
    } catch (error: any) {
      showToast('Error al crear consultante: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCIChange = (value: string) => {
    // Remover caracteres no numéricos
    const cleaned = value.replace(/\D/g, '');
    setFormData({ ...formData, ci: cleaned });
  };

  // No renderizar si no está abierto
  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const timestamp = new Date().toISOString();
    console.log(`🔍 [${timestamp}] [CreateConsultanteModal] Overlay click`);
    console.log(`🔍 [${timestamp}] [CreateConsultanteModal] target:`, e.target);
    console.log(`🔍 [${timestamp}] [CreateConsultanteModal] currentTarget:`, e.currentTarget);
    console.log(`🔍 [${timestamp}] [CreateConsultanteModal] target === currentTarget:`, e.target === e.currentTarget);
    console.log(`🔍 [${timestamp}] [CreateConsultanteModal] loading:`, loading);
    console.log(`🔍 [${timestamp}] [CreateConsultanteModal] isClosingRef.current:`, isClosingRef.current);
    // Solo cerrar si se hace clic directamente en el overlay, no en el contenido
    if (e.target === e.currentTarget && !loading && !isClosingRef.current) {
      console.log(`🔍 [${timestamp}] [CreateConsultanteModal] Clic en overlay - cerrando modal`);
      isClosingRef.current = true;
      onClose();
    } else {
      console.log(`🔍 [${timestamp}] [CreateConsultanteModal] Clic en overlay bloqueado`);
      if (e.target !== e.currentTarget) {
        console.log(`🔍 [${timestamp}] [CreateConsultanteModal] Razón: target !== currentTarget`);
      }
      if (loading) {
        console.log(`🔍 [${timestamp}] [CreateConsultanteModal] Razón: loading = true`);
      }
      if (isClosingRef.current) {
        console.log(`🔍 [${timestamp}] [CreateConsultanteModal] Razón: isClosingRef.current = true`);
      }
    }
  };

  const handleClose = () => {
    const timestamp = new Date().toISOString();
    console.log(`🔍 [${timestamp}] [CreateConsultanteModal] handleClose llamado`);
    console.log(`🔍 [${timestamp}] [CreateConsultanteModal] loading:`, loading);
    console.log(`🔍 [${timestamp}] [CreateConsultanteModal] isClosingRef.current:`, isClosingRef.current);
    console.trace(`🔍 [${timestamp}] [CreateConsultanteModal] Stack trace de handleClose`);
    if (!loading && !isClosingRef.current) {
      console.log(`🔍 [${timestamp}] [CreateConsultanteModal] Cerrando modal intencionalmente`);
      isClosingRef.current = true;
      onClose();
    } else {
      console.log(`🔍 [${timestamp}] [CreateConsultanteModal] Cierre bloqueado. loading:`, loading, 'isClosingRef:', isClosingRef.current);
    }
  };

  if (!isOpen) return null;

  // Renderizar usando portal para evitar problemas de anidamiento con el modal padre
  const modalContent = (
    <div 
      className="modal-overlay create-consultante-modal-overlay" 
      onClick={handleOverlayClick} 
      ref={modalRef}
      onMouseDown={(e) => {
        // Prevenir que cualquier mouseDown cierre el modal padre
        e.stopPropagation();
      }}
      style={{ zIndex: 2000 }}
    >
      <div 
        className="modal-content create-consultante-modal" 
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        style={{ zIndex: 2001 }}
      >
        <div className="modal-header">
          <h2>Crear Nuevo Consultante</h2>
          <button className="modal-close" onClick={handleClose} disabled={loading}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label htmlFor="nombre">
              <FaUser className="label-icon" />
              Nombre Completo *
            </label>
            <input
              id="nombre"
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              required
              disabled={loading}
              placeholder="Ej: Juan Pérez García"
            />
          </div>

          <div className="form-group">
            <label htmlFor="ci">
              <FaIdCard className="label-icon" />
              Cédula de Identidad *
            </label>
            <input
              id="ci"
              type="text"
              value={formData.ci}
              onChange={(e) => handleCIChange(e.target.value)}
              required
              disabled={loading}
              placeholder="Sin puntos ni guiones"
              maxLength={8}
            />
            <small className="form-hint">
              Ingrese la CI sin puntos ni guiones (ejemplo: 12345678)
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="domicilio">
              <FaMapMarkerAlt className="label-icon" />
              Domicilio *
            </label>
            <input
              id="domicilio"
              type="text"
              value={formData.domicilio}
              onChange={(e) => setFormData({ ...formData, domicilio: e.target.value })}
              required
              disabled={loading}
              placeholder="Ej: Calle Ejemplo 123"
            />
          </div>

          <div className="form-group">
            <label htmlFor="telefono">
              <FaPhone className="label-icon" />
              Teléfono *
            </label>
            <input
              id="telefono"
              type="text"
              value={formData.telefono}
              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              required
              disabled={loading}
              placeholder="Ej: 099123456"
            />
          </div>

          <div className="form-group">
            <label htmlFor="correo">
              <FaEnvelope className="label-icon" />
              Correo Electrónico *
            </label>
            <input
              id="correo"
              type="email"
              value={formData.correo}
              onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
              required
              disabled={loading}
              placeholder="Ej: juan.perez@email.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="est_civil">Estado Civil *</label>
            <select
              id="est_civil"
              value={formData.est_civil}
              onChange={(e) => setFormData({ ...formData, est_civil: e.target.value as 'Soltero' | 'Casado' | 'Divorciado' | 'Viudo' | 'Unión Libre' })}
              required
              disabled={loading}
            >
              <option value="Soltero">Soltero</option>
              <option value="Casado">Casado</option>
              <option value="Divorciado">Divorciado</option>
              <option value="Viudo">Viudo</option>
              <option value="Unión Libre">Unión Libre</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="nro_padron">Número de Padrón *</label>
            <input
              id="nro_padron"
              type="text"
              value={formData.nro_padron}
              onChange={(e) => setFormData({ ...formData, nro_padron: e.target.value.replace(/\D/g, '') })}
              required
              disabled={loading}
              placeholder="Ej: 12345"
            />
            <small className="form-hint">
              Número de padrón del consultante
            </small>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={handleClose} disabled={loading} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Creando...' : (
                <>
                  <FaSave /> Crear Consultante
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Renderizar en el body usando portal para evitar problemas de anidamiento
  return createPortal(modalContent, document.body);
}

