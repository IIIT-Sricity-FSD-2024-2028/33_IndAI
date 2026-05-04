import { DataStore } from '../../store/data.store';
import { CreateNotificationDto, UpdateNotificationDto } from './dto';
export declare class NotificationsService {
    private readonly db;
    constructor(db: DataStore);
    findAll(): any[];
    findByUser(userId: string): any[];
    findOne(id: string): any;
    create(body: CreateNotificationDto): {
        message: string;
        createdAt: string;
        userId: string;
        title?: string;
        type: string;
        read: boolean;
        id: string;
    };
    update(id: string, body: UpdateNotificationDto): any;
    markRead(id: string): any;
    remove(id: string): {
        id: string;
    };
}
