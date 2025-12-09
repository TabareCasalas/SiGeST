import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('👥 Creando grupos con miembros...\n');

  // Buscar usuarios por nombre
  const salazar = await prisma.usuario.findFirst({
    where: {
      nombre: {
        contains: 'SALAZAR',
      },
      rol: 'docente',
    },
  });

  const amado = await prisma.usuario.findFirst({
    where: {
      nombre: {
        contains: 'AMADO',
      },
      rol: 'docente',
    },
  });

  const porta = await prisma.usuario.findFirst({
    where: {
      nombre: {
        contains: 'PORTA',
      },
    },
  });

  // Buscar otros docentes (excluyendo los ya seleccionados)
  // Buscar docentes que tengan rol docente (principal o secundario)
  const todosDocentes = await prisma.usuario.findMany({
    where: {
      OR: [
        { rol: 'docente' },
        {
          roles_secundarios: {
            some: {
              rol: 'docente',
            },
          },
        },
      ],
    },
    include: {
      roles_secundarios: true,
    },
  });

  const otrosDocentes = todosDocentes.filter(
    (d) =>
      d.id_usuario !== salazar?.id_usuario &&
      d.id_usuario !== amado?.id_usuario &&
      d.id_usuario !== porta?.id_usuario
  );

  // Buscar estudiantes (6 estudiantes, 3 para cada grupo)
  const estudiantes = await prisma.usuario.findMany({
    where: {
      rol: 'estudiante',
    },
    take: 6,
  });

  if (!salazar) {
    throw new Error('No se encontró el docente Salazar');
  }
  if (!amado) {
    throw new Error('No se encontró el docente Amado');
  }
  if (!porta) {
    throw new Error('No se encontró el docente Porta');
  }
  if (otrosDocentes.length < 1) {
    console.log('⚠️  Solo hay un docente adicional disponible, se usará en ambos grupos');
  }
  if (estudiantes.length < 6) {
    throw new Error('No hay suficientes estudiantes disponibles (se necesitan 6)');
  }

  console.log('📋 Usuarios encontrados:');
  console.log(`   Responsable Grupo 1: ${salazar.nombre} (ID: ${salazar.id_usuario})`);
  console.log(`   Responsable Grupo 2: ${amado.nombre} (ID: ${amado.id_usuario})`);
  console.log(`   Asistente (ambos grupos): ${porta.nombre} (ID: ${porta.id_usuario})`);
  if (otrosDocentes.length > 0) {
    console.log(`   Otro docente Grupo 1: ${otrosDocentes[0].nombre} (ID: ${otrosDocentes[0].id_usuario})`);
    if (otrosDocentes.length > 1) {
      console.log(`   Otro docente Grupo 2: ${otrosDocentes[1].nombre} (ID: ${otrosDocentes[1].id_usuario})`);
    } else {
      console.log(`   Otro docente Grupo 2: ${otrosDocentes[0].nombre} (ID: ${otrosDocentes[0].id_usuario}) - mismo que Grupo 1`);
    }
  }
  console.log(`   Estudiantes: ${estudiantes.length} encontrados\n`);

  // Crear Grupo 1
  console.log('📦 Creando Grupo 1...');
  const grupo1 = await prisma.grupo.create({
    data: {
      nombre: 'Grupo de prueba de Prof. Salazar',
      descripcion: 'Grupo dirigido por Fernando Salazar',
      activo: true,
      miembros_grupo: {
        create: [
          {
            id_usuario: salazar.id_usuario,
            rol_en_grupo: 'responsable',
          },
          {
            id_usuario: porta.id_usuario,
            rol_en_grupo: 'asistente',
          },
          ...(otrosDocentes.length > 0
            ? [
                {
                  id_usuario: otrosDocentes[0].id_usuario,
                  rol_en_grupo: 'asistente' as const,
                },
              ]
            : []),
          {
            id_usuario: estudiantes[0].id_usuario,
            rol_en_grupo: 'estudiante',
          },
          {
            id_usuario: estudiantes[1].id_usuario,
            rol_en_grupo: 'estudiante',
          },
          {
            id_usuario: estudiantes[2].id_usuario,
            rol_en_grupo: 'estudiante',
          },
        ],
      },
    },
    include: {
      miembros_grupo: {
        include: {
          usuario: true,
        },
      },
    },
  });

  console.log(`   ✅ Grupo 1 creado: ${grupo1.nombre} (ID: ${grupo1.id_grupo})`);
  console.log(`      Miembros: ${grupo1.miembros_grupo.length}`);

  // Crear Grupo 2
  console.log('\n📦 Creando Grupo 2...');
  const grupo2 = await prisma.grupo.create({
    data: {
      nombre: 'Grupo de prueba de Prof. Amado',
      descripcion: 'Grupo dirigido por Adriana Amado',
      activo: true,
      miembros_grupo: {
        create: [
          {
            id_usuario: amado.id_usuario,
            rol_en_grupo: 'responsable',
          },
          {
            id_usuario: porta.id_usuario,
            rol_en_grupo: 'asistente',
          },
          ...(otrosDocentes.length > 1
            ? [
                {
                  id_usuario: otrosDocentes[1].id_usuario,
                  rol_en_grupo: 'asistente' as const,
                },
              ]
            : otrosDocentes.length > 0
            ? [
                {
                  id_usuario: otrosDocentes[0].id_usuario,
                  rol_en_grupo: 'asistente' as const,
                },
              ]
            : []),
          {
            id_usuario: estudiantes[3].id_usuario,
            rol_en_grupo: 'estudiante',
          },
          {
            id_usuario: estudiantes[4].id_usuario,
            rol_en_grupo: 'estudiante',
          },
          {
            id_usuario: estudiantes[5].id_usuario,
            rol_en_grupo: 'estudiante',
          },
        ],
      },
    },
    include: {
      miembros_grupo: {
        include: {
          usuario: true,
        },
      },
    },
  });

  console.log(`   ✅ Grupo 2 creado: ${grupo2.nombre} (ID: ${grupo2.id_grupo})`);
  console.log(`      Miembros: ${grupo2.miembros_grupo.length}`);

  console.log('\n📊 RESUMEN:');
  console.log('================================');
  console.log(`✅ Grupos creados: 2`);
  console.log(`   - Grupo 1: ${grupo1.nombre} (${grupo1.miembros_grupo.length} miembros)`);
  console.log(`   - Grupo 2: ${grupo2.nombre} (${grupo2.miembros_grupo.length} miembros)`);
  console.log('\n👥 Detalles de miembros:');
  console.log('\nGrupo 1:');
  grupo1.miembros_grupo.forEach((m) => {
    console.log(`   - ${m.usuario.nombre} (${m.rol_en_grupo})`);
  });
  console.log('\nGrupo 2:');
  grupo2.miembros_grupo.forEach((m) => {
    console.log(`   - ${m.usuario.nombre} (${m.rol_en_grupo})`);
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

