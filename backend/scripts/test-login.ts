import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const ci = '41257254';
  
  console.log(`🔍 Probando login para CI: ${ci}\n`);

  // Simular el proceso de login
  const usuario = await prisma.usuario.findUnique({
    where: { ci },
    include: {
      grupos_participa: {
        include: {
          grupo: true,
        },
      },
      roles_secundarios: true,
    },
  });

  if (!usuario) {
    console.log('❌ Usuario no encontrado');
    return;
  }

  console.log('📋 Datos del usuario encontrado:');
  console.log('================================');
  console.log(`Rol principal: ${usuario.rol}`);
  console.log(`Rol activo: ${usuario.rol_activo || 'null'}`);
  console.log(`Nivel acceso: ${usuario.nivel_acceso || 'null'}`);
  
  // Simular obtención de roles disponibles
  const rolesDisponibles = [usuario.rol];
  if (usuario.roles_secundarios) {
    usuario.roles_secundarios.forEach((ur) => {
      if (!rolesDisponibles.includes(ur.rol)) {
        rolesDisponibles.push(ur.rol);
      }
    });
  }
  console.log(`Roles disponibles: ${rolesDisponibles.join(', ')}`);
  
  // Determinar rol activo
  const rolActivo = usuario.rol_activo || usuario.rol;
  console.log(`Rol activo calculado: ${rolActivo}`);
  console.log('================================\n');

  // Simular respuesta del backend
  const { password: _, ...usuarioSinPassword } = usuario;
  const respuestaBackend = {
    usuario: {
      ...usuarioSinPassword,
      roles_disponibles: rolesDisponibles,
      rol_activo: rolActivo,
    },
  };

  console.log('📤 Respuesta que devolvería el backend:');
  console.log('================================');
  console.log(JSON.stringify(respuestaBackend, null, 2));
  console.log('================================\n');

  console.log('🔍 Análisis:');
  console.log(`- Rol en BD: ${usuario.rol}`);
  console.log(`- Rol que debería mapearse a: ${usuario.rol === 'administrador' ? 'admin' : usuario.rol}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });





