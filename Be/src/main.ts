import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
  });

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Open Recruitment Neo Telemetri 2026 API')
    .setDescription(
      'The complete API documentation for Open Recruitment Neo Telemetri 2026. ' +
        'This API handles user authentication, profile management, recruitment timelines, ' +
        'exam management, assignments, and more.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Authentication', 'User authentication and session management')
    .addTag('Profile', 'Personal profile and user identity')
    .addTag('Verification', 'Document submission and verification process')
    .addTag('Dashboard', 'Main overview for recruitment progress')
    .addTag('Timeline', 'Schedule and recruitment milestones')
    .addTag('Learning Module', 'Educational resources and training materials')
    .addTag('Exam', 'Online examination and assessment tools')
    .addTag('Assignment', 'Task management and project submissions')
    .addTag('Attendance', 'Event presence and check-in system')
    .addTag('Payment', 'Registration fees and billing verification')
    .addTag('Master Data', 'Administrative system configurations')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      docExpansion: 'none',
      defaultModelsExpandDepth: -1,
    },
    customSiteTitle: 'OR Neo Telemetri 2026 API Docs',
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`\nServer is running on http://localhost:${port}/api`);
  console.log(`Swagger documentation: http://localhost:${port}/docs\n`);
}
void bootstrap();
