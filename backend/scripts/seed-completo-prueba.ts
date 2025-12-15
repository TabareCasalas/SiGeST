import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

// Función para calcular dígito verificador de CI uruguaya
function validationDigit(ci: string): number {
  let a = 0;
  let i = 0;
  
  // Asegurar que la CI tenga 7 dígitos (rellenar con ceros a la izquierda)
  if (ci.length <= 6) {
    for (i = ci.length; i < 7; i++) {
      ci = '0' + ci;
    }
  }
  
  // Calcular el dígito verificador usando el multiplicador "2987634"
  const multiplicador = "2987634";
  for (i = 0; i < 7; i++) {
    a += (parseInt(multiplicador[i]) * parseInt(ci[i])) % 10;
  }
  
  if (a % 10 === 0) {
    return 0;
  } else {
    return 10 - (a % 10);
  }
}

// Generar CI válida con dígito verificador
// Si el CI ya tiene 8 dígitos, se asume que ya incluye el dígito verificador
// Si tiene 7 dígitos o menos, se calcula y agrega el dígito verificador
function generarCIValida(ci: string): string {
  // Si ya tiene 8 dígitos, asumir que ya incluye el dígito verificador
  if (ci.length >= 8) {
    return ci;
  }
  // Si tiene menos de 8 dígitos, calcular el dígito verificador
  const digitoVerificador = validationDigit(ci);
  return ci + digitoVerificador.toString();
}

// Generar número de consulta (formato F001/25)
function generarNumeroConsulta(secuencial: number): string {
  const añoActual = new Date().getFullYear();
  const añoActual2Digitos = añoActual.toString().slice(-2);
  const numeroFormateado = secuencial.toString().padStart(3, '0');
  return `F${numeroFormateado}/${añoActual2Digitos}`;
}

// Generar número de carpeta (formato T001/25)
function generarNumeroCarpeta(secuencial: number): string {
  const añoActual = new Date().getFullYear();
  const añoActual2Digitos = añoActual.toString().slice(-2);
  const numeroFormateado = secuencial.toString().padStart(3, '0');
  return `T${numeroFormateado}/${añoActual2Digitos}`;
}

async function limpiarBaseDatos() {
  console.log('🧹 Iniciando limpieza completa de base de datos...\n');

  // Eliminar en orden de dependencias
  console.log('🗑️  Eliminando documentos adjuntos...');
  await prisma.documentoAdjunto.deleteMany({});
  console.log('   ✅ Documentos adjuntos eliminados');

  console.log('🗑️  Eliminando hojas de ruta...');
  await prisma.hojaRuta.deleteMany({});
  console.log('   ✅ Hojas de ruta eliminadas');

  console.log('🗑️  Eliminando notificaciones...');
  await prisma.notificacion.deleteMany({});
  console.log('   ✅ Notificaciones eliminadas');

  console.log('🗑️  Eliminando trámites...');
  await prisma.tramite.deleteMany({});
  console.log('   ✅ Trámites eliminados');

  console.log('🗑️  Eliminando fichas...');
  await prisma.ficha.deleteMany({});
  console.log('   ✅ Fichas eliminadas');

  console.log('🗑️  Eliminando relaciones usuario-grupo...');
  await prisma.usuarioGrupo.deleteMany({});
  console.log('   ✅ Relaciones usuario-grupo eliminadas');

  console.log('🗑️  Eliminando grupos...');
  await prisma.grupo.deleteMany({});
  console.log('   ✅ Grupos eliminados');

  console.log('🗑️  Eliminando consultantes...');
  await prisma.consultante.deleteMany({});
  console.log('   ✅ Consultantes eliminados');

  console.log('🗑️  Eliminando solicitudes de reactivación...');
  await prisma.solicitudReactivacion.deleteMany({});
  console.log('   ✅ Solicitudes de reactivación eliminadas');

  console.log('🗑️  Eliminando roles secundarios...');
  await prisma.usuarioRol.deleteMany({});
  console.log('   ✅ Roles secundarios eliminados');

  console.log('🗑️  Eliminando auditorías...');
  await prisma.auditoria.deleteMany({});
  console.log('   ✅ Auditorías eliminadas');

  console.log('🗑️  Eliminando todos los usuarios...');
  await prisma.usuario.deleteMany({});
  console.log('   ✅ Usuarios eliminados');

  console.log('\n✅ Limpieza completada!\n');
}

async function crearUsuarios() {
  console.log('👤 Creando usuarios de prueba...\n');

  const usuarios = [
    // Administrativos
    { nombre: 'María LOPEZ FERNANDEZ', ci: '80000004', email: 'maria.lopez@test.com', rol: 'administrador', nivel_acceso: 1 },
    { nombre: 'Estela Rosmary MOREIRA PEREZ', ci: '41257254', email: 'estela.moreira@fder.edu.uy', rol: 'administrador', nivel_acceso: 1 },
    
    // Docentes
    { nombre: 'Roberto MARTINEZ GARCIA', ci: '70000006', email: 'roberto.martinez@test.com', rol: 'docente' },
    { nombre: 'Adriana AMADO RODRIGUEZ', ci: '18449999', email: 'adriana.amado@fder.edu.uy', rol: 'docente' },
    { nombre: 'Fernando SALAZAR GETINI', ci: '43092878', email: 'fernando.salazar@fder.edu.uy', rol: 'docente' },
    
    // Docente / Administrativa
    { nombre: 'Valeria Sabrina PORTA BORBA', ci: '36083874', email: 'valeria.porta@fder.edu.uy', rol: 'docente', roles_secundarios: ['administrador'], nivel_acceso: 1 },
    
    // Estudiantes
    { nombre: 'María SANTOS PEREZ', ci: '60000008', email: 'maria.santos@test.com', rol: 'estudiante', semestre: '2024-2' },
    { nombre: 'Juan TORRES GARCIA', ci: '60000014', email: 'juan.torres@test.com', rol: 'estudiante', semestre: '2024-2' },
    { nombre: 'Lucía RAMIREZ CASTRO', ci: '60000020', email: 'lucia.ramirez@test.com', rol: 'estudiante', semestre: '2024-2' },
    { nombre: 'Diego MORALES VEGA', ci: '60000036', email: 'diego.morales@test.com', rol: 'estudiante', semestre: '2024-2' },
    { nombre: 'Sofía HERRERA MENDEZ', ci: '60000042', email: 'sofia.herrera@test.com', rol: 'estudiante', semestre: '2024-2' },
    { nombre: 'Andrés JIMENEZ RUIZ', ci: '60000058', email: 'andres.jimenez@test.com', rol: 'estudiante', semestre: '2024-2' },
    
    // Consultantes
    { nombre: 'Carlos MARTINEZ LOPEZ', ci: '50000000', email: 'carlos.martinez@test.com', rol: 'consultante' },
    { nombre: 'Ana GONZALEZ RODRIGUEZ', ci: '50000016', email: 'ana.gonzalez@test.com', rol: 'consultante' },
    { nombre: 'Luis FERNANDEZ SILVA', ci: '50000022', email: 'luis.fernandez@test.com', rol: 'consultante' },
  ];

  const usuariosCreados: any = {};
  let nroPadronBase = 50000;

  for (const usuarioData of usuarios) {
    const ciCompleta = generarCIValida(usuarioData.ci);
    const password = await bcrypt.hash(ciCompleta, SALT_ROUNDS);
    
    const usuario = await prisma.usuario.create({
      data: {
        nombre: usuarioData.nombre,
        ci: ciCompleta,
        domicilio: 'Dirección de prueba',
        telefono: '099000000',
        correo: usuarioData.email,
        password: password,
        rol: usuarioData.rol,
        nivel_acceso: usuarioData.nivel_acceso || null,
        semestre: usuarioData.semestre || null,
        activo: true,
      },
    });

    // Crear roles secundarios si aplica
    if (usuarioData.roles_secundarios) {
      for (const rolSecundario of usuarioData.roles_secundarios) {
        await prisma.usuarioRol.create({
          data: {
            id_usuario: usuario.id_usuario,
            rol: rolSecundario,
            nivel_acceso: usuarioData.nivel_acceso || null,
          },
        });
      }
    }

    // Si es consultante, crear registro de consultante
    if (usuarioData.rol === 'consultante') {
      const nroPadron = nroPadronBase++;
      await prisma.consultante.create({
        data: {
          id_usuario: usuario.id_usuario,
          est_civil: 'Soltero',
          nro_padron: nroPadron,
        },
      });
    }

    usuariosCreados[usuarioData.nombre] = usuario;
    console.log(`   ✅ ${usuarioData.nombre} - CI: ${ciCompleta} - Rol: ${usuarioData.rol}`);
  }

  console.log(`\n✅ ${usuarios.length} usuarios creados\n`);
  return usuariosCreados;
}

async function crearGrupos(usuariosCreados: any) {
  console.log('👥 Creando grupos...\n');

  // Grupo 1: Profesor Salazar, Asistente Roberto Martinez
  const grupo1 = await prisma.grupo.create({
    data: {
      nombre: 'Grupo Prof. Salazar',
      descripcion: 'Grupo dirigido por Fernando Salazar Getini',
      activo: true,
      miembros_grupo: {
        create: [
          {
            id_usuario: usuariosCreados['Fernando SALAZAR GETINI'].id_usuario,
            rol_en_grupo: 'responsable',
          },
          {
            id_usuario: usuariosCreados['Roberto MARTINEZ GARCIA'].id_usuario,
            rol_en_grupo: 'asistente',
          },
          {
            id_usuario: usuariosCreados['María SANTOS PEREZ'].id_usuario,
            rol_en_grupo: 'estudiante',
          },
          {
            id_usuario: usuariosCreados['Juan TORRES GARCIA'].id_usuario,
            rol_en_grupo: 'estudiante',
          },
          {
            id_usuario: usuariosCreados['Lucía RAMIREZ CASTRO'].id_usuario,
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

  console.log(`   ✅ Grupo 1: ${grupo1.nombre} (${grupo1.miembros_grupo.length} miembros)`);

  // Grupo 2: Profesor Amado, Asistente Valeria Porta
  const grupo2 = await prisma.grupo.create({
    data: {
      nombre: 'Grupo Prof. Amado',
      descripcion: 'Grupo dirigido por Adriana Amado Rodriguez',
      activo: true,
      miembros_grupo: {
        create: [
          {
            id_usuario: usuariosCreados['Adriana AMADO RODRIGUEZ'].id_usuario,
            rol_en_grupo: 'responsable',
          },
          {
            id_usuario: usuariosCreados['Valeria Sabrina PORTA BORBA'].id_usuario,
            rol_en_grupo: 'asistente',
          },
          {
            id_usuario: usuariosCreados['Diego MORALES VEGA'].id_usuario,
            rol_en_grupo: 'estudiante',
          },
          {
            id_usuario: usuariosCreados['Sofía HERRERA MENDEZ'].id_usuario,
            rol_en_grupo: 'estudiante',
          },
          {
            id_usuario: usuariosCreados['Andrés JIMENEZ RUIZ'].id_usuario,
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

  console.log(`   ✅ Grupo 2: ${grupo2.nombre} (${grupo2.miembros_grupo.length} miembros)\n`);

  return { grupo1, grupo2 };
}

async function crearTramitesYHojasRuta(grupos: any, usuariosCreados: any) {
  console.log('📋 Creando trámites y hojas de ruta...\n');

  // Obtener consultantes
  const consultantes = await prisma.consultante.findMany({
    include: {
      usuario: true,
    },
  });

  if (consultantes.length < 6) {
    throw new Error('No hay suficientes consultantes');
  }

  const tramitesCreados = [];
  let numCarpetaSecuencial = 1;

  // Actuaciones posibles para las hojas de ruta
  const actuaciones = [
    'El consultante presentó partida de nacimiento',
    'Se revisó la documentación presentada',
    'Se realizó consulta con el consultante sobre los antecedentes',
    'Se analizó la normativa aplicable al caso',
    'Se preparó borrador de escritos',
    'Se revisó la jurisprudencia relevante',
    'Se elaboró propuesta de resolución',
    'Se realizó seguimiento de actuaciones pendientes',
    'Se completó revisión final del expediente',
    'Se notificó al consultante sobre el estado del trámite',
  ];

  // Crear trámites para Grupo 1 (3 trámites)
  console.log('📦 Creando trámites para Grupo 1...');
  const estudiantesGrupo1 = grupos.grupo1.miembros_grupo.filter((m: any) => m.rol_en_grupo === 'estudiante');
  
  for (let i = 0; i < 3; i++) {
    const consultante = consultantes[i];
    const numCarpeta = generarNumeroCarpeta(numCarpetaSecuencial++);

    const tramite = await prisma.tramite.create({
      data: {
        id_consultante: consultante.id_consultante,
        id_grupo: grupos.grupo1.id_grupo,
        num_carpeta: numCarpeta,
        estado: 'en_tramite',
        observaciones: `Trámite de prueba para ${consultante.usuario.nombre}`,
      },
    });

    console.log(`   ✅ Trámite ${i + 1}: ${numCarpeta} - ${consultante.usuario.nombre}`);

    // Crear hojas de ruta (6-8 actuaciones por trámite)
    const numActuaciones = 6 + Math.floor(Math.random() * 3); // Entre 6 y 8
    let estudianteIndex = 0;

    for (let j = 0; j < numActuaciones; j++) {
      // Cada actuación es registrada por un solo estudiante (rotando)
      const estudiante = estudiantesGrupo1[estudianteIndex % estudiantesGrupo1.length];
      estudianteIndex++;

      const fechaActuacion = new Date();
      fechaActuacion.setDate(fechaActuacion.getDate() - (numActuaciones - j)); // Fechas pasadas

      await prisma.hojaRuta.create({
        data: {
          id_tramite: tramite.id_tramite,
          id_usuario: estudiante.usuario.id_usuario,
          fecha_actuacion: fechaActuacion,
          descripcion: actuaciones[j % actuaciones.length],
        },
      });
    }

    console.log(`      📝 ${numActuaciones} hojas de ruta creadas (distribuidas entre ${estudiantesGrupo1.length} estudiantes)`);
    tramitesCreados.push(tramite);
  }

  // Crear trámites para Grupo 2 (3 trámites)
  console.log('\n📦 Creando trámites para Grupo 2...');
  const estudiantesGrupo2 = grupos.grupo2.miembros_grupo.filter((m: any) => m.rol_en_grupo === 'estudiante');
  
  for (let i = 0; i < 3; i++) {
    const consultante = consultantes[i + 3];
    const numCarpeta = generarNumeroCarpeta(numCarpetaSecuencial++);

    const tramite = await prisma.tramite.create({
      data: {
        id_consultante: consultante.id_consultante,
        id_grupo: grupos.grupo2.id_grupo,
        num_carpeta: numCarpeta,
        estado: 'en_tramite',
        observaciones: `Trámite de prueba para ${consultante.usuario.nombre}`,
      },
    });

    console.log(`   ✅ Trámite ${i + 1}: ${numCarpeta} - ${consultante.usuario.nombre}`);

    // Crear hojas de ruta (6-8 actuaciones por trámite)
    const numActuaciones = 6 + Math.floor(Math.random() * 3); // Entre 6 y 8
    let estudianteIndex = 0;

    for (let j = 0; j < numActuaciones; j++) {
      // Cada actuación es registrada por un solo estudiante (rotando)
      const estudiante = estudiantesGrupo2[estudianteIndex % estudiantesGrupo2.length];
      estudianteIndex++;

      const fechaActuacion = new Date();
      fechaActuacion.setDate(fechaActuacion.getDate() - (numActuaciones - j)); // Fechas pasadas

      await prisma.hojaRuta.create({
        data: {
          id_tramite: tramite.id_tramite,
          id_usuario: estudiante.usuario.id_usuario,
          fecha_actuacion: fechaActuacion,
          descripcion: actuaciones[j % actuaciones.length],
        },
      });
    }

    console.log(`      📝 ${numActuaciones} hojas de ruta creadas (distribuidas entre ${estudiantesGrupo2.length} estudiantes)`);
    tramitesCreados.push(tramite);
  }

  console.log(`\n✅ ${tramitesCreados.length} trámites creados con sus hojas de ruta\n`);
}

async function crearFichas(grupos: any, usuariosCreados: any) {
  console.log('📄 Creando fichas...\n');

  const consultantes = await prisma.consultante.findMany({
    include: {
      usuario: true,
    },
  });

  const temasConsulta = [
    'Asesoramiento en derecho sucesorio',
    'Consulta sobre régimen patrimonial del matrimonio',
    'Asesoramiento en derecho de familia',
    'Consulta sobre contratos civiles',
    'Asesoramiento en derecho laboral',
    'Consulta sobre propiedad horizontal',
  ];

  const fichasCreadas = [];
  let numConsultaSecuencial = 1;

  // Crear 4 fichas para asignar a los grupos
  for (let i = 0; i < 4; i++) {
    const consultante = consultantes[i % consultantes.length];
    const grupo = i % 2 === 0 ? grupos.grupo1 : grupos.grupo2;
    const docente = i % 2 === 0 
      ? usuariosCreados['Fernando SALAZAR GETINI']
      : usuariosCreados['Adriana AMADO RODRIGUEZ'];

    const numeroConsulta = generarNumeroConsulta(numConsultaSecuencial++);
    const fechaCita = new Date();
    fechaCita.setDate(fechaCita.getDate() + (i + 1) * 7); // Fechas futuras

    const ficha = await prisma.ficha.create({
      data: {
        id_consultante: consultante.id_consultante,
        fecha_cita: fechaCita,
        hora_cita: `${9 + (i % 8)}:00`,
        tema_consulta: temasConsulta[i % temasConsulta.length],
        id_docente: docente.id_usuario,
        numero_consulta: numeroConsulta,
        estado: 'standby', // Estado para asignar
        observaciones: `Ficha de prueba para asignar al grupo ${grupo.nombre}`,
      },
    });

    fichasCreadas.push(ficha);
    console.log(`   ✅ Ficha ${i + 1}: ${numeroConsulta} - Estado: ${ficha.estado} - Docente: ${docente.nombre}`);
  }

  console.log(`\n✅ ${fichasCreadas.length} fichas creadas\n`);
}

async function main() {
  try {
    console.log('🌱 Iniciando seed completo de datos de prueba...\n');
    console.log('='.repeat(60));
    console.log('');

    // 1. Limpiar base de datos
    await limpiarBaseDatos();

    // 2. Crear usuarios
    const usuariosCreados = await crearUsuarios();

    // 3. Crear grupos
    const grupos = await crearGrupos(usuariosCreados);

    // 4. Crear trámites y hojas de ruta
    await crearTramitesYHojasRuta(grupos, usuariosCreados);

    // 5. Crear fichas
    await crearFichas(grupos, usuariosCreados);

    // Resumen final
    console.log('📊 RESUMEN FINAL:');
    console.log('='.repeat(60));
    console.log(`👤 Usuarios: ${await prisma.usuario.count()}`);
    console.log(`👥 Grupos: ${await prisma.grupo.count()}`);
    console.log(`🔗 Relaciones Usuario-Grupo: ${await prisma.usuarioGrupo.count()}`);
    console.log(`📋 Trámites: ${await prisma.tramite.count()}`);
    console.log(`📝 Hojas de Ruta: ${await prisma.hojaRuta.count()}`);
    console.log(`📄 Fichas: ${await prisma.ficha.count()}`);
    console.log(`🧑‍💼 Consultantes: ${await prisma.consultante.count()}`);
    console.log('='.repeat(60));
    console.log('\n✅ Seed completado exitosamente!');
    console.log('\n🔐 CREDENCIALES:');
    console.log('   Todos los usuarios tienen como contraseña su CI (cédula de identidad)');
    console.log('   Ejemplo: Usuario CI 50000000 → Password: 50000000\n');
  } catch (error) {
    console.error('❌ Error en seed:', error);
    throw error;
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error fatal:', e);
    await prisma.$disconnect();
    process.exit(1);
  });

