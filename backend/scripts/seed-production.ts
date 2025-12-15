import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;
const DEFAULT_PASSWORD = 'password123'; // Contraseña por defecto para todos los usuarios de prueba

async function main() {
  console.log('🌱 Iniciando seed de datos para producción...\n');

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

  console.log(`✅ Creados/Actualizados ${3} administradores (con niveles de acceso), ${7} docentes`);

  // ==================== GRUPOS ====================
  console.log('\n👥 Creando grupos...');

  const grupo1 = await prisma.grupo.upsert({
    where: { id_grupo: 1 },
    update: {
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

  const grupo2 = await prisma.grupo.upsert({
    where: { id_grupo: 2 },
    update: {
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

  await prisma.consultante.upsert({
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

  await prisma.consultante.upsert({
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

  await prisma.consultante.upsert({
    where: { id_usuario: usuarioConsultante3.id_usuario },
    update: {},
    create: {
      id_usuario: usuarioConsultante3.id_usuario,
      est_civil: 'Divorciado',
      nro_padron: 34567,
    },
  });

  console.log(`✅ Creados/Actualizados 3 consultantes`);

  // ==================== AUDITORÍA ====================
  console.log('\n📝 Creando registros de auditoría...');

  await prisma.auditoria.create({
    data: {
      id_usuario: adminSistema.id_usuario,
      tipo_entidad: 'sistema',
      id_entidad: null,
      accion: 'seed',
      detalles: 'Datos iniciales cargados en producción',
      ip_address: '127.0.0.1',
    },
  });

  console.log(`✅ Registro de auditoría creado`);

  // ==================== RESUMEN ====================
  console.log('\n📊 RESUMEN DE DATOS:');
  console.log('================================');
  console.log(`👤 Usuarios totales: ${await prisma.usuario.count()}`);
  console.log(`   - Administradores: 3 (1 Nivel 3, 1 Nivel 2, 1 Nivel 1)`);
  console.log(`   - Docentes: 7`);
  console.log(`   - Estudiantes: 6`);
  console.log(`   - Consultantes: 3`);
  console.log(`👥 Grupos: ${await prisma.grupo.count()}`);
  console.log(`🔗 Relaciones Usuario-Grupo: ${await prisma.usuarioGrupo.count()}`);
  console.log(`📋 Trámites: ${await prisma.tramite.count()}`);
  console.log(`🧑‍💼 Consultantes: ${await prisma.consultante.count()}`);
  console.log(`📝 Auditoría: ${await prisma.auditoria.count()}`);
  console.log('================================\n');

  console.log('✅ Seed de producción completado exitosamente!');
  console.log('\n🔐 CREDENCIALES DE PRUEBA:');
  console.log('================================');
  console.log('Todas las contraseñas son: password123');
  console.log('');
  console.log('Admin Sistema:');
  console.log('  CI: 12345678');
  console.log('  Correo: admin@sistema.com');
  console.log('');
  console.log('Admin Docente:');
  console.log('  CI: 87654321');
  console.log('  Correo: directora@universidad.com');
  console.log('');
  console.log('Admin Administrativo:');
  console.log('  CI: 34567890');
  console.log('  Correo: secretario@universidad.com');
  console.log('');
  console.log('Docente Responsable 1:');
  console.log('  CI: 11111111');
  console.log('  Correo: roberto.fernandez@universidad.com');
  console.log('');
  console.log('Docente Responsable 2:');
  console.log('  CI: 22222222');
  console.log('  Correo: ana.martinez@universidad.com');
  console.log('');
  console.log('Estudiante 1:');
  console.log('  CI: 55555555');
  console.log('  Correo: lucia.gonzalez@estudiantes.com');
  console.log('');
  console.log('Consultante 1:');
  console.log('  CI: 40404040');
  console.log('  Correo: andres.mendez@email.com');
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


