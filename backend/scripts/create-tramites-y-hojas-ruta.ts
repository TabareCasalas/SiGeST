import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Función para generar número de carpeta único (formato: xxx/yy)
function generarNumeroCarpeta(): string {
  const año = new Date().getFullYear().toString().slice(-2); // Últimos 2 dígitos del año
  const numero = Math.floor(Math.random() * 999) + 1; // Número entre 001 y 999
  return `${numero.toString().padStart(3, '0')}/${año}`;
}

async function main() {
  console.log('📋 Creando trámites y hojas de ruta para los grupos...\n');

  // Buscar los grupos
  const grupoSalazar = await prisma.grupo.findFirst({
    where: {
      nombre: {
        contains: 'Salazar',
      },
    },
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
  });

  const grupoAmado = await prisma.grupo.findFirst({
    where: {
      nombre: {
        contains: 'Amado',
      },
    },
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
  });

  if (!grupoSalazar) {
    throw new Error('No se encontró el grupo de Salazar');
  }
  if (!grupoAmado) {
    throw new Error('No se encontró el grupo de Amado');
  }

  // Buscar consultantes disponibles
  let consultantes = await prisma.consultante.findMany({
    include: {
      usuario: true,
    },
  });

  // Si hay menos de 6, reutilizar los existentes
  if (consultantes.length < 6) {
    console.log(`⚠️  Solo hay ${consultantes.length} consultantes, se reutilizarán para completar 6 trámites`);
    // Duplicar la lista hasta tener al menos 6
    while (consultantes.length < 6) {
      consultantes = [...consultantes, ...consultantes].slice(0, 6);
    }
  } else {
    consultantes = consultantes.slice(0, 6);
  }

  console.log('📋 Consultantes encontrados:', consultantes.length);
  console.log('👥 Estudiantes Grupo Salazar:', grupoSalazar.miembros_grupo.length);
  console.log('👥 Estudiantes Grupo Amado:', grupoAmado.miembros_grupo.length);
  console.log('\n');

  const tramitesCreados = [];
  const hojasRutaCreadas = [];

  // Crear trámites para Grupo Salazar
  console.log('📦 Creando trámites para Grupo Salazar...');
  for (let i = 0; i < 3; i++) {
    const consultante = consultantes[i];
    let numCarpeta = generarNumeroCarpeta();
    
    // Verificar que el número de carpeta sea único
    let intentos = 0;
    while (await prisma.tramite.findUnique({ where: { num_carpeta: numCarpeta } })) {
      numCarpeta = generarNumeroCarpeta();
      intentos++;
      if (intentos > 10) {
        throw new Error('No se pudo generar un número de carpeta único');
      }
    }

    const tramite = await prisma.tramite.create({
      data: {
        id_consultante: consultante.id_consultante,
        id_grupo: grupoSalazar.id_grupo,
        num_carpeta: numCarpeta,
        estado: 'en_tramite',
        observaciones: `Trámite de prueba para ${consultante.usuario.nombre}`,
      },
      include: {
        consultante: {
          include: {
            usuario: true,
          },
        },
      },
    });

    console.log(`   ✅ Trámite ${i + 1}: ${tramite.num_carpeta} - ${consultante.usuario.nombre}`);
    tramitesCreados.push({ tramite, grupo: grupoSalazar });

    // Crear hojas de ruta para este trámite (distribuidas entre estudiantes)
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

    // Distribuir las actuaciones entre los estudiantes del grupo
    const estudiantes = grupoSalazar.miembros_grupo;
    const numActuaciones = Math.floor(Math.random() * 3) + 5; // Entre 5 y 7 actuaciones por trámite
    
    for (let j = 0; j < numActuaciones; j++) {
      // Asignar cada actuación a un estudiante diferente (rotando)
      const estudianteIndex = j % estudiantes.length;
      const estudiante = estudiantes[estudianteIndex];
      
      const fechaActuacion = new Date();
      fechaActuacion.setDate(fechaActuacion.getDate() - (numActuaciones - j)); // Fechas pasadas

      const hojaRuta = await prisma.hojaRuta.create({
        data: {
          id_tramite: tramite.id_tramite,
          id_usuario: estudiante.usuario.id_usuario,
          fecha_actuacion: fechaActuacion,
          descripcion: descripciones[j % descripciones.length],
        },
      });

      hojasRutaCreadas.push(hojaRuta);
    }
    console.log(`      📝 Hojas de ruta creadas: ${numActuaciones} (distribuidas entre ${estudiantes.length} estudiantes)`);
  }

  // Crear trámites para Grupo Amado
  console.log('\n📦 Creando trámites para Grupo Amado...');
  for (let i = 0; i < 3; i++) {
    const consultante = consultantes[i + 3];
    let numCarpeta = generarNumeroCarpeta();
    
    // Verificar que el número de carpeta sea único
    let intentos = 0;
    while (await prisma.tramite.findUnique({ where: { num_carpeta: numCarpeta } })) {
      numCarpeta = generarNumeroCarpeta();
      intentos++;
      if (intentos > 10) {
        throw new Error('No se pudo generar un número de carpeta único');
      }
    }

    const tramite = await prisma.tramite.create({
      data: {
        id_consultante: consultante.id_consultante,
        id_grupo: grupoAmado.id_grupo,
        num_carpeta: numCarpeta,
        estado: 'en_tramite',
        observaciones: `Trámite de prueba para ${consultante.usuario.nombre}`,
      },
      include: {
        consultante: {
          include: {
            usuario: true,
          },
        },
      },
    });

    console.log(`   ✅ Trámite ${i + 1}: ${tramite.num_carpeta} - ${consultante.usuario.nombre}`);
    tramitesCreados.push({ tramite, grupo: grupoAmado });

    // Crear hojas de ruta para este trámite (distribuidas entre estudiantes)
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

    // Distribuir las actuaciones entre los estudiantes del grupo
    const estudiantes = grupoAmado.miembros_grupo;
    const numActuaciones = Math.floor(Math.random() * 3) + 5; // Entre 5 y 7 actuaciones por trámite
    
    for (let j = 0; j < numActuaciones; j++) {
      // Asignar cada actuación a un estudiante diferente (rotando)
      const estudianteIndex = j % estudiantes.length;
      const estudiante = estudiantes[estudianteIndex];
      
      const fechaActuacion = new Date();
      fechaActuacion.setDate(fechaActuacion.getDate() - (numActuaciones - j)); // Fechas pasadas

      const hojaRuta = await prisma.hojaRuta.create({
        data: {
          id_tramite: tramite.id_tramite,
          id_usuario: estudiante.usuario.id_usuario,
          fecha_actuacion: fechaActuacion,
          descripcion: descripciones[j % descripciones.length],
        },
      });

      hojasRutaCreadas.push(hojaRuta);
    }
    console.log(`      📝 Hojas de ruta creadas: ${numActuaciones} (distribuidas entre ${estudiantes.length} estudiantes)`);
  }

  console.log('\n📊 RESUMEN:');
  console.log('================================');
  console.log(`✅ Trámites creados: ${tramitesCreados.length}`);
  console.log(`   - Grupo Salazar: 3 trámites`);
  console.log(`   - Grupo Amado: 3 trámites`);
  console.log(`✅ Hojas de ruta creadas: ${hojasRutaCreadas.length}`);
  console.log('\n📋 Detalles de trámites:');
  console.log('\nGrupo Salazar:');
  tramitesCreados.slice(0, 3).forEach((t, idx) => {
    console.log(`   ${idx + 1}. ${t.tramite.num_carpeta} - ${t.tramite.consultante.usuario.nombre}`);
  });
  console.log('\nGrupo Amado:');
  tramitesCreados.slice(3, 6).forEach((t, idx) => {
    console.log(`   ${idx + 1}. ${t.tramite.num_carpeta} - ${t.tramite.consultante.usuario.nombre}`);
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

