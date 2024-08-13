import { Body, Controller, Get, Post } from '@nestjs/common';
import { NotificationService } from './notification.service';

@Controller('notifications')
export class NotificationController {
    constructor(private readonly notificationService: NotificationService){}

    @Post()
    async sendNotification(@Body() body: { category: string; message: string}){
        console.log('inside sendNotification')
        await this.notificationService.sendNotification(body.category, body.message)
        return { message: 'Notification sent succesfully'};
    }    

    @Get('logs')
    async getNotificationLogs(){
        return this.notificationService.getNotificationLogs();
    }
}
