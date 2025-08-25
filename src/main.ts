import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import compression from 'compression';
import helmet from 'helmet';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  try {
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });

    const configService = app.get(ConfigService);
    const port = configService.get('PORT', 3001);
    const environment = configService.get('NODE_ENV', 'development');

    // Security middleware
    app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          imgSrc: ["'self'", "data:", "https:"],
          scriptSrc: ["'self'"],
          mediaSrc: ["'self'", "https:"],
        },
      },
    }));

    // Performance middleware
    app.use(compression());

    // CORS configuration
    // app.enableCors({
    //   origin: configService.get('FRONTEND_URL', 'http://localhost:5173'),
    //   credentials: true,
    //   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    //   allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    // });

 app.enableCors({
    origin: process.env.FRONTEND_URL || '*',
    methods: 'GET, HEAD, POST, PUT, DELETE, OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
  });

    // Global pipes
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    // Global filters
    // app.useGlobalFilters(new HttpExceptionFilter());

    // // Global interceptors
    // app.useGlobalInterceptors(
    //   new LoggingInterceptor(),
    //   new TransformInterceptor(),
    // );

    // API prefix
    app.setGlobalPrefix('api/v1');
    // Swagger documentation
    if (environment === 'development') {
      const config = new DocumentBuilder()
        .setTitle('YouTube Clipper API')
        .setDescription('API for YouTube clip generation and custom templates')
        .setVersion('1.0')
        .addBearerAuth()
        .addTag('auth', 'Authentication endpoints')
        .addTag('users', 'User management')
        .addTag('templates', 'Custom template management')
        .addTag('clips', 'Clip generation and management')
        .addTag('videos', 'Video processing')
        .build();

      const document = SwaggerModule.createDocument(app, config);
      SwaggerModule.setup('api/docs', app, document);
    }

    // Graceful shutdown
    app.enableShutdownHooks();

    await app.listen(port);

    logger.log(`🚀 YouTube Clipper API running on port ${port}`);
    logger.log(` Environment: ${environment}`);
    logger.log(` API Documentation: http://localhost:${port}/api/docs`);
    logger.log(` Frontend URL: ${configService.get('FRONTEND_URL')}`);

  } catch (error) {
    logger.error('Failed to start application', error.stack);
    process.exit(1);
  }
  // await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
