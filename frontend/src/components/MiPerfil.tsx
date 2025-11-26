import { useState, useEffect } from 'react';
import { ApiService } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaSave, FaTimes } from 'react-icons/fa';
import './MiPerfil.css';

interface Usuario {
  id_usuario: number;
  nombre: string;
  ci: string;
  domicilio?: string;
  telefono?: string;
  correo: string;
  correos_adicionales?: string;
  rol: string;
  nivel_acceso?: number;
  activo: boolean;
  semestre?: string;
}

export function MiPerfil() {
  const { user, setUser } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [usuarioData, setUsuarioData] = useState<Usuario | null>(null);

  const [formData, setFormData] = useState({
    nombre: '',
    domicilios: [''],
    telefonos: [''],
    correos: [''],
  });

  useEffect(() => {
    loadUsuarioData();
  }, []);

  const loadUsuarioData = async () => {
    try {
      setLoadingData(true);
      const data = await ApiService.getCurrentUser();
      setUsuarioData(data);

      // Parsear domicilios, telefonos y correos (separados por |)
      const domicilios = data.domicilio ? data.domicilio.split('|').filter((d: string) => d.trim()) : [''];
      const telefonos = data.telefono ? data.telefono.split('|').filter((t: string) => t.trim()) : [''];
      const correos = data.correo ? [data.correo] : [''];

      // Si hay correos adicionales, agregarlos
      if (data.correos_adicionales) {
        const correosAdicionales = data.correos_adicionales.split('|').filter((c: string) => c.trim());
        correos.push(...correosAdicionales);
      }

      setFormData({
        nombre: data.nombre || '',
        domicilios: domicilios.length > 0 ? domicilios : [''],
        telefonos: telefonos.length > 0 ? telefonos : [''],
        correos: correos.length > 0 ? correos : [''],
      });
    } catch (err: any) {
      showToast('Error al cargar datos del usuario: ' + err.message, 'error');
    } finally {
      setLoadingData(false);
    }
  };

  const handleAddField = (field: 'domicilios' | 'telefonos' | 'correos') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], ''],
    }));
  };

  const handleRemoveField = (field: 'domicilios' | 'telefonos' | 'correos', index: number) => {
    if (formData[field].length === 1) {
      showToast('Debe tener al menos un campo', 'warning');
      return;
    }
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleFieldChange = (field: 'domicilios' | 'telefonos' | 'correos', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? value : item)),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validar que haya al menos un correo
      const correosValidos = formData.correos.filter(c => c.trim());
      if (correosValidos.length === 0) {
        showToast('Debe proporcionar al menos un correo electrónico', 'error');
        setLoading(false);
        return;
      }

      // Validar formato de correos
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      for (const correo of correosValidos) {
        if (!emailRegex.test(correo)) {
          showToast(`El correo "${correo}" no tiene un formato válido`, 'error');
          setLoading(false);
          return;
        }
      }

      // Preparar datos para enviar
      const domiciliosFiltrados = formData.domicilios.filter(d => d.trim());
      const telefonosFiltrados = formData.telefonos.filter(t => t.trim());
      const correoPrincipal = correosValidos[0];
      const correosAdicionales = correosValidos.slice(1);

      const data: any = {
        nombre: formData.nombre.trim(),
        domicilio: domiciliosFiltrados.length > 0 ? domiciliosFiltrados.join('|') : undefined,
        telefono: telefonosFiltrados.length > 0 ? telefonosFiltrados.join('|') : undefined,
        correo: correoPrincipal,
      };

      if (correosAdicionales.length > 0) {
        data.correos_adicionales = correosAdicionales.join('|');
      } else {
        data.correos_adicionales = null;
      }

      const usuarioActualizado = await ApiService.updateProfile(data);
      
      // Actualizar el usuario en el contexto de autenticación
      if (setUser && user) {
        const usuarioActualizadoContext = {
          ...user,
          nombre: usuarioActualizado.nombre,
          correo: usuarioActualizado.correo,
        };
        setUser(usuarioActualizadoContext);
        // Actualizar también en localStorage
        localStorage.setItem('user', JSON.stringify(usuarioActualizadoContext));
      }

      // Recargar datos del usuario para tener la información más actualizada
      await loadUsuarioData();

      showToast('Perfil actualizado exitosamente', 'success');
    } catch (err: any) {
      showToast(`Error: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="mi-perfil-container">
        <div className="loading-message">Cargando datos del perfil...</div>
      </div>
    );
  }

  if (!usuarioData) {
    return (
      <div className="mi-perfil-container">
        <div className="error-message">No se pudieron cargar los datos del usuario</div>
      </div>
    );
  }

  return (
    <div className="mi-perfil-container">
      <div className="mi-perfil-header">
        <h1>
          <FaUser /> Mi Perfil
        </h1>
        <p className="subtitle">Actualiza tu información personal</p>
      </div>

      <form onSubmit={handleSubmit} className="mi-perfil-form">
        <div className="form-section">
          <h2>Información Personal</h2>

          <div className="form-group">
            <label htmlFor="nombre">
              Nombre Completo <span className="required">*</span>
            </label>
            <input
              type="text"
              id="nombre"
              value={formData.nombre}
              onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>
              Cédula de Identidad
            </label>
            <input
              type="text"
              value={usuarioData.ci}
              disabled
              className="disabled-field"
            />
            <small className="field-hint">La cédula de identidad no se puede modificar</small>
          </div>

          <div className="form-group">
            <label>
              Rol
            </label>
            <input
              type="text"
              value={usuarioData.rol}
              disabled
              className="disabled-field"
            />
            <small className="field-hint">El rol no se puede modificar</small>
          </div>
        </div>

        <div className="form-section">
          <h2>Contacto</h2>

          <div className="form-group">
            <label>
              Correos Electrónicos <span className="required">*</span>
            </label>
            {formData.correos.map((correo, index) => (
              <div key={index} className="field-row">
                <div className="field-input-wrapper">
                  <FaEnvelope className="field-icon" />
                  <input
                    type="email"
                    value={correo}
                    onChange={(e) => handleFieldChange('correos', index, e.target.value)}
                    placeholder="correo@ejemplo.com"
                    required={index === 0}
                    disabled={loading}
                  />
                </div>
                {formData.correos.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveField('correos', index)}
                    className="btn-remove-field"
                    disabled={loading}
                  >
                    <FaTimes />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => handleAddField('correos')}
              className="btn-add-field"
              disabled={loading}
            >
              + Agregar Correo
            </button>
          </div>

          <div className="form-group">
            <label>Teléfonos</label>
            {formData.telefonos.map((telefono, index) => (
              <div key={index} className="field-row">
                <div className="field-input-wrapper">
                  <FaPhone className="field-icon" />
                  <input
                    type="tel"
                    value={telefono}
                    onChange={(e) => handleFieldChange('telefonos', index, e.target.value)}
                    placeholder="Ej: 099123456"
                    disabled={loading}
                  />
                </div>
                {formData.telefonos.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveField('telefonos', index)}
                    className="btn-remove-field"
                    disabled={loading}
                  >
                    <FaTimes />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => handleAddField('telefonos')}
              className="btn-add-field"
              disabled={loading}
            >
              + Agregar Teléfono
            </button>
          </div>

          <div className="form-group">
            <label>Domicilios</label>
            {formData.domicilios.map((domicilio, index) => (
              <div key={index} className="field-row">
                <div className="field-input-wrapper">
                  <FaMapMarkerAlt className="field-icon" />
                  <input
                    type="text"
                    value={domicilio}
                    onChange={(e) => handleFieldChange('domicilios', index, e.target.value)}
                    placeholder="Dirección completa"
                    disabled={loading}
                  />
                </div>
                {formData.domicilios.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveField('domicilios', index)}
                    className="btn-remove-field"
                    disabled={loading}
                  >
                    <FaTimes />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => handleAddField('domicilios')}
              className="btn-add-field"
              disabled={loading}
            >
              + Agregar Domicilio
            </button>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
          >
            {loading ? (
              'Guardando...'
            ) : (
              <>
                <FaSave /> Guardar Cambios
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

