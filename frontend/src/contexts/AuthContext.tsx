import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

// En producción, usar ruta relativa para que Nginx haga el proxy
// En desarrollo, usar la URL completa
const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:3001/api');

export type UserRole = 'admin' | 'docente' | 'estudiante' | 'consultante';

export interface AuthUser {
  id_usuario: number;
  nombre: string;
  ci: string;
  correo: string;
  telefono?: string;
  domicilio?: string;
  rol: UserRole;
  rol_activo?: string; // Rol que el usuario está usando actualmente
  roles_disponibles?: string[]; // Todos los roles que el usuario puede usar
  nivel_acceso?: number; // 1=admin_administrativo (unificado), 3=admin_sistema
  activo: boolean;
  semestre?: string;
  id_grupo?: number;
  grupo?: {
    nombre: string;
  };
  grupos_participa?: Array<{
    id_grupo: number;
    rol_en_grupo: string;
    grupo: {
      id_grupo: number;
      nombre: string;
    };
  }>;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (ci: string, password?: string) => Promise<{ debeCambiarPassword?: boolean; usuario?: any } | void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
  hasAccessLevel: (minLevel: number) => boolean;
  isAdminSistema: () => boolean;
  isAdminAdministrativo: () => boolean;
  cambiarRolActivo: (rol: string) => Promise<void>;
  getRolEfectivo: () => UserRole;
  tieneMultiplesRoles: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay sesión guardada
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        // Verificar que el rol esté correctamente mapeado
        if (!parsedUser.rol || !['admin', 'docente', 'estudiante', 'consultante'].includes(parsedUser.rol)) {
          console.warn('⚠️ Rol inválido en localStorage, limpiando sesión');
          localStorage.removeItem('user');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          setIsLoading(false);
          return;
        }
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error al parsear usuario de localStorage:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (ci: string, password?: string) => {
    try {
      // Usar autenticación real del backend
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ci, password: password || 'password123' }), // Usar contraseña por defecto si no se proporciona
      });

      if (!response.ok) {
        const error = await response.json();
        // Si es error de usuario inactivo, incluir información adicional
        if (error.error === 'Usuario inactivo') {
          const errorObj = new Error(JSON.stringify(error));
          throw errorObj;
        }
        throw new Error(error.error || 'Error al iniciar sesión');
      }

      const data = await response.json();
      const usuario = data.usuario;
      const debeCambiarPassword = data.debeCambiarPassword || false;

      // DEBUG: Ver qué está recibiendo del backend
      console.log('🔍 DEBUG - Respuesta completa del backend:', data);
      console.log('🔍 DEBUG - Usuario recibido:', usuario);
      console.log('🔍 DEBUG - Rol del usuario:', usuario?.rol);
      console.log('🔍 DEBUG - Tipo de rol:', typeof usuario?.rol);

      // Verificar que el usuario esté activo
      if (!usuario.activo) {
        throw new Error('Usuario inactivo');
      }

      // Guardar tokens SIEMPRE (incluso si debe cambiar la contraseña)
      // El usuario necesita estar autenticado para cambiar su contraseña
      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
      }
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }

      // Si debe cambiar la contraseña, retornar información especial
      // pero los tokens ya están guardados para permitir el cambio
      if (debeCambiarPassword) {
        return { debeCambiarPassword: true, usuario };
      }

      // Verificar que el usuario tenga un rol
      if (!usuario.rol) {
        console.error('❌ Usuario sin rol definido:', usuario);
        throw new Error('Usuario sin rol definido');
      }

      // Mapear rol del usuario y determinar nivel_acceso
      console.log('🔍 DEBUG - Antes de mapear, rol es:', usuario.rol, 'tipo:', typeof usuario.rol);
      const rolMapeado = mapRolToUserRole(usuario.rol);
      console.log('🔍 DEBUG - Después de mapear, rol es:', rolMapeado);
      const nivelAcceso = usuario.nivel_acceso || getNivelAccesoFromRol(usuario.rol);
      console.log('🔍 DEBUG - Nivel acceso:', nivelAcceso);

      // Verificar que el mapeo sea correcto
      if (!rolMapeado || !['admin', 'docente', 'estudiante', 'consultante'].includes(rolMapeado)) {
        console.error('❌ Error en mapeo de rol:', {
          rolOriginal: usuario.rol,
          rolMapeado,
          usuarioCompleto: usuario,
        });
        // Limpiar localStorage por si hay datos corruptos
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        throw new Error(`Error al procesar rol del usuario. Rol recibido: "${usuario.rol}", mapeado a: "${rolMapeado}"`);
      }

      // Mapear rol del usuario
      const authUser: AuthUser = {
        id_usuario: usuario.id_usuario,
        nombre: usuario.nombre,
        ci: usuario.ci,
        correo: usuario.correo,
        rol: rolMapeado,
        rol_activo: usuario.rol_activo ? mapRolToUserRole(usuario.rol_activo) : undefined,
        roles_disponibles: usuario.roles_disponibles?.map(r => mapRolToUserRole(r)),
        nivel_acceso: nivelAcceso,
        activo: usuario.activo,
        semestre: usuario.semestre,
        id_grupo: usuario.id_grupo,
        grupo: usuario.grupo,
        grupos_participa: usuario.grupos_participa || [],
      };


      setUser(authUser);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(authUser));
    } catch (error: any) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Llamar al endpoint de logout si hay refresh token
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          await fetch(`${API_URL}/auth/logout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
          });
        } catch (error) {
          console.error('Error al cerrar sesión en el backend:', error);
        }
      }
    } finally {
      // Limpiar todo el estado local
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  };

  const getRolEfectivo = (): UserRole => {
    if (!user) return 'consultante';
    // Si tiene rol_activo, usarlo; sino usar rol principal
    // rol_activo ya debería estar mapeado, pero por si acaso lo verificamos
    if (user.rol_activo) {
      // Si rol_activo es un UserRole válido, usarlo directamente
      if (['admin', 'docente', 'estudiante', 'consultante'].includes(user.rol_activo)) {
        return user.rol_activo as UserRole;
      }
      // Si no, intentar mapearlo
      return mapRolToUserRole(user.rol_activo);
    }
    // Usar rol principal (ya debería estar mapeado)
    return user.rol;
  };

  const tieneMultiplesRoles = (): boolean => {
    if (!user) return false;
    return (user.roles_disponibles?.length || 0) > 1;
  };

  const cambiarRolActivo = async (rol: string): Promise<void> => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('No hay token de acceso');
      }

      const response = await fetch(`${API_URL}/auth/cambiar-rol-activo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ rol }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al cambiar rol');
      }

      const data = await response.json();
      
      // Actualizar token
      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
      }

      // Actualizar usuario en el estado
      if (user) {
        const updatedUser: AuthUser = {
          ...user,
          rol_activo: data.rol_activo || rol,
        };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }

      // Recargar la página para aplicar los cambios de UI
      window.location.reload();
    } catch (error: any) {
      console.error('Error al cambiar rol activo:', error);
      throw error;
    }
  };

  const hasRole = (roles: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    const rolEfectivo = getRolEfectivo();
    
    // Verificar rol efectivo
    if (roleArray.includes(rolEfectivo)) return true;
    
    // También verificar si tiene alguno de los roles en roles_disponibles
    if (user.roles_disponibles) {
      return user.roles_disponibles.some(rol => {
        const mappedRol = mapRolToUserRole(rol);
        return roleArray.includes(mappedRol);
      });
    }
    
    return false;
  };

  const hasAccessLevel = (minLevel: number): boolean => {
    if (!user) return false;
    const rolEfectivo = getRolEfectivo();
    if (rolEfectivo !== 'admin') return false;
    return (user.nivel_acceso || 0) >= minLevel;
  };

  const isAdminSistema = (): boolean => {
    const rolEfectivo = getRolEfectivo();
    return rolEfectivo === 'admin' && (user?.nivel_acceso || 0) === 3;
  };

  const isAdminAdministrativo = (): boolean => {
    const rolEfectivo = getRolEfectivo();
    return rolEfectivo === 'admin' && (user?.nivel_acceso || 0) === 1;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isAuthenticated,
      isLoading,
      hasRole, 
      hasAccessLevel,
      isAdminSistema,
      isAdminAdministrativo,
      cambiarRolActivo,
      getRolEfectivo,
      tieneMultiplesRoles
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Helper para mapear roles del backend a roles de la app
function mapRolToUserRole(rol: string): UserRole {
  // Normalizar el rol (por si viene con mayúsculas o espacios)
  const rolNormalizado = rol?.toLowerCase().trim();
  
  // Mapeo directo de los nuevos roles unificados
  if (rolNormalizado === 'administrador' || rolNormalizado === 'admin') {
    return 'admin';
  }
  if (rolNormalizado === 'docente') {
    return 'docente';
  }
  if (rolNormalizado === 'estudiante') {
    return 'estudiante';
  }
  if (rolNormalizado === 'consultante') {
    return 'consultante';
  }
  // Default: por defecto retorna consultante
  console.warn(`⚠️ Rol desconocido: "${rol}" (normalizado: "${rolNormalizado}"), mapeando a consultante`);
  return 'consultante';
}

// Helper para obtener nivel_acceso desde el rol (ya no necesario, el backend lo provee)
// Mantenido por compatibilidad hacia atrás con roles antiguos en caso de datos sin migrar
function getNivelAccesoFromRol(rol: string): number | undefined {
  // El backend ahora siempre proporciona nivel_acceso para administradores
  // Este helper solo se usa como fallback si el backend no lo proporciona
  // (no debería pasar con los nuevos roles, pero mantenemos compatibilidad)
  if (rol === 'administrador') {
    // El backend debería proporcionar nivel_acceso
    // Retornamos undefined para que se use el valor del backend
    return undefined;
  }
  return undefined;
}
