import { NotificationsService } from './notifications.service';
import { CreateNotificationDto, UpdateNotificationDto } from './dto';
export declare class NotificationsController {
    private readonly service;
    constructor(service: NotificationsService);
    all(): {
        success: boolean;
        data: any[];
    };
    byUser(userId: string): {
        success: boolean;
        data: any[];
    };
    one(id: string): {
        success: boolean;
        data: any;
    };
    create(b: CreateNotificationDto): {
        success: boolean;
        data: {
            message: string;
            createdAt: string;
            userId: string;
            title?: string;
            type: string;
            read: boolean;
            id: string;
        };
    };
    update(id: string, b: UpdateNotificationDto): {
        success: boolean;
        data: any;
    };
    read(id: string): {
        success: boolean;
        data: any;
    };
    remove(id: string): {
        success: boolean;
        data: {
            id: string;
        };
    };
}
