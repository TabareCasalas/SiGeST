import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './RolSelector.css';

export function RolSelector() {
  const { user, cambiarRolActivo, getRolEfectivo, tieneMultiplesRoles } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isChanging, setIsChanging] = useState(false);

  if (!user || !tieneMultiplesRoles()) {
    return null;
  }

  const rolesDisponibles = user.roles_disponibles || [user.rol];
  const rolEfectivo = getRolEfectivo();

  const handleChangeRol = async (nuevoRol: string) => {
    if (nuevoRol === rolEfectivo) {
      setIsOpen(false);
      return;
    }

    setIsChanging(true);
    try {
      // Mapear el rol de vuelta al formato del backend
      const rolBackend = nuevoRol === 'admin' ? 'administrador' : nuevoRol;
      await cambiarRolActivo(rolBackend);
      setIsOpen(false);
    } catch (error: any) {
      console.error('Error al cambiar rol:', error);
      alert(error.message || 'Error al cambiar de rol');
    } finally {
      setIsChanging(false);
    }
  };

  const getRoleLabel = (role: string): string => {
    const labels: { [key: string]: string } = {
      admin: 'Administrador',
      docente: 'Docente',
      estudiante: 'Estudiante',
      consultante: 'Consultante',
    };
    return labels[role] || role;
  };

  return (
    <div className="rol-selector-container">
      <button
        className="rol-selector-btn"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isChanging}
        title="Cambiar rol"
      >
        <span className="rol-selector-label">
          {getRoleLabel(rolEfectivo)}
        </span>
        <span className="rol-selector-icon">▼</span>
      </button>

      {isOpen && (
        <>
          <div className="rol-selector-overlay" onClick={() => setIsOpen(false)} />
          <div className="rol-selector-dropdown">
            <div className="rol-selector-header">
              <strong>Cambiar rol</strong>
              <button
                className="rol-selector-close"
                onClick={() => setIsOpen(false)}
              >
                ×
              </button>
            </div>
            <div className="rol-selector-options">
              {rolesDisponibles.map((rol) => {
                const rolMapeado = rol === 'administrador' ? 'admin' : rol;
                const isActive = rolMapeado === rolEfectivo;
                return (
                  <button
                    key={rol}
                    className={`rol-selector-option ${isActive ? 'active' : ''}`}
                    onClick={() => handleChangeRol(rolMapeado)}
                    disabled={isChanging || isActive}
                  >
                    <span>{getRoleLabel(rolMapeado)}</span>
                    {isActive && <span className="rol-selector-check">✓</span>}
                  </button>
                );
              })}
            </div>
            {isChanging && (
              <div className="rol-selector-loading">
                Cambiando rol...
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}





