import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('📝 Actualizando hojas de ruta para que sean más realistas...\n');

  // Eliminar todas las hojas de ruta existentes
  console.log('🗑️  Eliminando hojas de ruta existentes...');
  const deleted = await prisma.hojaRuta.deleteMany({});
  console.log(`   ✅ Eliminadas ${deleted.count} hojas de ruta\n`);

  // Obtener todos los trámites con sus grupos
  const tramites = await prisma.tramite.findMany({
    include: {
      grupo: {
        include: {
          miembros_grupo: {
            where: {
              rol_en_grupo: 'estudiante',
            },
            include: {
              usuario: true,
            },
          },
        },
      },
    },
  });

  console.log(`📋 Encontrados ${tramites.length} trámites\n`);

  const descripciones = [
    'Revisión inicial de documentación',
    'Análisis de antecedentes',
    'Preparación de escritos',
    'Consulta con consultante',
    'Seguimiento de actuaciones',
    'Revisión de normativa aplicable',
    'Elaboración de propuesta de resolución',
    'Revisión final del expediente',
  ];

  let totalHojasCreadas = 0;

  for (const tramite of tramites) {
    const estudiantes = tramite.grupo.miembros_grupo;
    
    if (estudiantes.length === 0) {
      console.log(`   ⚠️  Trámite ${tramite.num_carpeta} no tiene estudiantes, saltando...`);
      continue;
    }

    // Crear entre 5 y 7 actuaciones por trámite, distribuidas entre estudiantes
    const numActuaciones = Math.floor(Math.random() * 3) + 5; // Entre 5 y 7
    
    for (let j = 0; j < numActuaciones; j++) {
      // Asignar cada actuación a un estudiante diferente (rotando)
      const estudianteIndex = j % estudiantes.length;
      const estudiante = estudiantes[estudianteIndex];
      
      const fechaActuacion = new Date();
      fechaActuacion.setDate(fechaActuacion.getDate() - (numActuaciones - j)); // Fechas pasadas

      await prisma.hojaRuta.create({
        data: {
          id_tramite: tramite.id_tramite,
          id_usuario: estudiante.usuario.id_usuario,
          fecha_actuacion: fechaActuacion,
          descripcion: descripciones[j % descripciones.length],
        },
      });
    }
    
    totalHojasCreadas += numActuaciones;
    console.log(`   ✅ Trámite ${tramite.num_carpeta}: ${numActuaciones} actuaciones (${estudiantes.length} estudiantes)`);
  }

  console.log('\n📊 RESUMEN:');
  console.log('================================');
  console.log(`✅ Trámites procesados: ${tramites.length}`);
  console.log(`✅ Hojas de ruta creadas: ${totalHojasCreadas}`);
  console.log(`   Promedio: ${(totalHojasCreadas / tramites.length).toFixed(1)} actuaciones por trámite`);
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





