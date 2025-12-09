import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { ApiService } from '../services/api';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaSave, FaTimes } from 'react-icons/fa';
import './UserProfile.css';

export function UserProfile() {
  const { user, login } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    telefono: '',
    domicilio: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        nombre: user.nombre || '',
        correo: user.correo || '',
        telefono: user.telefono || '',
        domicilio: user.domicilio || '',
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      await ApiService.updateUsuario(user.id_usuario, {
        nombre: formData.nombre,
        correo: formData.correo,
        telefono: formData.telefono,
        domicilio: formData.domicilio,
      });

      showToast('Datos actualizados exitosamente', 'success');
      setIsEditing(false);
      
      // Actualizar el usuario en el contexto
      // Recargar datos del usuario desde el backend
      const updatedUser = await ApiService.getUsuarioById(user.id_usuario);
      // Actualizar localStorage
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        const updatedUserData = {
          ...parsedUser,
          nombre: updatedUser.nombre,
          correo: updatedUser.correo,
          telefono: updatedUser.telefono,
          domicilio: updatedUser.domicilio,
        };
        localStorage.setItem('user', JSON.stringify(updatedUserData));
        // Recargar la página para actualizar el contexto
        window.location.reload();
      }
    } catch (error: any) {
      showToast(`Error al actualizar datos: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        nombre: user.nombre || '',
        correo: user.correo || '',
        telefono: user.telefono || '',
        domicilio: user.domicilio || '',
      });
    }
    setIsEditing(false);
  };

  if (!user) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="user-profile">
      <div className="profile-header">
        <div className="profile-avatar">
          <FaUser />
        </div>
        <div className="profile-info">
          <h1>{user.nombre}</h1>
          <p className="profile-role">{user.rol}</p>
        </div>
        {!isEditing && (
          <button
            className="btn-edit-profile"
            onClick={() => setIsEditing(true)}
          >
            Editar Perfil
          </button>
        )}
      </div>

      <div className="profile-content">
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-section">
            <h2>Información Personal</h2>
            
            <div className="form-group">
              <label>
                <FaUser /> Nombre Completo
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                />
              ) : (
                <div className="field-value">{user.nombre}</div>
              )}
            </div>

            <div className="form-group">
              <label>
                <FaEnvelope /> Correo Electrónico
              </label>
              {isEditing ? (
                <input
                  type="email"
                  name="correo"
                  value={formData.correo}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                />
              ) : (
                <div className="field-value">{user.correo}</div>
              )}
            </div>

            <div className="form-group">
              <label>
                <FaPhone /> Teléfono
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              ) : (
                <div className="field-value">{user.telefono || 'No especificado'}</div>
              )}
            </div>

            <div className="form-group">
              <label>
                <FaMapMarkerAlt /> Domicilio
              </label>
              {isEditing ? (
                <textarea
                  name="domicilio"
                  value={formData.domicilio}
                  onChange={handleInputChange}
                  rows={3}
                  disabled={loading}
                />
              ) : (
                <div className="field-value">{user.domicilio || 'No especificado'}</div>
              )}
            </div>
          </div>

          <div className="form-section">
            <h2>Información del Sistema</h2>
            
            <div className="form-group">
              <label>CI</label>
              <div className="field-value">{user.ci}</div>
            </div>

            <div className="form-group">
              <label>Rol</label>
              <div className="field-value">{user.rol}</div>
            </div>

            {user.semestre && (
              <div className="form-group">
                <label>Semestre</label>
                <div className="field-value">{user.semestre}</div>
              </div>
            )}
          </div>

          {isEditing && (
            <div className="form-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={handleCancel}
                disabled={loading}
              >
                <FaTimes /> Cancelar
              </button>
              <button
                type="submit"
                className="btn-save"
                disabled={loading}
              >
                <FaSave /> {loading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

