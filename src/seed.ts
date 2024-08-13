import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { User } from './notification/user.entity';
import { Repository } from 'typeorm';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const userRepository = app.get<Repository<User>>('UserRepository');

  await userRepository.query('TRUNCATE TABLE "notification", "user" CASCADE');

  // Pre-populate users
  const users = [
    {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '1234567890',
      subscribedCategories: ['Sports', 'Movies'],
      channels: ['Email', 'SMS'],
    },
    {
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '0987654321',
      subscribedCategories: ['Finance'],
      channels: ['Email'],
    },
    {
      name: 'Alice Johnson',
      email: 'alice@example.com',
      phone: '1122334455',
      subscribedCategories: ['Sports', 'Finance'],
      channels: ['Push Notification'],
    },
  ];

  await userRepository.save(users);

  console.log('Users have been populated');

  await app.close();
}

bootstrap();
