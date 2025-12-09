import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FaUser, FaLock, FaSignInAlt } from 'react-icons/fa';
import { CambiarPasswordModal } from './CambiarPasswordModal';
import { SolicitarReactivacionModal } from './SolicitarReactivacionModal';
import './Login.css';

export function Login() {
  const [ci, setCi] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mostrarCambiarPassword, setMostrarCambiarPassword] = useState(false);
  const [passwordTemporal, setPasswordTemporal] = useState('');
  const [mostrarSolicitarReactivacion, setMostrarSolicitarReactivacion] = useState(false);
  const [infoReactivacion, setInfoReactivacion] = useState<{
    puedeSolicitar?: boolean;
    tieneSolicitudPendiente?: boolean;
    tieneSolicitudAprobada?: boolean;
    tieneSolicitudRechazada?: boolean;
  } | null>(null);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(ci, password);
      // Si el resultado indica que debe cambiar la contraseña
      if (result && 'debeCambiarPassword' in result && result.debeCambiarPassword) {
        setPasswordTemporal(password);
        setMostrarCambiarPassword(true);
        setLoading(false);
      }
    } catch (err: any) {
      // Verificar si el error es por usuario inactivo
      try {
        const errorData = JSON.parse(err.message);
        if (errorData.error === 'Usuario inactivo') {
          setInfoReactivacion({
            puedeSolicitar: errorData.puedeSolicitarReactivacion,
            tieneSolicitudPendiente: errorData.tieneSolicitudPendiente,
            tieneSolicitudAprobada: errorData.tieneSolicitudAprobada,
            tieneSolicitudRechazada: errorData.tieneSolicitudRechazada,
          });
          setMostrarSolicitarReactivacion(true);
          setError('');
          setLoading(false);
          return;
        }
      } catch {
        // No es JSON, continuar con el error normal
      }
      setError(err.message || 'Error al iniciar sesión');
      setLoading(false);
    }
  };

  const handlePasswordCambiada = () => {
    setMostrarCambiarPassword(false);
    setPasswordTemporal('');
    // Recargar la página para que el usuario inicie sesión nuevamente
    window.location.reload();
  };

  const handleQuickLogin = async (testCi: string) => {
    setCi(testCi);
    setPassword(testCi);
    setError('');
    setLoading(true);

    try {
      const result = await login(testCi, testCi);
      // Si el resultado indica que debe cambiar la contraseña
      if (result && 'debeCambiarPassword' in result && result.debeCambiarPassword) {
        setPasswordTemporal(testCi);
        setMostrarCambiarPassword(true);
        setLoading(false);
      }
    } catch (err: any) {
      // Verificar si el error es por usuario inactivo
      try {
        const errorData = JSON.parse(err.message);
        if (errorData.error === 'Usuario inactivo') {
          setInfoReactivacion({
            puedeSolicitar: errorData.puedeSolicitarReactivacion,
            tieneSolicitudPendiente: errorData.tieneSolicitudPendiente,
            tieneSolicitudAprobada: errorData.tieneSolicitudAprobada,
            tieneSolicitudRechazada: errorData.tieneSolicitudRechazada,
          });
          setMostrarSolicitarReactivacion(true);
          setError('');
          setLoading(false);
          return;
        }
      } catch {
        // No es JSON, continuar con el error normal
      }
      setError(err.message || 'Error al iniciar sesión');
      setLoading(false);
    }
  };

  // Credenciales de prueba
  const consultantesPrueba = [
    { nombre: 'Carlos MARTINEZ LOPEZ', ci: '50000000' },
    { nombre: 'Ana GONZALEZ RODRIGUEZ', ci: '50000016' },
    { nombre: 'Luis FERNANDEZ SILVA', ci: '50000022' },
  ];

  const estudiantesPrueba = [
    { nombre: 'María SANTOS PEREZ', ci: '60000008' },
    { nombre: 'Juan TORRES GARCIA', ci: '60000014' },
    { nombre: 'Lucía RAMIREZ CASTRO', ci: '60000020' },
    { nombre: 'Diego MORALES VEGA', ci: '60000036' },
    { nombre: 'Sofía HERRERA MENDEZ', ci: '60000042' },
    { nombre: 'Andrés JIMENEZ RUIZ', ci: '60000058' },
  ];

  const docentePrueba = [
    { nombre: 'Roberto MARTINEZ GARCIA', ci: '70000006' },
  ];

  const administrativoPrueba = [
    { nombre: 'María LOPEZ FERNANDEZ', ci: '80000004' },
  ];


  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <h1>SiGeST</h1>
            <p>Sistema de Gestion y Seguimiento de Tramites</p>
          </div>
          <h2>Clínica Notarial</h2>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="ci">
              <FaUser className="label-icon" />
              Cédula de Identidad
            </label>
            <input
              id="ci"
              type="text"
              value={ci}
              onChange={(e) => setCi(e.target.value)}
              placeholder="Ingrese su CI (sin puntos ni guiones)"
              required
              disabled={loading}
              autoFocus
            />
            <small className="form-hint">
              Ingrese su CI sin puntos ni guiones (ejemplo: 12345678)
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="password">
              <FaLock className="label-icon" />
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingrese su contraseña"
              required
              disabled={loading}
            />
            <small className="form-hint">
              Ingrese su CI y contraseña para acceder
            </small>
          </div>

          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? (
              <>Iniciando sesión...</>
            ) : (
              <>
                <FaSignInAlt /> Iniciar Sesión
              </>
            )}
          </button>
        </form>

        {/* Credenciales de prueba */}
        <div className="test-credentials">
          <div className="test-credentials-section">
            <h3>Administrativo de Prueba</h3>
            <div className="credentials-grid">
              {administrativoPrueba.map((admin) => (
                <button
                  key={admin.ci}
                  className="credential-item credential-admin"
                  onClick={() => handleQuickLogin(admin.ci)}
                  disabled={loading}
                  title={`CI: ${admin.ci} | Password: ${admin.ci}`}
                >
                  <span className="credential-name">{admin.nombre}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="test-credentials-section">
            <h3>Docente de Prueba</h3>
            <div className="credentials-grid">
              {docentePrueba.map((docente) => (
                <button
                  key={docente.ci}
                  className="credential-item credential-docente"
                  onClick={() => handleQuickLogin(docente.ci)}
                  disabled={loading}
                  title={`CI: ${docente.ci} | Password: ${docente.ci}`}
                >
                  <span className="credential-name">{docente.nombre}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="test-credentials-section">
            <h3>Estudiantes de Prueba</h3>
            <div className="credentials-grid">
              {estudiantesPrueba.map((estudiante) => (
                <button
                  key={estudiante.ci}
                  className="credential-item credential-estudiante"
                  onClick={() => handleQuickLogin(estudiante.ci)}
                  disabled={loading}
                  title={`CI: ${estudiante.ci} | Password: ${estudiante.ci}`}
                >
                  <span className="credential-name">{estudiante.nombre}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="test-credentials-section">
            <h3>Consultantes de Prueba</h3>
            <div className="credentials-grid">
              {consultantesPrueba.map((consultante) => (
                <button
                  key={consultante.ci}
                  className="credential-item credential-consultante"
                  onClick={() => handleQuickLogin(consultante.ci)}
                  disabled={loading}
                  title={`CI: ${consultante.ci} | Password: ${consultante.ci}`}
                >
                  <span className="credential-name">{consultante.nombre}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal para cambiar contraseña */}
      <CambiarPasswordModal
        isOpen={mostrarCambiarPassword}
        onSuccess={handlePasswordCambiada}
        esPrimeraVez={true}
        passwordTemporal={passwordTemporal}
      />

      {/* Modal para solicitar reactivación */}
      <SolicitarReactivacionModal
        isOpen={mostrarSolicitarReactivacion}
        onClose={() => {
          setMostrarSolicitarReactivacion(false);
          setInfoReactivacion(null);
        }}
        onSuccess={() => {
          setMostrarSolicitarReactivacion(false);
          setInfoReactivacion(null);
        }}
        ci={ci}
        password={password}
        tieneSolicitudPendiente={infoReactivacion?.tieneSolicitudPendiente}
        tieneSolicitudAprobada={infoReactivacion?.tieneSolicitudAprobada}
        tieneSolicitudRechazada={infoReactivacion?.tieneSolicitudRechazada}
      />
    </div>
  );
}
