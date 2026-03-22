import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import { PrismaClient, UserRole } from './generated-client/client';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Start seeding...');

  // 1. Departments
  const operasional = await prisma.department.upsert({
    where: { name: 'Operasional' },
    update: {},
    create: { name: 'Operasional' },
  });

  const organisasi = await prisma.department.upsert({
    where: { name: 'Organisasi' },
    update: {},
    create: { name: 'Organisasi' },
  });

  // 2. Divisions for Operasional
  const programming = await prisma.division.upsert({
    where: { departmentId_name: { departmentId: operasional.id, name: 'Programming' } },
    update: {},
    create: { departmentId: operasional.id, name: 'Programming' },
  });

  const skj = await prisma.division.upsert({
    where: { departmentId_name: { departmentId: operasional.id, name: 'Sistem Komputer Jaringan' } },
    update: {},
    create: { departmentId: operasional.id, name: 'Sistem Komputer Jaringan' },
  });

  const multimedia = await prisma.division.upsert({
    where: { departmentId_name: { departmentId: operasional.id, name: 'Multimedia dan Design' } },
    update: {},
    create: { departmentId: operasional.id, name: 'Multimedia dan Design' },
  });

  // 3. Divisions for Organisasi
  await prisma.division.upsert({
    where: { departmentId_name: { departmentId: organisasi.id, name: 'Organizing Committee' } },
    update: {},
    create: { departmentId: organisasi.id, name: 'Organizing Committee' },
  });

  await prisma.division.upsert({
    where: { departmentId_name: { departmentId: organisasi.id, name: 'Public Relation' } },
    update: {},
    create: { departmentId: organisasi.id, name: 'Public Relation' },
  });

  await prisma.division.upsert({
    where: { departmentId_name: { departmentId: organisasi.id, name: 'Marketing' } },
    update: {},
    create: { departmentId: organisasi.id, name: 'Marketing' },
  });

  await prisma.division.upsert({
    where: { departmentId_name: { departmentId: organisasi.id, name: 'HRD' } },
    update: {},
    create: { departmentId: organisasi.id, name: 'HRD' },
  });

  // 4. SubDivisions for Programming
  const subDivisionsProgramming = ['Web Programming', 'Machine Learning', 'Mobile Programming'];
  for (const name of subDivisionsProgramming) {
    await prisma.subDivision.upsert({
      where: { divisionId_name: { divisionId: programming.id, name } },
      update: {},
      create: { divisionId: programming.id, name },
    });
  }

  // 5. SubDivisions for Multimedia dan Design
  const subDivisionsMultimedia = ['UI/UX', 'Video Editing', '3D Design'];
  for (const name of subDivisionsMultimedia) {
    await prisma.subDivision.upsert({
      where: { divisionId_name: { divisionId: multimedia.id, name } },
      update: {},
      create: { divisionId: multimedia.id, name },
    });
  }

  // 6. SubDivisions for Sistem Komputer Jaringan
  const subDivisionsSkj = ['Sistem', 'Network'];
  for (const name of subDivisionsSkj) {
    await prisma.subDivision.upsert({
      where: { divisionId_name: { divisionId: skj.id, name } },
      update: {},
      create: { divisionId: skj.id, name },
    });
  }

  // 7. Users
  const passwordHash = await bcrypt.hash('password!', 10);

  // Admin User
  await prisma.user.upsert({
    where: { email: 'adminneo@gmail.com' },
    update: {},
    create: {
      email: 'adminneo@gmail.com',
      passwordHash,
      role: UserRole.ADMIN,
      profile: {
        create: {
          fullName: 'Admin Neo Telemetri',
          nim: 'ADMIN001',
          whatsappNumber: '081234567890',
        },
      },
    },
  });

  // Regular User
  await prisma.user.upsert({
    where: { email: 'userneo@gmail.com' },
    update: {},
    create: {
      email: 'userneo@gmail.com',
      passwordHash,
      role: UserRole.USER,
      profile: {
        create: {
          fullName: 'Regular User',
          nim: 'USER001',
          whatsappNumber: '081234567891',
        },
      },
    },
  });

  console.log('Seeding finished.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
