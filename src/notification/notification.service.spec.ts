import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from './notification.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Notification } from './notification.entity';
import { User } from './user.entity';
import { Repository } from 'typeorm';

describe('NotificationService', () => {
  let service: NotificationService;
  let notificationRepository: Repository<Notification>;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: getRepositoryToken(Notification),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    notificationRepository = module.get<Repository<Notification>>(getRepositoryToken(Notification));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));

    // Mock the create method to return a new Notification object
    jest.spyOn(notificationRepository, 'create').mockImplementation((notification) => {
      return {
        ...notification,
        id: Date.now(), // Mock ID generation
        timestamp: new Date(),
      } as Notification;
    });

    // Mock the save method to resolve to the created notification object
    jest.spyOn(notificationRepository, 'save').mockImplementation(async (notification) => {
      return {
        ...notification,
        id: notification.id ?? Date.now(), // Ensure the ID is set
        user: {
          ...notification.user,
          id: notification.user.id ?? Date.now(), // Ensure the User ID is set
        } as User,
        timestamp: notification.timestamp ?? new Date(), // Ensure timestamp is set
      } as Notification;
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendNotification', () => {
    it('should create and save notifications for each user', async () => {
      const category = 'Sports';
      const message = 'New Sports event!';

      const users = [
        {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          phone: '1234567890',
          subscribedCategories: ['Sports'],
          channels: ['Email', 'SMS'],
        },
      ];

      jest.spyOn(userRepository, 'createQueryBuilder').mockImplementation(() => ({
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(users),
      }) as any);

      const saveSpy = jest.spyOn(notificationRepository, 'save').mockResolvedValue(undefined);

      await service.sendNotification(category, message);

      expect(saveSpy).toHaveBeenCalledTimes(2); // Once for Email, once for SMS
      expect(saveSpy).toHaveBeenCalledWith(expect.objectContaining({ message }));
    });

    it('should not create notifications if no users are subscribed to the category', async () => {
      const category = 'Movies';
      const message = 'New Movie released!';

      jest.spyOn(userRepository, 'createQueryBuilder').mockImplementation(() => ({
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      }) as any);

      const saveSpy = jest.spyOn(notificationRepository, 'save').mockResolvedValue(undefined);

      await service.sendNotification(category, message);

      expect(saveSpy).not.toHaveBeenCalled();
    });
  });

  describe('getNotificationLogs', () => {
    it('should return a list of notifications', async () => {
      const logs = [
        {
          id: 1,
          timestamp: new Date(),
          category: 'Sports',
          message: 'New Sports event!',
          channel: 'Email',
          user: {
            id: 1,
            name: 'John Doe',
            email: 'john@example.com',
            phone: '1234567890',
            subscribedCategories: ['Sports'],
            channels: ['Email', 'SMS'],
            notifications: [],
          },
        },
      ];

      jest.spyOn(notificationRepository, 'find').mockResolvedValue(logs as Notification[]);

      const result = await service.getNotificationLogs();

      expect(result).toEqual(logs);
      expect(result[0].category).toBe('Sports');
    });
  });
});
