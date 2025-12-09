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
function generarCIValida(base: string): string {
  const digitoVerificador = validationDigit(base);
  return base + digitoVerificador.toString();
}

async function main() {
  console.log('👤 Creando usuarios de prueba (consultantes, estudiantes, docente y administrativo)...\n');

  // ==================== CONSULTANTES ====================
  console.log('🧑‍💼 Creando consultantes de prueba...');
  
  const consultantes = [
    { nombre: 'Carlos MARTINEZ LOPEZ', ciBase: '5000000' },
    { nombre: 'Ana GONZALEZ RODRIGUEZ', ciBase: '5000001' },
    { nombre: 'Luis FERNANDEZ SILVA', ciBase: '5000002' },
  ];

  const consultantesCreados = [];
  let nroPadronBase = 50000; // Base para números de padrón únicos
  
  for (const consultante of consultantes) {
    const ciCompleta = generarCIValida(consultante.ciBase);
    const password = await bcrypt.hash(ciCompleta, SALT_ROUNDS);
    
    const usuario = await prisma.usuario.upsert({
      where: { ci: ciCompleta },
      update: {
        nombre: consultante.nombre,
        correo: `${consultante.nombre.toLowerCase().replace(/\s+/g, '.')}@test.com`,
        password: password,
        rol: 'consultante',
        activo: true,
      },
      create: {
        nombre: consultante.nombre,
        ci: ciCompleta,
        domicilio: 'Dirección de prueba',
        telefono: '099000000',
        correo: `${consultante.nombre.toLowerCase().replace(/\s+/g, '.')}@test.com`,
        password: password,
        rol: 'consultante',
        activo: true,
      },
    });

    // Crear registro de consultante con número de padrón único
    const nroPadron = nroPadronBase++;
    const consultanteRegistro = await prisma.consultante.upsert({
      where: { id_usuario: usuario.id_usuario },
      update: {
        est_civil: 'Soltero',
        nro_padron: nroPadron,
      },
      create: {
        id_usuario: usuario.id_usuario,
        est_civil: 'Soltero',
        nro_padron: nroPadron,
      },
    });

    consultantesCreados.push({ ...usuario, ci: ciCompleta });
    console.log(`   ✅ ${consultante.nombre} - CI: ${ciCompleta}`);
  }

  // ==================== ESTUDIANTES ====================
  console.log('\n👨‍🎓 Creando estudiantes de prueba...');
  
  const estudiantes = [
    { nombre: 'María SANTOS PEREZ', ciBase: '6000000' },
    { nombre: 'Juan TORRES GARCIA', ciBase: '6000001' },
    { nombre: 'Lucía RAMIREZ CASTRO', ciBase: '6000002' },
    { nombre: 'Diego MORALES VEGA', ciBase: '6000003' },
    { nombre: 'Sofía HERRERA MENDEZ', ciBase: '6000004' },
    { nombre: 'Andrés JIMENEZ RUIZ', ciBase: '6000005' },
  ];

  const estudiantesCreados = [];
  for (const estudiante of estudiantes) {
    const ciCompleta = generarCIValida(estudiante.ciBase);
    const password = await bcrypt.hash(ciCompleta, SALT_ROUNDS);
    
    const usuario = await prisma.usuario.upsert({
      where: { ci: ciCompleta },
      update: {
        nombre: estudiante.nombre,
        correo: `${estudiante.nombre.toLowerCase().replace(/\s+/g, '.')}@test.com`,
        password: password,
        rol: 'estudiante',
        semestre: '2024-2',
        activo: true,
      },
      create: {
        nombre: estudiante.nombre,
        ci: ciCompleta,
        domicilio: 'Dirección de prueba',
        telefono: '099000000',
        correo: `${estudiante.nombre.toLowerCase().replace(/\s+/g, '.')}@test.com`,
        password: password,
        rol: 'estudiante',
        semestre: '2024-2',
        activo: true,
      },
    });

    estudiantesCreados.push({ ...usuario, ci: ciCompleta });
    console.log(`   ✅ ${estudiante.nombre} - CI: ${ciCompleta}`);
  }

  // ==================== DOCENTE ====================
  console.log('\n👨‍🏫 Creando docente de prueba...');
  
  const docenteCiBase = '7000000';
  const docenteCiCompleta = generarCIValida(docenteCiBase);
  const docentePassword = await bcrypt.hash(docenteCiCompleta, SALT_ROUNDS);
  
  const docente = await prisma.usuario.upsert({
    where: { ci: docenteCiCompleta },
    update: {
      nombre: 'Roberto MARTINEZ GARCIA',
      correo: 'docente.prueba@test.com',
      password: docentePassword,
      rol: 'docente',
      activo: true,
    },
    create: {
      nombre: 'Roberto MARTINEZ GARCIA',
      ci: docenteCiCompleta,
      domicilio: 'Dirección de prueba',
      telefono: '099000000',
      correo: 'docente.prueba@test.com',
      password: docentePassword,
      rol: 'docente',
      activo: true,
    },
  });

  console.log(`   ✅ ${docente.nombre} - CI: ${docenteCiCompleta}`);

  // ==================== ADMINISTRATIVO ====================
  console.log('\n👔 Creando administrativo de prueba...');
  
  const adminCiBase = '8000000';
  const adminCiCompleta = generarCIValida(adminCiBase);
  const adminPassword = await bcrypt.hash(adminCiCompleta, SALT_ROUNDS);
  
  const administrativo = await prisma.usuario.upsert({
    where: { ci: adminCiCompleta },
    update: {
      nombre: 'María LOPEZ FERNANDEZ',
      correo: 'admin.prueba@test.com',
      password: adminPassword,
      rol: 'administrador',
      nivel_acceso: 1, // Administrativo
      activo: true,
    },
    create: {
      nombre: 'María LOPEZ FERNANDEZ',
      ci: adminCiCompleta,
      domicilio: 'Dirección de prueba',
      telefono: '099000000',
      correo: 'admin.prueba@test.com',
      password: adminPassword,
      rol: 'administrador',
      nivel_acceso: 1, // Administrativo
      activo: true,
    },
  });

  console.log(`   ✅ ${administrativo.nombre} - CI: ${adminCiCompleta}`);

  console.log('\n📊 RESUMEN:');
  console.log('================================');
  console.log(`✅ Consultantes creados: ${consultantesCreados.length}`);
  console.log(`✅ Estudiantes creados: ${estudiantesCreados.length}`);
  console.log(`✅ Docente creado: 1`);
  console.log(`✅ Administrativo creado: 1`);
  console.log('================================\n');

  console.log('🔐 CREDENCIALES DE PRUEBA:');
  console.log('================================');
  console.log('\n🧑‍💼 CONSULTANTES DE PRUEBA:');
  consultantesCreados.forEach((c, idx) => {
    console.log(`   ${idx + 1}. ${c.nombre}`);
    console.log(`      CI: ${c.ci} | Password: ${c.ci}`);
  });
  
  console.log('\n👨‍🎓 ESTUDIANTES DE PRUEBA:');
  estudiantesCreados.forEach((e, idx) => {
    console.log(`   ${idx + 1}. ${e.nombre}`);
    console.log(`      CI: ${e.ci} | Password: ${e.ci}`);
  });

  console.log('\n👨‍🏫 DOCENTE DE PRUEBA:');
  console.log(`   1. ${docente.nombre}`);
  console.log(`      CI: ${docenteCiCompleta} | Password: ${docenteCiCompleta}`);

  console.log('\n👔 ADMINISTRATIVO DE PRUEBA:');
  console.log(`   1. ${administrativo.nombre}`);
  console.log(`      CI: ${adminCiCompleta} | Password: ${adminCiCompleta}`);
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

