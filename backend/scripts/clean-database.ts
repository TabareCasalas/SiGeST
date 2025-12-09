import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Iniciando limpieza completa de base de datos...');
  console.log('⚠️  Se eliminarán TODOS los datos, incluyendo usuarios de prueba\n');

  // 2. Eliminar documentos adjuntos (primero porque dependen de trámites)
  console.log('🗑️  Eliminando documentos adjuntos...');
  const documentosEliminados = await prisma.documentoAdjunto.deleteMany({});
  console.log(`   ✅ Eliminados ${documentosEliminados.count} documentos adjuntos`);

  // 3. Eliminar hojas de ruta (dependen de trámites)
  console.log('🗑️  Eliminando hojas de ruta...');
  const hojasRutaEliminadas = await prisma.hojaRuta.deleteMany({});
  console.log(`   ✅ Eliminadas ${hojasRutaEliminadas.count} hojas de ruta`);

  // 4. Eliminar notificaciones (dependen de trámites y usuarios)
  console.log('🗑️  Eliminando notificaciones...');
  const notificacionesEliminadas = await prisma.notificacion.deleteMany({});
  console.log(`   ✅ Eliminadas ${notificacionesEliminadas.count} notificaciones`);

  // 5. Eliminar trámites (dependen de consultantes y grupos)
  console.log('🗑️  Eliminando trámites...');
  const tramitesEliminados = await prisma.tramite.deleteMany({});
  console.log(`   ✅ Eliminados ${tramitesEliminados.count} trámites`);

  // 6. Eliminar fichas (dependen de consultantes, docentes y grupos)
  console.log('🗑️  Eliminando fichas...');
  const fichasEliminadas = await prisma.ficha.deleteMany({});
  console.log(`   ✅ Eliminadas ${fichasEliminadas.count} fichas`);

  // 7. Eliminar relaciones usuario-grupo
  console.log('🗑️  Eliminando relaciones usuario-grupo...');
  const relacionesEliminadas = await prisma.usuarioGrupo.deleteMany({});
  console.log(`   ✅ Eliminadas ${relacionesEliminadas.count} relaciones usuario-grupo`);

  // 8. Eliminar grupos
  console.log('🗑️  Eliminando grupos...');
  const gruposEliminados = await prisma.grupo.deleteMany({});
  console.log(`   ✅ Eliminados ${gruposEliminados.count} grupos`);

  // 9. Eliminar consultantes
  console.log('🗑️  Eliminando consultantes...');
  const consultantesEliminados = await prisma.consultante.deleteMany({});
  console.log(`   ✅ Eliminados ${consultantesEliminados.count} consultantes`);

  // 10. Eliminar solicitudes de reactivación
  console.log('🗑️  Eliminando solicitudes de reactivación...');
  const solicitudesEliminadas = await prisma.solicitudReactivacion.deleteMany({});
  console.log(`   ✅ Eliminadas ${solicitudesEliminadas.count} solicitudes de reactivación`);

  // 11. Eliminar auditorías
  console.log('🗑️  Eliminando auditorías...');
  const auditoriasEliminadas = await prisma.auditoria.deleteMany({});
  console.log(`   ✅ Eliminadas ${auditoriasEliminadas.count} auditorías`);

  // 12. Eliminar TODOS los usuarios (incluyendo los de prueba)
  console.log('🗑️  Eliminando todos los usuarios (incluyendo usuarios de prueba)...');
  const usuariosEliminados = await prisma.usuario.deleteMany({});
  console.log(`   ✅ Eliminados ${usuariosEliminados.count} usuarios`);

  // Resumen final
  console.log('\n📊 RESUMEN FINAL:');
  console.log('================================');
  console.log(`👤 Usuarios: ${await prisma.usuario.count()}`);
  console.log(`👥 Grupos: ${await prisma.grupo.count()}`);
  console.log(`🔗 Relaciones Usuario-Grupo: ${await prisma.usuarioGrupo.count()}`);
  console.log(`📋 Trámites: ${await prisma.tramite.count()}`);
  console.log(`📄 Fichas: ${await prisma.ficha.count()}`);
  console.log(`🧑‍💼 Consultantes: ${await prisma.consultante.count()}`);
  console.log(`📝 Auditorías: ${await prisma.auditoria.count()}`);
  console.log(`🔔 Notificaciones: ${await prisma.notificacion.count()}`);
  console.log(`📝 Hojas de Ruta: ${await prisma.hojaRuta.count()}`);
  console.log(`📎 Documentos: ${await prisma.documentoAdjunto.count()}`);
  console.log(`🔄 Solicitudes de Reactivación: ${await prisma.solicitudReactivacion.count()}`);
  console.log('================================\n');

  console.log('✅ Limpieza completada exitosamente!');
  console.log('💡 Todos los datos han sido eliminados, incluyendo los usuarios de prueba.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error en limpieza:', e);
    await prisma.$disconnect();
    process.exit(1);
  });

