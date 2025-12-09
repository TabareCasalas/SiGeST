import { Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from './authMiddleware';
import { obtenerRolEfectivo, usuarioTieneRol } from '../utils/roleHelper';

/**
 * Middleware que verifica que el usuario sea administrador (nivel_acceso = 1 o 3)
 * Considera roles múltiples: verifica si el usuario tiene rol de administrador
 * (ya sea como rol principal, rol activo, o rol secundario)
 */
export const adminMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    // Verificar si el usuario tiene rol de administrador (considerando roles múltiples)
    const tieneRolAdmin = await usuarioTieneRol(req.user.id, 'administrador');

    if (!tieneRolAdmin) {
      return res.status(403).json({ error: 'Acceso denegado: se requiere rol de administrador' });
    }

    // Obtener el usuario completo de la base de datos para verificar nivel_acceso
    const usuario = await prisma.usuario.findUnique({
      where: { id_usuario: req.user.id },
      include: {
        roles_secundarios: {
          where: { rol: 'administrador' },
        },
      },
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (!usuario.activo) {
      return res.status(403).json({ error: 'Usuario inactivo' });
    }

    // Obtener el rol efectivo (activo o principal)
    const rolEfectivo = await obtenerRolEfectivo(req.user.id);

    // Si el rol efectivo es administrador, usar nivel_acceso del usuario principal
    // Si el rol efectivo no es administrador pero tiene rol secundario, usar nivel_acceso del rol secundario
    let nivelAcceso = usuario.nivel_acceso;
    
    if (rolEfectivo !== 'administrador' && usuario.roles_secundarios.length > 0) {
      const rolSecundarioAdmin = usuario.roles_secundarios.find(ur => ur.rol === 'administrador');
      if (rolSecundarioAdmin) {
        nivelAcceso = rolSecundarioAdmin.nivel_acceso || usuario.nivel_acceso;
      }
    }

    // Verificar que tenga nivel_acceso = 1 (Administrativo) o 3 (Sistema)
    if (nivelAcceso !== 1 && nivelAcceso !== 3) {
      return res.status(403).json({ 
        error: 'Acceso denegado: se requiere nivel de acceso de administrador (nivel 1 o 3)' 
      });
    }

    // Usuario autorizado, continuar
    next();
  } catch (error: any) {
    console.error('Error en adminMiddleware:', error);
    return res.status(500).json({ error: 'Error al verificar permisos' });
  }
};

