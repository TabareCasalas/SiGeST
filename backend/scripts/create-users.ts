import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

// Limpiar cédula (remover puntos y guiones)
function limpiarCI(ci: string): string {
  return ci.replace(/[.\-]/g, '');
}

async function main() {
  console.log('👤 Creando usuarios en el sistema...\n');

  // 1. Adriana AMADO RODRIGUEZ - Docente
  const ciAdriana = limpiarCI('18449999');
  const passwordAdriana = await bcrypt.hash(ciAdriana, SALT_ROUNDS);
  
  const adriana = await prisma.usuario.upsert({
    where: { ci: ciAdriana },
    update: {
      nombre: 'Adriana AMADO RODRIGUEZ',
      correo: 'adriana.amado@fder.edu.uy',
      password: passwordAdriana,
      rol: 'docente',
      activo: true,
    },
    create: {
      nombre: 'Adriana AMADO RODRIGUEZ',
      ci: ciAdriana,
      domicilio: 'Por definir',
      telefono: 'Por definir',
      correo: 'adriana.amado@fder.edu.uy',
      password: passwordAdriana,
      rol: 'docente',
      activo: true,
    },
  });
  console.log(`✅ Creado: ${adriana.nombre} (CI: ${ciAdriana}) - Docente`);

  // 2. Fernando SALAZAR GETINI - Docente
  const ciFernando = limpiarCI('43092878');
  const passwordFernando = await bcrypt.hash(ciFernando, SALT_ROUNDS);
  
  const fernando = await prisma.usuario.upsert({
    where: { ci: ciFernando },
    update: {
      nombre: 'Fernando SALAZAR GETINI',
      correo: 'fernando.salazar@fder.edu.uy',
      password: passwordFernando,
      rol: 'docente',
      activo: true,
    },
    create: {
      nombre: 'Fernando SALAZAR GETINI',
      ci: ciFernando,
      domicilio: 'Por definir',
      telefono: 'Por definir',
      correo: 'fernando.salazar@fder.edu.uy',
      password: passwordFernando,
      rol: 'docente',
      activo: true,
    },
  });
  console.log(`✅ Creado: ${fernando.nombre} (CI: ${ciFernando}) - Docente`);

  // 3. Estela Rosmary MOREIRA PEREZ - Administrativa
  const ciEstela = limpiarCI('41257254');
  const passwordEstela = await bcrypt.hash(ciEstela, SALT_ROUNDS);
  
  const estela = await prisma.usuario.upsert({
    where: { ci: ciEstela },
    update: {
      nombre: 'Estela Rosmary MOREIRA PEREZ',
      correo: 'estela.moreira@fder.edu.uy',
      password: passwordEstela,
      rol: 'administrador',
      nivel_acceso: 1, // Administrativo
      activo: true,
    },
    create: {
      nombre: 'Estela Rosmary MOREIRA PEREZ',
      ci: ciEstela,
      domicilio: 'Por definir',
      telefono: 'Por definir',
      correo: 'estela.moreira@fder.edu.uy',
      password: passwordEstela,
      rol: 'administrador',
      nivel_acceso: 1, // Administrativo
      activo: true,
    },
  });
  console.log(`✅ Creado: ${estela.nombre} (CI: ${ciEstela}) - Administrativa`);

  // 4. Valeria Sabrina PORTA BORBA - Docente / Administrativa (dos roles)
  const ciValeria = limpiarCI('3.608.387-4');
  const passwordValeria = await bcrypt.hash(ciValeria, SALT_ROUNDS);
  
  // Crear usuario con rol principal de docente
  const valeria = await prisma.usuario.upsert({
    where: { ci: ciValeria },
    update: {
      nombre: 'Valeria Sabrina PORTA BORBA',
      correo: 'valeria.porta@fder.edu.uy',
      password: passwordValeria,
      rol: 'docente', // Rol principal
      activo: true,
    },
    create: {
      nombre: 'Valeria Sabrina PORTA BORBA',
      ci: ciValeria,
      domicilio: 'Por definir',
      telefono: 'Por definir',
      correo: 'valeria.porta@fder.edu.uy',
      password: passwordValeria,
      rol: 'docente', // Rol principal
      activo: true,
    },
  });
  console.log(`✅ Creado: ${valeria.nombre} (CI: ${ciValeria}) - Docente (rol principal)`);

  // Agregar rol secundario de administradora
  const rolSecundarioExistente = await prisma.usuarioRol.findFirst({
    where: {
      id_usuario: valeria.id_usuario,
      rol: 'administrador',
    },
  });

  if (rolSecundarioExistente) {
    await prisma.usuarioRol.update({
      where: { id: rolSecundarioExistente.id },
      data: {
        nivel_acceso: 1, // Administrativo
      },
    });
    console.log(`   ✅ Actualizado rol secundario: Administrativa`);
  } else {
    await prisma.usuarioRol.create({
      data: {
        id_usuario: valeria.id_usuario,
        rol: 'administrador',
        nivel_acceso: 1, // Administrativo
      },
    });
    console.log(`   ✅ Agregado rol secundario: Administrativa`);
  }

  console.log('\n📊 RESUMEN:');
  console.log('================================');
  console.log(`✅ Usuarios creados/actualizados: 4`);
  console.log(`   - Docentes: 3 (Adriana, Fernando, Valeria)`);
  console.log(`   - Administrativa: 1 (Estela)`);
  console.log(`   - Con roles múltiples: 1 (Valeria - Docente/Administrativa)`);
  console.log('================================\n');

  console.log('🔐 CREDENCIALES:');
  console.log('================================');
  console.log('Todos los usuarios tienen como contraseña su CI (sin puntos ni guiones)');
  console.log(`Adriana: CI ${ciAdriana}`);
  console.log(`Fernando: CI ${ciFernando}`);
  console.log(`Estela: CI ${ciEstela}`);
  console.log(`Valeria: CI ${ciValeria}`);
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

