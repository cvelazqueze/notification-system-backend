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
        const users = await this.userRepository
            .createQueryBuilder('user')
            .where(':category = ANY (user.subscribedCategories)', { category })
            .getMany();
        
        for(const user of users) {
            for (const channel of user.channels){
                const notification = this.notificationRepository.create({
                    user,
                    category,
                    channel,
                    message,
                });
                await this.notificationRepository.save(notification);
            }
        }
    }

    async getNotificationLogs(): Promise<Notification[]> {
        return this.notificationRepository.find({order: { timestamp: 'DESC'}, relations: ['user']})
    }
}
