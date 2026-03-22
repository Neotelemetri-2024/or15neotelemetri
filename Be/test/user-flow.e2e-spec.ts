import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '@/app.module';
import { PrismaService } from '@/common/services/prisma.service';
import { CloudinaryStorageService } from '@/common/services/storage/cloudinary-storage.service';
import { UserRole, AttemptStatus } from '../prisma/generated-client/client';
import { JwtService } from '@nestjs/jwt';

describe('UserFlow: Exam & Assignment (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let userToken: string;
  let subDivisionId: string;
  let examId: string;
  let assignmentId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(CloudinaryStorageService)
      .useValue({ uploadFile: jest.fn().mockResolvedValue('http://mock.url/file') })
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
    const jwtService = app.get<JwtService>(JwtService);

    // Setup Test Data
    const user = await prisma.user.create({
      data: {
        email: 'flow-user@example.com',
        passwordHash: 'hashed',
        role: UserRole.USER,
      },
    });
    userToken = jwtService.sign({ sub: user.id, email: user.email, role: user.role });

    const dept = await prisma.department.create({ data: { name: 'Flow Dept' } });
    const div = await prisma.division.create({ data: { name: 'Flow Div', departmentId: dept.id } });
    const subDiv = await prisma.subDivision.create({ data: { name: 'Flow SubDiv', divisionId: div.id } });
    subDivisionId = subDiv.id;

    await prisma.profile.create({
      data: { userId: user.id, fullName: 'Flow User', nim: 'FLOW-1', subDivisionId },
    });

    // Add PAID payment to allow starting exam
    await prisma.payment.create({
      data: {
        userId: user.id,
        provider: 'MIDTRANS',
        amount: 50000,
        status: 'PAID',
        paidAt: new Date(),
      },
    });

    const exam = await prisma.exam.create({
      data: { title: 'Flow Exam', subDivisionId, durationMinutes: 30 },
    });
    examId = exam.id;

    const asg = await prisma.assignment.create({
        data: { title: 'Flow Assignment', subDivisionId, dueAt: new Date(), createdByAdminId: (await prisma.user.create({ data: { email: 'admin-flow@ex.com', passwordHash: 'h', role: UserRole.ADMIN } })).id }
    });
    assignmentId = asg.id;
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
    await prisma.department.deleteMany();
    await app.close();
  });

  it('1. User starts exam attempt', async () => {
    const res = await request(app.getHttpServer())
      .post(`/api/exams/user/${examId}/start`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(201);
    
    expect(res.body.status).toBe('IN_PROGRESS');
  });

  it('2. User submits exam', async () => {
    const attempt = await prisma.examAttempt.findFirst({ where: { examId } });
    await request(app.getHttpServer())
      .post(`/api/exams/user/attempts/${attempt!.id}/submit`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ answers: [] })
      .expect(201); // Controller returns 201 for POST submit

    const updated = await prisma.examAttempt.findUnique({ where: { id: attempt!.id } });
    expect(updated!.status).toBe(AttemptStatus.SUBMITTED);
  });

  it('3. User submits assignment (Only possible after exam)', async () => {
    await request(app.getHttpServer())
      .post(`/api/assignments/${assignmentId}/submit`)
      .set('Authorization', `Bearer ${userToken}`)
      .attach('file', Buffer.from('my work'), 'work.zip')
      .expect(201);
  });
});
