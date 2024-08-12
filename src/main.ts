import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*', // Allow requests from any origin (use with caution in production)
  });
  
  await app.listen(3001);
}
bootstrap();
