import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';
import { User } from './user.entity';

@Injectable()
export class NotificationService {
    constructor(
        @InjectRepository(Notification)
        private notificationRepository: Repository<Notification>,
        
        @InjectRepository(User)
        private userRepository: Repository<User>,

    ){}
    
    async sendNotification(category: string, message: string): Promise<void>{
        console.log('inside for sendNotificationService')
        const users = await this.userRepository
            .createQueryBuilder('user')
            .where(':category = ANY (user.subscribedCategories)', { category })
            .getMany();
        console.log('inside for users:', users)
        for(const user of users) {
            console.log('inside for user')
            for (const channel of user.channels){
                console.log('inside for channel')
                const notification = this.notificationRepository.create({
                    user,
                    category,
                    channel,
                    message,
                });
                const savedNotification = await this.notificationRepository.save(notification);

            // Add logging to confirm the notification is saved
            console.log('Notification saved:', savedNotification);
            }
        }
    }

    async getNotificationLogs(): Promise<Notification[]> {
        return this.notificationRepository.find({order: { timestamp: 'DESC'}, relations: ['user']})
    }
}
