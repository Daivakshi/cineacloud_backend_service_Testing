import { Injectable, NotFoundException, Req } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Notifications, NotificationsDocument } from './model/notification.schema';

@Injectable()
export class NotificationService {
    constructor(
        @InjectModel(Notifications.name) private notifyModel: Model<NotificationsDocument>,
    ) { }

    async getAllNotifications(user, skipRec, gIntDataPerPage) {
        return await this.notifyModel.aggregate([{
            $match: {
                userId: Types.ObjectId(user._id),
                isDeleted: false
            }
        }, {
            $lookup: {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "userId",
            },
        },
        {
            $unwind: {
                path: "$userId",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $lookup: {
                from: "anonymous",
                localField: "userId",
                foreignField: "_id",
                as: "anonymousId",
            },
        },
        {
            $unwind: {
                path: "$anonymousId",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "createdUser",
                foreignField: "_id",
                as: "createdUser",
            },
        },
        {
            $unwind: {
                path: "$createdUser",
                preserveNullAndEmptyArrays: true,
            },
        }]).sort('-createdAt').skip(skipRec).limit(gIntDataPerPage)
    };

    async getNotificationCount(condition) {
        return await this.notifyModel.find(condition);
    };

    async updateMany(data) {
        return await this.notifyModel.updateMany(data, { $set: { "isSeen": true } }, { multi: true })
    }
}
