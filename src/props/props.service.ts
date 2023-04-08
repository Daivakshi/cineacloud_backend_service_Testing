import { Injectable, NotFoundException } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Props, PropsDocument } from './models/props.schema';
import { CreatePropsDto } from './dtos/create-prop.dto';
import { PropsMember, PropsMemberDocument } from './models/props-members.schema';

@Injectable()
export class PropsService {
    constructor(
        @InjectModel(Props.name) private propsModel: Model<PropsDocument>,
        @InjectModel(PropsMember.name) private inviteModel: Model<PropsMemberDocument>,
    ) { };

    async createProps(data: CreatePropsDto) {
        const props = new this.propsModel(data);
        return await props.save();
    };

    async findOneProps(data: any) {
        return await this.propsModel.findOne(data).exec();
    };

    async findOnePropsWithImage(data: any) {
        const props = await this.propsModel.aggregate([
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
            { $unwind: { path: "$image", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "medias",
                    localField: "image",
                    foreignField: "_id",
                    as: "image",
                },
            },
            { $unwind: { path: "$image", preserveNullAndEmptyArrays: true } },
            {
                $group: {
                    "_id": "$_id",
                    "status": { $first: "$status" },
                    "acquired": { $first: "$acquired" },
                    "approved": { $first: "$approved" },
                    "image": {
                        $addToSet: {
                            "_id": "$image._id",
                            "status": "$image.status",
                            "fileName": "$image.fileName",
                            "mimeType": "$image.mimeType",
                            "key": "$image.key",
                            "userId": "$image.userId",
                            "createdAt": "$image.createdAt",
                            "updatedAt": "$image.updatedAt"
                        }
                    },
                    "sceneHeading": { $first: "$sceneHeading" },
                    "sceneNumber": { $first: "$sceneNumber" },
                    "cast": { $first: "$cast" },
                    "item": { $first: "$item" },
                    "userId": { $first: "$userId" },
                    "shootDate": { $first: "$shootDate" },
                    "notes": { $first: "$notes" },
                    "projectId": { $first: "$projectId" },
                    "createdAt": { $first: "$createdAt" },
                    "updatedAt": { $first: "$updatedAt" }
                }
            },
            {
                $project: {
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
                    "_id": 1,
                    "status": 1,
                    "acquired": 1,
                    "approved": 1,
                    "image": 1,
                    "sceneHeading": 1,
                    "sceneNumber": 1,
                    "cast": 1,
                    "item": 1,
                    "shootDate": 1,
                    "notes": 1,
                    "projectId": 1,
                    "createdAt": 1,
                    "updatedAt": 1
                }
            }
        ]);

        return props[0];
    };

    async getAllProps(data: any, skipRec, pageLimit, sort) {
        const props = await this.propsModel.aggregate([
            {
                $lookup: {
                    from: "propsmembers",
                    localField: "_id",
                    foreignField: "propId",
                    as: "propsmembers",
                },
            },
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
            { $unwind: { path: "$image", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "medias",
                    localField: "image",
                    foreignField: "_id",
                    as: "image",
                },
            },
            { $unwind: { path: "$image", preserveNullAndEmptyArrays: true } },
            {
                $group: {
                    "_id": "$_id",
                    "status": { $first: "$status" },
                    "acquired": { $first: "$acquired" },
                    "approved": { $first: "$approved" },
                    "image": {
                        $addToSet: {
                            "_id": "$image._id",
                            "status": "$image.status",
                            "fileName": "$image.fileName",
                            "mimeType": "$image.mimeType",
                            "key": "$image.key",
                            "userId": "$image.userId",
                            "createdAt": "$image.createdAt",
                            "updatedAt": "$image.updatedAt"
                        }
                    },
                    "sceneHeading": { $first: "$sceneHeading" },
                    "sceneNumber": { $first: "$sceneNumber" },
                    "cast": { $first: "$cast" },
                    "item": { $first: "$item" },
                    "userId": { $first: "$userId" },
                    "shootDate": { $first: "$shootDate" },
                    "notes": { $first: "$notes" },
                    "projectId": { $first: "$projectId" },
                    "createdAt": { $first: "$createdAt" },
                    "updatedAt": { $first: "$updatedAt" }
                }
            },
            {
                $project: {
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
                    "_id": 1,
                    "status": 1,
                    "acquired": 1,
                    "approved": 1,
                    "image": 1,
                    "sceneHeading": 1,
                    "sceneNumber": 1,
                    "cast": 1,
                    "item": 1,
                    "shootDate": 1,
                    "notes": 1,
                    "projectId": 1,
                    "createdAt": 1,
                    "updatedAt": 1
                }
            },
            // { $sort: sort },
            // { $skip: skipRec },
            // { $limit: pageLimit }
        ]);

        return props;
    };

    async finOneAndUpdateProps(propsId: Types.ObjectId, data: any) {
        const props = await this.findOneProps({ 
            _id: propsId, 
            status: 1, 
            // userId: data.userId 
        });
        if (!props) throw new NotFoundException('Props Not found');
        Object.assign(props, data);
        return props.save()
    };

    async updateProps(id: Types.ObjectId, data: Partial<CreatePropsDto>) {
        const props = await this.finOneAndUpdateProps(id, data);
        return props;
    };

    async deleteProps(data: any) {
        return await this.propsModel.deleteOne(data).exec();
    };

    async deleteManyProps(data: any) {
        return await this.propsModel.deleteMany(data).exec();
    };

    async getTotalCount(data: any) {
        const props = await this.propsModel.aggregate([
            {
                $lookup: {
                    from: "propsmembers",
                    localField: "_id",
                    foreignField: "propId",
                    as: "propsmembers",
                },
            },
            {
                $match: data
            }
        ]);

        return props;
    };

    async checkMembers(data: any) {
        return await this.inviteModel.findOne(data).lean().exec()
    };

    async inviteMembers(data: any) {
        const members =  new this.inviteModel(data);
        return await members.save();
    };

    async removeMembers(data: any) {
        return await this.inviteModel.remove(data).exec()
    };

    async getAllMembersByProp(data: any) {
        const members = await this.inviteModel.aggregate([
            {
                $match: data
            },
            {
                $lookup: {
                    from: "users",
                    localField: "email",
                    foreignField: "email",
                    as: "userId",
                },
            },
            { $unwind: { path: "$userId", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "props",
                    localField: "propId",
                    foreignField: "_id",
                    as: "propId",
                },
            },
            { $unwind: { path: "$propId", preserveNullAndEmptyArrays: true } },
        ]);

        return members;
    };

    async checkAccess(data: any) {
        const props = await this.propsModel.aggregate([
            {
                $lookup: {
                    from: "propsmembers",
                    localField: "_id",
                    foreignField: "propId",
                    as: "propsmembers",
                },
            },
            {
                $match: data
            }
        ]);

        return props[0];
    };

    async getMembersPropId(data: any) {
        const members = await this.inviteModel.aggregate([
            {
                $match: data
            },
            {
                $lookup: {
                    from: "users",
                    localField: "email",
                    foreignField: "email",
                    as: "email",
                },
            },
            { $unwind: { path: "$email", preserveNullAndEmptyArrays: true } },
        ]);

        return members;
    };

    async findPropMember(data: any) {
        const props = await this.propsModel.aggregate([
            {
                $lookup: {
                    from: "propsmembers",
                    localField: "_id",
                    foreignField: "propId",
                    as: "propsmembers",
                },
            },
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
                    "cast": 1,
                    "createdAt": 1,
                    "createdBy": 1,
                    "projectId": 1,
                    "status": 1,
                    "updatedAt": 1,
                    "sceneHeading" : 1,
                    "sceneNumber" : 1,
                    "shootDate" : 1,
                    "item" : 1,
                    "notes" : 1,
                    "_id": 1,
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
                    }
                }            
            }
        ]);
    
        return props ? props[0] : null; 
    }
}
