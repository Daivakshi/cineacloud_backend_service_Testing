import { Injectable, NotFoundException, Req } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { MediaDocument, Medias } from '../models/media.schema';
import { InsertFileDto } from '../dtos/fileupload.dto';
import { S3FileUpload } from '../../utils/s3';

@Injectable()
export class FilesService {
    constructor(
        @InjectModel(Medias.name) private mediaModel: Model<MediaDocument>,
        private s3: S3FileUpload
    ) {}

    async getAll(userId: string, contractId: string) {
        // return await this.mediaModel.find({ userId: Types.ObjectId(userId), status: 1 }).lean();
        return await this.mediaModel.aggregate([
            {
                $match: {
                    userId: Types.ObjectId(userId), 
                    contractId: Types.ObjectId(contractId),
                    status: 1
                }
            },
            {
                $project: {
                    "_id": 1,
	                "status" : 1,
	                "fileName" : 1,
                    "mimeType" : 1,
                    "key" : 1,
                    "userId" : 1,
                    "fileId" : 1,
                    "url" : '',
                    "sequence": 1,
                    "contractId": 1,
                }
            },
            {
                $sort: {
                    "createdAt": 1
                }
            }
        ])
    };

    async insertMultiple(data: InsertFileDto) {
        return await this.mediaModel.insertMany(data) 
    };

    async removeFiles(data: any) {
        return await this.mediaModel.deleteOne(data).exec();
    }

    async getFiles(data: any) {
        return await this.mediaModel.find(data);
    }
}
