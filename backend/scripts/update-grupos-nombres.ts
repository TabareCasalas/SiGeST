import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('📝 Actualizando nombres de grupos...\n');

  // Buscar los grupos por nombre actual
  const grupoSalazar = await prisma.grupo.findFirst({
    where: {
      nombre: 'Grupo Salazar',
    },
  });

  const grupoAmado = await prisma.grupo.findFirst({
    where: {
      nombre: 'Grupo Amado',
    },
  });

  if (!grupoSalazar) {
    throw new Error('No se encontró el grupo de Salazar');
  }

  if (!grupoAmado) {
    throw new Error('No se encontró el grupo de Amado');
  }

  // Actualizar nombres
  const grupo1Actualizado = await prisma.grupo.update({
    where: { id_grupo: grupoSalazar.id_grupo },
    data: {
      nombre: 'Grupo de prueba de Prof. Salazar',
    },
  });

  const grupo2Actualizado = await prisma.grupo.update({
    where: { id_grupo: grupoAmado.id_grupo },
    data: {
      nombre: 'Grupo de prueba de Prof. Amado',
    },
  });

  console.log('✅ Nombres actualizados:');
  console.log(`   - ${grupo1Actualizado.nombre} (ID: ${grupo1Actualizado.id_grupo})`);
  console.log(`   - ${grupo2Actualizado.nombre} (ID: ${grupo2Actualizado.id_grupo})`);
  console.log('\n');
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





