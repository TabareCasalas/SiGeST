import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;
const DEFAULT_PASSWORD = 'password123'; // Contraseña por defecto para todos los usuarios de prueba

// Función para generar número de carpeta único (formato: xxx/yy)
function generarNumeroCarpeta(): string {
  const año = new Date().getFullYear().toString().slice(-2); // Últimos 2 dígitos del año
  const numero = Math.floor(Math.random() * 999) + 1; // Número entre 001 y 999
  return `${numero.toString().padStart(3, '0')}/${año}`;
}

// Función para generar número de consulta único (formato: xx/yyyy)
function generarNumeroConsulta(secuencial: number): string {
  const año = new Date().getFullYear();
  return `${secuencial.toString().padStart(2, '0')}/${año}`;
}

async function main() {
  console.log('🌱 Iniciando seed completo de datos para producción...\n');

  // Hashear contraseña por defecto
  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);
  console.log(`🔐 Contraseña por defecto: ${DEFAULT_PASSWORD}\n`);

  // ==================== USUARIOS ====================
  console.log('👤 Creando usuarios...');

  // Administradores
  const adminSistema = await prisma.usuario.upsert({
    where: { ci: '12345678' },
    update: {
      password: hashedPassword,
      activo: true,
    },
    create: {
      nombre: 'Carlos Administrador',
      ci: '12345678',
      domicilio: 'Av. Principal 123',
      telefono: '099123456',
      correo: 'admin@sistema.com',
      password: hashedPassword,
      rol: 'administrador',
      nivel_acceso: 3, // Nivel 3: Sistema
      activo: true,
    },
  });

  const adminDocente = await prisma.usuario.upsert({
    where: { ci: '87654321' },
    update: {
      password: hashedPassword,
      activo: true,
    },
    create: {
      nombre: 'María Directora',
      ci: '87654321',
      domicilio: 'Calle Universidad 456',
      telefono: '099234567',
      correo: 'directora@universidad.com',
      password: hashedPassword,
      rol: 'administrador',
      nivel_acceso: 2, // Nivel 2: Docente
      activo: true,
    },
  });

  const adminAdministrativo = await prisma.usuario.upsert({
    where: { ci: '34567890' },
    update: {
      password: hashedPassword,
      activo: true,
    },
    create: {
      nombre: 'Juan Secretario',
      ci: '34567890',
      domicilio: 'Calle Oficina 789',
      telefono: '099345678',
      correo: 'secretario@universidad.com',
      password: hashedPassword,
      rol: 'administrador',
      nivel_acceso: 1, // Nivel 1: Administrativo
      activo: true,
    },
  });

  // Docentes
  const docente1 = await prisma.usuario.upsert({
    where: { ci: '11111111' },
    update: {
      password: hashedPassword,
      activo: true,
    },
    create: {
      nombre: 'Dr. Roberto Fernández',
      ci: '11111111',
      domicilio: 'Av. Italia 1234',
      telefono: '099456789',
      correo: 'roberto.fernandez@universidad.com',
      password: hashedPassword,
      rol: 'docente',
      activo: true,
    },
  });

  const docente2 = await prisma.usuario.upsert({
    where: { ci: '22222222' },
    update: {
      password: hashedPassword,
      activo: true,
    },
    create: {
      nombre: 'Dra. Ana Martínez',
      ci: '22222222',
      domicilio: 'Bulevar Artigas 567',
      telefono: '099567890',
      correo: 'ana.martinez@universidad.com',
      password: hashedPassword,
      rol: 'docente',
      activo: true,
    },
  });

  // Docentes Asistentes
  const asistente1 = await prisma.usuario.upsert({
    where: { ci: '33333333' },
    update: {
      password: hashedPassword,
      activo: true,
    },
    create: {
      nombre: 'Lic. Pedro García',
      ci: '33333333',
      domicilio: '18 de Julio 890',
      telefono: '099678901',
      correo: 'pedro.garcia@universidad.com',
      password: hashedPassword,
      rol: 'docente',
      activo: true,
    },
  });

  const asistente2 = await prisma.usuario.upsert({
    where: { ci: '44444444' },
    update: {
      password: hashedPassword,
      activo: true,
    },
    create: {
      nombre: 'Lic. Laura Rodríguez',
      ci: '44444444',
      domicilio: 'Rivera 234',
      telefono: '099789012',
      correo: 'laura.rodriguez@universidad.com',
      password: hashedPassword,
      rol: 'docente',
      activo: true,
    },
  });

  const asistente3 = await prisma.usuario.upsert({
    where: { ci: '10101010' },
    update: {
      password: hashedPassword,
      activo: true,
    },
    create: {
      nombre: 'Lic. Diego Sánchez',
      ci: '10101010',
      domicilio: 'Canelones 567',
      telefono: '099890123',
      correo: 'diego.sanchez@universidad.com',
      password: hashedPassword,
      rol: 'docente',
      activo: true,
    },
  });

  const asistente4 = await prisma.usuario.upsert({
    where: { ci: '20202020' },
    update: {
      password: hashedPassword,
      activo: true,
    },
    create: {
      nombre: 'Lic. Sofía Pérez',
      ci: '20202020',
      domicilio: 'Colonia 890',
      telefono: '099901234',
      correo: 'sofia.perez@universidad.com',
      password: hashedPassword,
      rol: 'docente',
      activo: true,
    },
  });

  const asistente5 = await prisma.usuario.upsert({
    where: { ci: '30303030' },
    update: {
      password: hashedPassword,
      activo: true,
    },
    create: {
      nombre: 'Lic. Martín López',
      ci: '30303030',
      domicilio: 'Montevideo 123',
      telefono: '099012345',
      correo: 'martin.lopez@universidad.com',
      password: hashedPassword,
      rol: 'docente',
      activo: true,
    },
  });

  console.log(`✅ Creados/Actualizados ${3} administradores, ${7} docentes`);

  // ==================== GRUPOS ====================
  console.log('\n👥 Creando grupos...');

  // Eliminar relaciones existentes si existen
  await prisma.usuarioGrupo.deleteMany({
    where: {
      grupo: {
        id_grupo: { in: [1, 2] },
      },
    },
  });

  const grupo1 = await prisma.grupo.upsert({
    where: { id_grupo: 1 },
    update: {
      nombre: 'Grupo A - Derecho Civil',
      descripcion: 'Grupo especializado en derecho civil y contratos',
      activo: true,
    },
    create: {
      nombre: 'Grupo A - Derecho Civil',
      descripcion: 'Grupo especializado en derecho civil y contratos',
      activo: true,
      miembros_grupo: {
        create: [
          {
            id_usuario: docente1.id_usuario,
            rol_en_grupo: 'responsable',
          },
          {
            id_usuario: asistente1.id_usuario,
            rol_en_grupo: 'asistente',
          },
          {
            id_usuario: asistente2.id_usuario,
            rol_en_grupo: 'asistente',
          },
        ],
      },
    },
  });

  // Agregar miembros al grupo1 si no se crearon
  const miembrosGrupo1 = await prisma.usuarioGrupo.findMany({
    where: { id_grupo: grupo1.id_grupo },
  });

  if (miembrosGrupo1.length === 0) {
    await prisma.usuarioGrupo.createMany({
      data: [
        { id_usuario: docente1.id_usuario, id_grupo: grupo1.id_grupo, rol_en_grupo: 'responsable' },
        { id_usuario: asistente1.id_usuario, id_grupo: grupo1.id_grupo, rol_en_grupo: 'asistente' },
        { id_usuario: asistente2.id_usuario, id_grupo: grupo1.id_grupo, rol_en_grupo: 'asistente' },
      ],
      skipDuplicates: true,
    });
  }

  const grupo2 = await prisma.grupo.upsert({
    where: { id_grupo: 2 },
    update: {
      nombre: 'Grupo B - Derecho Notarial',
      descripcion: 'Grupo especializado en derecho notarial y registral',
      activo: true,
    },
    create: {
      nombre: 'Grupo B - Derecho Notarial',
      descripcion: 'Grupo especializado en derecho notarial y registral',
      activo: true,
      miembros_grupo: {
        create: [
          {
            id_usuario: docente2.id_usuario,
            rol_en_grupo: 'responsable',
          },
          {
            id_usuario: asistente3.id_usuario,
            rol_en_grupo: 'asistente',
          },
          {
            id_usuario: asistente4.id_usuario,
            rol_en_grupo: 'asistente',
          },
          {
            id_usuario: asistente5.id_usuario,
            rol_en_grupo: 'asistente',
          },
        ],
      },
    },
  });

  // Agregar miembros al grupo2 si no se crearon
  const miembrosGrupo2 = await prisma.usuarioGrupo.findMany({
    where: { id_grupo: grupo2.id_grupo },
  });

  if (miembrosGrupo2.length === 0) {
    await prisma.usuarioGrupo.createMany({
      data: [
        { id_usuario: docente2.id_usuario, id_grupo: grupo2.id_grupo, rol_en_grupo: 'responsable' },
        { id_usuario: asistente3.id_usuario, id_grupo: grupo2.id_grupo, rol_en_grupo: 'asistente' },
        { id_usuario: asistente4.id_usuario, id_grupo: grupo2.id_grupo, rol_en_grupo: 'asistente' },
        { id_usuario: asistente5.id_usuario, id_grupo: grupo2.id_grupo, rol_en_grupo: 'asistente' },
      ],
      skipDuplicates: true,
    });
  }

  console.log(`✅ Creados/Actualizados 2 grupos con sus miembros`);

  // ==================== ESTUDIANTES ====================
  console.log('\n👨‍🎓 Creando estudiantes...');

  const estudiante1 = await prisma.usuario.upsert({
    where: { ci: '55555555' },
    update: {
      password: hashedPassword,
      activo: true,
    },
    create: {
      nombre: 'Lucía González',
      ci: '55555555',
      domicilio: 'Av. 8 de Octubre 234',
      telefono: '098111234',
      correo: 'lucia.gonzalez@estudiantes.com',
      password: hashedPassword,
      rol: 'estudiante',
      semestre: '2024-1',
      activo: true,
      grupos_participa: {
        create: {
          id_grupo: grupo1.id_grupo,
          rol_en_grupo: 'estudiante',
        },
      },
    },
  });

  // Asegurar que el estudiante esté en el grupo
  await prisma.usuarioGrupo.upsert({
    where: {
      id_usuario_id_grupo: {
        id_usuario: estudiante1.id_usuario,
        id_grupo: grupo1.id_grupo,
      },
    },
    update: {},
    create: {
      id_usuario: estudiante1.id_usuario,
      id_grupo: grupo1.id_grupo,
      rol_en_grupo: 'estudiante',
    },
  });

  const estudiante2 = await prisma.usuario.upsert({
    where: { ci: '66666666' },
    update: {
      password: hashedPassword,
      activo: true,
    },
    create: {
      nombre: 'Mateo Silva',
      ci: '66666666',
      domicilio: 'Bvar. Batlle y Ordóñez 567',
      telefono: '098222345',
      correo: 'mateo.silva@estudiantes.com',
      password: hashedPassword,
      rol: 'estudiante',
      semestre: '2024-1',
      activo: true,
      grupos_participa: {
        create: {
          id_grupo: grupo1.id_grupo,
          rol_en_grupo: 'estudiante',
        },
      },
    },
  });

  await prisma.usuarioGrupo.upsert({
    where: {
      id_usuario_id_grupo: {
        id_usuario: estudiante2.id_usuario,
        id_grupo: grupo1.id_grupo,
      },
    },
    update: {},
    create: {
      id_usuario: estudiante2.id_usuario,
      id_grupo: grupo1.id_grupo,
      rol_en_grupo: 'estudiante',
    },
  });

  const estudiante3 = await prisma.usuario.upsert({
    where: { ci: '77777777' },
    update: {
      password: hashedPassword,
      activo: true,
    },
    create: {
      nombre: 'Valentina Castro',
      ci: '77777777',
      domicilio: 'Calle Constituyente 890',
      telefono: '098333456',
      correo: 'valentina.castro@estudiantes.com',
      password: hashedPassword,
      rol: 'estudiante',
      semestre: '2024-1',
      activo: true,
      grupos_participa: {
        create: {
          id_grupo: grupo1.id_grupo,
          rol_en_grupo: 'estudiante',
        },
      },
    },
  });

  await prisma.usuarioGrupo.upsert({
    where: {
      id_usuario_id_grupo: {
        id_usuario: estudiante3.id_usuario,
        id_grupo: grupo1.id_grupo,
      },
    },
    update: {},
    create: {
      id_usuario: estudiante3.id_usuario,
      id_grupo: grupo1.id_grupo,
      rol_en_grupo: 'estudiante',
    },
  });

  const estudiante4 = await prisma.usuario.upsert({
    where: { ci: '88888888' },
    update: {
      password: hashedPassword,
      activo: true,
    },
    create: {
      nombre: 'Santiago Ramírez',
      ci: '88888888',
      domicilio: 'Av. Italia 1234',
      telefono: '098444567',
      correo: 'santiago.ramirez@estudiantes.com',
      password: hashedPassword,
      rol: 'estudiante',
      semestre: '2024-1',
      activo: true,
      grupos_participa: {
        create: {
          id_grupo: grupo2.id_grupo,
          rol_en_grupo: 'estudiante',
        },
      },
    },
  });

  await prisma.usuarioGrupo.upsert({
    where: {
      id_usuario_id_grupo: {
        id_usuario: estudiante4.id_usuario,
        id_grupo: grupo2.id_grupo,
      },
    },
    update: {},
    create: {
      id_usuario: estudiante4.id_usuario,
      id_grupo: grupo2.id_grupo,
      rol_en_grupo: 'estudiante',
    },
  });

  const estudiante5 = await prisma.usuario.upsert({
    where: { ci: '99999999' },
    update: {
      password: hashedPassword,
      activo: true,
    },
    create: {
      nombre: 'Camila Torres',
      ci: '99999999',
      domicilio: 'Calle Mercedes 345',
      telefono: '098555678',
      correo: 'camila.torres@estudiantes.com',
      password: hashedPassword,
      rol: 'estudiante',
      semestre: '2024-1',
      activo: true,
      grupos_participa: {
        create: {
          id_grupo: grupo2.id_grupo,
          rol_en_grupo: 'estudiante',
        },
      },
    },
  });

  await prisma.usuarioGrupo.upsert({
    where: {
      id_usuario_id_grupo: {
        id_usuario: estudiante5.id_usuario,
        id_grupo: grupo2.id_grupo,
      },
    },
    update: {},
    create: {
      id_usuario: estudiante5.id_usuario,
      id_grupo: grupo2.id_grupo,
      rol_en_grupo: 'estudiante',
    },
  });

  const estudiante6 = await prisma.usuario.upsert({
    where: { ci: '15151515' },
    update: {
      password: hashedPassword,
      activo: true,
    },
    create: {
      nombre: 'Federico Morales',
      ci: '15151515',
      domicilio: 'Bvar. España 678',
      telefono: '098666789',
      correo: 'federico.morales@estudiantes.com',
      password: hashedPassword,
      rol: 'estudiante',
      semestre: '2024-1',
      activo: true,
      grupos_participa: {
        create: {
          id_grupo: grupo2.id_grupo,
          rol_en_grupo: 'estudiante',
        },
      },
    },
  });

  await prisma.usuarioGrupo.upsert({
    where: {
      id_usuario_id_grupo: {
        id_usuario: estudiante6.id_usuario,
        id_grupo: grupo2.id_grupo,
      },
    },
    update: {},
    create: {
      id_usuario: estudiante6.id_usuario,
      id_grupo: grupo2.id_grupo,
      rol_en_grupo: 'estudiante',
    },
  });

  console.log(`✅ Creados/Actualizados 6 estudiantes asignados a grupos`);

  // ==================== CONSULTANTES ====================
  console.log('\n🧑‍💼 Creando consultantes...');

  const usuarioConsultante1 = await prisma.usuario.upsert({
    where: { ci: '40404040' },
    update: {
      password: hashedPassword,
      activo: true,
    },
    create: {
      nombre: 'Andrés Méndez',
      ci: '40404040',
      domicilio: 'Calle Soriano 123',
      telefono: '098777890',
      correo: 'andres.mendez@email.com',
      password: hashedPassword,
      rol: 'consultante',
      activo: true,
    },
  });

  const consultante1 = await prisma.consultante.upsert({
    where: { id_usuario: usuarioConsultante1.id_usuario },
    update: {},
    create: {
      id_usuario: usuarioConsultante1.id_usuario,
      est_civil: 'Soltero',
      nro_padron: 12345,
    },
  });

  const usuarioConsultante2 = await prisma.usuario.upsert({
    where: { ci: '50505050' },
    update: {
      password: hashedPassword,
      activo: true,
    },
    create: {
      nombre: 'Patricia Vega',
      ci: '50505050',
      domicilio: 'Av. 18 de Julio 456',
      telefono: '098888901',
      correo: 'patricia.vega@email.com',
      password: hashedPassword,
      rol: 'consultante',
      activo: true,
    },
  });

  const consultante2 = await prisma.consultante.upsert({
    where: { id_usuario: usuarioConsultante2.id_usuario },
    update: {},
    create: {
      id_usuario: usuarioConsultante2.id_usuario,
      est_civil: 'Casada',
      nro_padron: 23456,
    },
  });

  const usuarioConsultante3 = await prisma.usuario.upsert({
    where: { ci: '60606060' },
    update: {
      password: hashedPassword,
      activo: true,
    },
    create: {
      nombre: 'Ricardo Núñez',
      ci: '60606060',
      domicilio: 'Calle Yaguarón 789',
      telefono: '098999012',
      correo: 'ricardo.nunez@email.com',
      password: hashedPassword,
      rol: 'consultante',
      activo: true,
    },
  });

  const consultante3 = await prisma.consultante.upsert({
    where: { id_usuario: usuarioConsultante3.id_usuario },
    update: {},
    create: {
      id_usuario: usuarioConsultante3.id_usuario,
      est_civil: 'Divorciado',
      nro_padron: 34567,
    },
  });

  console.log(`✅ Creados/Actualizados 3 consultantes`);

  // ==================== TRÁMITES ====================
  console.log('\n📋 Creando trámites...');

  const estudiantesGrupo1 = [estudiante1, estudiante2, estudiante3];
  const estudiantesGrupo2 = [estudiante4, estudiante5, estudiante6];

  const tramitesCreados = [];

  // Crear 3 trámites para Grupo 1
  for (let i = 0; i < 3; i++) {
    const consultante = i === 0 ? consultante1 : i === 1 ? consultante2 : consultante3;
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

    const tramite = await prisma.tramite.upsert({
      where: { num_carpeta: numCarpeta },
      update: {},
      create: {
        id_consultante: consultante.id_consultante,
        id_grupo: grupo1.id_grupo,
        num_carpeta: numCarpeta,
        estado: 'en_tramite',
        observaciones: `Trámite de prueba para ${usuarioConsultante1.nombre}`,
      },
    });

    tramitesCreados.push({ tramite, grupo: grupo1, estudiantes: estudiantesGrupo1 });
    console.log(`   ✅ Trámite ${i + 1}: ${tramite.num_carpeta} - Grupo A`);
  }

  // Crear 3 trámites para Grupo 2
  for (let i = 0; i < 3; i++) {
    const consultante = i === 0 ? consultante1 : i === 1 ? consultante2 : consultante3;
    let numCarpeta = generarNumeroCarpeta();
    
    let intentos = 0;
    while (await prisma.tramite.findUnique({ where: { num_carpeta: numCarpeta } })) {
      numCarpeta = generarNumeroCarpeta();
      intentos++;
      if (intentos > 10) {
        throw new Error('No se pudo generar un número de carpeta único');
      }
    }

    const tramite = await prisma.tramite.upsert({
      where: { num_carpeta: numCarpeta },
      update: {},
      create: {
        id_consultante: consultante.id_consultante,
        id_grupo: grupo2.id_grupo,
        num_carpeta: numCarpeta,
        estado: 'en_tramite',
        observaciones: `Trámite de prueba para ${usuarioConsultante2.nombre}`,
      },
    });

    tramitesCreados.push({ tramite, grupo: grupo2, estudiantes: estudiantesGrupo2 });
    console.log(`   ✅ Trámite ${i + 4}: ${tramite.num_carpeta} - Grupo B`);
  }

  console.log(`✅ Creados/Actualizados ${tramitesCreados.length} trámites`);

  // ==================== HOJAS DE RUTA ====================
  console.log('\n📝 Creando hojas de ruta...');

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

  let totalHojasRuta = 0;

  for (const { tramite, estudiantes } of tramitesCreados) {
    const numActuaciones = Math.floor(Math.random() * 3) + 5; // Entre 5 y 7 actuaciones por trámite
    
    for (let j = 0; j < numActuaciones; j++) {
      const estudianteIndex = j % estudiantes.length;
      const estudiante = estudiantes[estudianteIndex];
      
      const fechaActuacion = new Date();
      fechaActuacion.setDate(fechaActuacion.getDate() - (numActuaciones - j)); // Fechas pasadas

      await prisma.hojaRuta.create({
        data: {
          id_tramite: tramite.id_tramite,
          id_usuario: estudiante.id_usuario,
          fecha_actuacion: fechaActuacion,
          descripcion: descripciones[j % descripciones.length],
        },
      });

      totalHojasRuta++;
    }
  }

  console.log(`✅ Creadas ${totalHojasRuta} hojas de ruta`);

  // ==================== FICHAS ====================
  console.log('\n📄 Creando fichas...');

  const temasConsulta = [
    'Consulta sobre derecho de propiedad',
    'Asesoramiento en contratos',
    'Consulta sobre sucesiones',
    'Asesoramiento en derecho laboral',
    'Consulta sobre derecho comercial',
    'Asesoramiento en derecho de familia',
  ];

  const fichasCreadas = [];

  // Crear fichas en diferentes estados
  for (let i = 0; i < 6; i++) {
    const consultante = i % 3 === 0 ? consultante1 : i % 3 === 1 ? consultante2 : consultante3;
    const docente = i % 2 === 0 ? docente1 : docente2;
    const grupo = i % 2 === 0 ? grupo1 : grupo2;
    
    const numeroConsulta = generarNumeroConsulta(i + 1);
    
    // Verificar que el número de consulta sea único
    let intentos = 0;
    let numConsultaFinal = numeroConsulta;
    while (await prisma.ficha.findUnique({ where: { numero_consulta: numConsultaFinal } })) {
      numConsultaFinal = generarNumeroConsulta(i + 1 + intentos);
      intentos++;
      if (intentos > 10) {
        throw new Error('No se pudo generar un número de consulta único');
      }
    }

    const fechaCita = new Date();
    fechaCita.setDate(fechaCita.getDate() + (i + 1) * 7); // Fechas futuras

    let estado: string;
    let idGrupoAsignado: number | null = null;

    if (i < 2) {
      estado = 'pendiente';
    } else if (i < 4) {
      estado = 'asignada';
      idGrupoAsignado = grupo.id_grupo;
    } else {
      estado = 'iniciada';
      idGrupoAsignado = grupo.id_grupo;
    }

    const ficha = await prisma.ficha.upsert({
      where: { numero_consulta: numConsultaFinal },
      update: {},
      create: {
        id_consultante: consultante.id_consultante,
        fecha_cita: fechaCita,
        hora_cita: `${9 + (i % 8)}:00`,
        tema_consulta: temasConsulta[i % temasConsulta.length],
        id_docente: docente.id_usuario,
        numero_consulta: numConsultaFinal,
        estado: estado,
        id_grupo: idGrupoAsignado,
        observaciones: i < 2 ? 'Ficha pendiente de asignación' : `Ficha ${estado} al grupo ${grupo.nombre}`,
      },
    });

    fichasCreadas.push(ficha);
    console.log(`   ✅ Ficha ${i + 1}: ${ficha.numero_consulta} - Estado: ${ficha.estado}`);
  }

  console.log(`✅ Creadas/Actualizadas ${fichasCreadas.length} fichas`);

  // ==================== NOTIFICACIONES ====================
  console.log('\n🔔 Creando notificaciones...');

  // Notificaciones para docentes sobre fichas asignadas
  for (const ficha of fichasCreadas.filter(f => f.estado === 'asignada' || f.estado === 'iniciada')) {
    await prisma.notificacion.create({
      data: {
        id_usuario: ficha.id_docente,
        titulo: `Nueva ficha asignada: ${ficha.numero_consulta}`,
        mensaje: `Se ha asignado la ficha ${ficha.numero_consulta} a tu grupo. Tema: ${ficha.tema_consulta}`,
        tipo: 'info',
        leida: false,
        tipo_entidad: 'ficha',
        id_entidad: ficha.id_ficha,
      },
    });
  }

  // Notificaciones para estudiantes sobre trámites
  for (const estudiante of estudiantesGrupo1.concat(estudiantesGrupo2)) {
    await prisma.notificacion.create({
      data: {
        id_usuario: estudiante.id_usuario,
        titulo: 'Bienvenido al sistema',
        mensaje: 'Tu cuenta ha sido activada. Puedes comenzar a trabajar en los trámites asignados a tu grupo.',
        tipo: 'success',
        leida: false,
        tipo_entidad: 'usuario',
        id_entidad: estudiante.id_usuario,
      },
    });
  }

  const totalNotificaciones = await prisma.notificacion.count();
  console.log(`✅ Creadas ${totalNotificaciones} notificaciones`);

  // ==================== AUDITORÍA ====================
  console.log('\n📝 Creando registros de auditoría...');

  await prisma.auditoria.create({
    data: {
      id_usuario: adminSistema.id_usuario,
      tipo_entidad: 'sistema',
      id_entidad: null,
      accion: 'seed',
      detalles: 'Datos completos cargados en producción',
      ip_address: '127.0.0.1',
    },
  });

  // Auditorías para creación de trámites
  for (const { tramite } of tramitesCreados.slice(0, 3)) {
    await prisma.auditoria.create({
      data: {
        id_usuario: adminAdministrativo.id_usuario,
        tipo_entidad: 'tramite',
        id_entidad: tramite.id_tramite,
        accion: 'crear',
        detalles: `Trámite creado: ${tramite.num_carpeta}`,
        ip_address: '127.0.0.1',
      },
    });
  }

  const totalAuditorias = await prisma.auditoria.count();
  console.log(`✅ Creados ${totalAuditorias} registros de auditoría`);

  // ==================== RESUMEN ====================
  console.log('\n📊 RESUMEN COMPLETO DE DATOS:');
  console.log('================================');
  console.log(`👤 Usuarios totales: ${await prisma.usuario.count()}`);
  console.log(`   - Administradores: 3 (1 Nivel 3, 1 Nivel 2, 1 Nivel 1)`);
  console.log(`   - Docentes: 7`);
  console.log(`   - Estudiantes: 6`);
  console.log(`   - Consultantes: 3`);
  console.log(`👥 Grupos: ${await prisma.grupo.count()}`);
  console.log(`🔗 Relaciones Usuario-Grupo: ${await prisma.usuarioGrupo.count()}`);
  console.log(`📋 Trámites: ${await prisma.tramite.count()}`);
  console.log(`📝 Hojas de ruta: ${await prisma.hojaRuta.count()}`);
  console.log(`📄 Fichas: ${await prisma.ficha.count()}`);
  console.log(`🧑‍💼 Consultantes: ${await prisma.consultante.count()}`);
  console.log(`🔔 Notificaciones: ${await prisma.notificacion.count()}`);
  console.log(`📝 Auditoría: ${await prisma.auditoria.count()}`);
  console.log('================================\n');

  console.log('✅ Seed completo de producción finalizado exitosamente!');
  console.log('\n🔐 CREDENCIALES DE PRUEBA:');
  console.log('================================');
  console.log('Todas las contraseñas son: password123');
  console.log('');
  console.log('Admin Sistema: CI 12345678');
  console.log('Admin Docente: CI 87654321');
  console.log('Admin Administrativo: CI 34567890');
  console.log('Docente Responsable 1: CI 11111111');
  console.log('Docente Responsable 2: CI 22222222');
  console.log('Estudiante 1: CI 55555555');
  console.log('Consultante 1: CI 40404040');
  console.log('================================\n');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error en seed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });

