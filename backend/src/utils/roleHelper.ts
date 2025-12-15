import { prisma } from '../lib/prisma';

/**
 * Verifica si un usuario tiene un rol específico
 * Considera: rol principal, rol_activo, y roles secundarios
 */
export async function usuarioTieneRol(
  idUsuario: number,
  rolRequerido: string
): Promise<boolean> {
  const usuario = await prisma.usuario.findUnique({
    where: { id_usuario: idUsuario },
    include: {
      roles_secundarios: true,
    },
  });

  if (!usuario) return false;

  // Verificar rol principal
  if (usuario.rol === rolRequerido) return true;

  // Verificar rol activo
  if (usuario.rol_activo === rolRequerido) return true;

  // Verificar roles secundarios
  const tieneRolSecundario = usuario.roles_secundarios.some(
    (ur) => ur.rol === rolRequerido
  );

  return tieneRolSecundario;
}

/**
 * Obtiene todos los roles disponibles de un usuario
 * (rol principal + roles secundarios)
 */
export async function obtenerRolesDisponibles(
  idUsuario: number
): Promise<string[]> {
  const usuario = await prisma.usuario.findUnique({
    where: { id_usuario: idUsuario },
    include: {
      roles_secundarios: true,
    },
  });

  if (!usuario) return [];

  const roles: string[] = [usuario.rol];

  // Agregar roles secundarios únicos
  usuario.roles_secundarios.forEach((ur) => {
    if (!roles.includes(ur.rol)) {
      roles.push(ur.rol);
    }
  });

  return roles;
}

/**
 * Obtiene el rol efectivo que debe usar el usuario
 * (rol_activo si existe, sino rol principal)
 */
export async function obtenerRolEfectivo(
  idUsuario: number
): Promise<string> {
  const usuario = await prisma.usuario.findUnique({
    where: { id_usuario: idUsuario },
  });

  if (!usuario) return '';

  return usuario.rol_activo || usuario.rol;
}





