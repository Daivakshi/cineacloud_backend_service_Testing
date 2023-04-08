import { Injectable, NotFoundException } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { vfx_comments, CommentsDoc } from './models/comments.schema';
import { User, UsersDocument } from '../../src/users/model/users.schema';
import { CreateCommentDto } from './dtos/create-comment.dto';

@Injectable()
export class CommentsService {
    constructor(
        @InjectModel(vfx_comments.name) private commentsModel: Model<CommentsDoc>,
        @InjectModel(User.name) private userModel: Model<UsersDocument>,
    ) { }

    async findAllComments(data: any) {
        return await this.commentsModel.find(data).populate('userId').exec()
    };

    async findUser(data: any) {
        return await this.userModel.findOne(data).lean().exec();
    };

    async createComment(data: CreateCommentDto) {
        const comment = new this.commentsModel(data);
        return await comment.save();
    };

    async getAllComments(data: any, type: string) {

        let appQuery = {};

        switch (type) {
            case 'props':
                appQuery = {
                    $lookup: {
                        from: "props",
                        localField: "appId",
                        foreignField: "_id",
                        as: "appId",
                    },
                };

                break;
        };
 
        const comments = await this.commentsModel.aggregate([
            {
                $match: data
            },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "userId",
                },
            },
            { $unwind: { path: "$userId", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    "_id": 1,
                    "status": 1,
                    "markAsComplete": 1,
                    "appId": 1,
                    "screenId": 1,
                    "comment": 1,
                    "userId": {
                        "_id": "$userId._id",
                        "isVerified": "$userId.isVerified",
                        "loginAttempts": "$userId.loginAttempts",
                        "role": "$userId.role",
                        "isFestivalManager": "$userId.isFestivalManager",
                        "firstName": "$userId.firstName",
                        "lastName": "$userId.lastName",
                        "company": "$userId.company",
                        "email": "$userId.email",
                        "date": "$userId.date",
                        "stripeCustId": "$userId.stripeCustId",
                        "plan": "$userId.plan",
                        "planLabel": "$userId.planLabel",
                        "planId": "$userId.planId",
                        "trialDescription": "$userId.trialDescription",
                        "lastLoggedIn": "$userId.lastLoggedIn",
                        "planSpace": "$userId.planSpace"
                    },
                    "commentRes": 1,
                    "createdAt": 1,
                    "updatedAt": 1
                }
            },
            appQuery,
            { $unwind: { path: "$appId", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "medias",
                    localField: "screenId",
                    foreignField: "_id",
                    as: "screenId",
                },
            },
            { $unwind: { path: "$screenId", preserveNullAndEmptyArrays: true } },
        ]);

        return comments;
    };

    async getCommentsById(data: any, type: string) {
        let appQuery = {};

        switch (type) {
            case 'props':
                appQuery = {
                    $lookup: {
                        from: "props",
                        localField: "appId",
                        foreignField: "_id",
                        as: "appId",
                    },
                };

                break;
        };

        const comments = await this.commentsModel.aggregate([
            {
                $match: data
            },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "userId",
                },
            },
            { $unwind: { path: "$userId", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    "_id": 1,
                    "status": 1,
                    "markAsComplete": 1,
                    "appId": 1,
                    "screenId": 1,
                    "comment": 1,
                    "userId": {
                        "_id": "$userId._id",
                        "isVerified": "$userId.isVerified",
                        "loginAttempts": "$userId.loginAttempts",
                        "role": "$userId.role",
                        "isFestivalManager": "$userId.isFestivalManager",
                        "firstName": "$userId.firstName",
                        "lastName": "$userId.lastName",
                        "company": "$userId.company",
                        "email": "$userId.email",
                        "date": "$userId.date",
                        "stripeCustId": "$userId.stripeCustId",
                        "plan": "$userId.plan",
                        "planLabel": "$userId.planLabel",
                        "planId": "$userId.planId",
                        "trialDescription": "$userId.trialDescription",
                        "lastLoggedIn": "$userId.lastLoggedIn",
                        "planSpace": "$userId.planSpace"
                    },
                    "commentRes": 1,
                    "createdAt": 1,
                    "updatedAt": 1
                }
            },
            appQuery,
            { $unwind: { path: "$appId", preserveNullAndEmptyArrays: true } }
        ]);

        return comments[0];
    }
}
