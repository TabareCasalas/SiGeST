import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const ci = '41257254';
  
  console.log(`🔍 Verificando usuario con CI: ${ci}\n`);

  const usuario = await prisma.usuario.findUnique({
    where: { ci },
    include: {
      roles_secundarios: true,
    },
  });

  if (!usuario) {
    console.log('❌ Usuario no encontrado');
    return;
  }

  console.log('📋 Datos del usuario:');
  console.log('================================');
  console.log(`ID: ${usuario.id_usuario}`);
  console.log(`Nombre: ${usuario.nombre}`);
  console.log(`CI: ${usuario.ci}`);
  console.log(`Correo: ${usuario.correo}`);
  console.log(`Rol principal: ${usuario.rol}`);
  console.log(`Rol activo: ${usuario.rol_activo || 'null (usa rol principal)'}`);
  console.log(`Nivel acceso: ${usuario.nivel_acceso || 'null'}`);
  console.log(`Activo: ${usuario.activo}`);
  console.log(`Roles secundarios: ${usuario.roles_secundarios.length}`);
  usuario.roles_secundarios.forEach((ur, idx) => {
    console.log(`   ${idx + 1}. ${ur.rol} (nivel_acceso: ${ur.nivel_acceso || 'null'})`);
  });
  console.log('================================\n');
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





