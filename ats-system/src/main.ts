import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 4000;
  const frontendUrl = configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';

  // Enable CORS for the frontend
  app.enableCors({
    origin: frontendUrl,
    credentials: true,
  });

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strips non-decorated properties from DTOs
      forbidNonWhitelisted: false, // Throws error if non-decorated properties are sent
      transform: true, // Automatically transforms payloads to DTO instances
      exceptionFactory: (errors) => {
        const messages = errors.map((error) => {
          if (error.constraints) {
            return Object.values(error.constraints).join('. ');
          }
          return `Invalid value for ${error.property}`;
        });
        logger.error(`Validation failed: ${messages.join(' | ')}`);
        return new BadRequestException(messages.join(' | '));
      },
    }),
  );

  // Add request logging middleware
  app.use((req, res, next) => {
    logger.log(`Incoming Request: ${req.method} ${req.url}`);
    next();
  });

  await app.listen(port, '0.0.0.0');
  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`CORS enabled for: ${frontendUrl}`);
}
bootstrap();
