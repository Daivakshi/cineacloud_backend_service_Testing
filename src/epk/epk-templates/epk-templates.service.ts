import { Injectable, NotFoundException } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { EpkTemplates, EpkTemplatesDocument } from '../models/epk-template.schema';
import { CreateTemplateDto } from '../dtos/create-template.dto';

@Injectable()
export class EpkTemplatesService {
    constructor(
        @InjectModel(EpkTemplates.name) private templateModel: Model<EpkTemplatesDocument>
    ) { };

    async createTemplate(data: CreateTemplateDto) {
        const template = new this.templateModel(data);
        return await template.save();
    };

    async findOneTemplate(data: any) {
        return await this.templateModel.findOne(data).exec();
    };

    async getAllTemplates(data: any) {
        return await this.templateModel.find(data).exec();
    };

    async finOneAndUpdateTemplate(templateId: string, data: any) {
        const template = await this.findOneTemplate({ _id: data.templateId, epkId: Types.ObjectId(templateId), status: 1, userId: data.userId });
        if (!template) throw new NotFoundException('Template Not found');
        Object.assign(template, data);
        return template.save()
    };

    async updateTemplate(id: string, data: Partial<CreateTemplateDto>) {
        const template = await this.finOneAndUpdateTemplate(id, data);
        return template;
    };

    async getTemplateByEpkId(data: any) {
        const templates = await this.templateModel.aggregate([
            {
                $lookup: {
                    from: "invitemembers",
                    localField: "epkId",
                    foreignField: "epkId",
                    as: "invitemembers",
                },
            },
            {
                $match: data
            },
            {
                $lookup: {
                    from: "epks",
                    localField: "epkId",
                    foreignField: "_id",
                    as: "epkId",
                },
            },
            { $unwind: { path: "$epkId", preserveNullAndEmptyArrays: true } },
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
                    "name": 1,
                    "objects": 1,
                    "background": 1,
                    "frame": 1,
                    "preview": 1,
                    "epkId": {
                        "_id": "$epkId._id",
                        "status": "$epkId.status",
                        "epkName": "$epkId.epkName",
                        "userId": "$epkId.userId",
                        "createdAt": "$epkId.createdAt",
                        "updatedAt": "$epkId.updatedAt",
                    },
                    "userId": {
                        "_id": "$userId._id",
                        "role": "$userId.role",
                        "isFestivalManager": "$userId.isFestivalManager",
                        "firstName": "$userId.firstName",
                        "lastName": "$userId.lastName",
                        "email": "$userId.email",
                        "date": "$userId.date",
                        "lastLoggedIn": "$userId.lastLoggedIn",
                    },
                    "createdAt": 1,
                    "updatedAt": 1
                }
            }
        ])

        return templates;
    };

    async removeTemp(templateId: Types.ObjectId, userId: Types.ObjectId) {
        return await this.templateModel.deleteOne({
            _id: templateId,
            userId,
            status: 1
        })
    }
}
