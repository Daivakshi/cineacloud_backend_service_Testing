import { Injectable, NotFoundException, Req } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { MediaDocument, Medias } from '../contract/models/media.schema';

@Injectable()
export class MediasService {
    constructor(
        @InjectModel(Medias.name) private fileModel: Model<MediaDocument>, 
    ) { }

    async storeFile(data: any) {
        const file = new this.fileModel(data);
        return await file.save();
    };

    async insertMultiple(data: any) {
        return await this.fileModel.insertMany(data) 
    };

    async getAll(data: any) {
        return await this.fileModel.find(data).exec();
    };

    async getFile(data: any) {
        return await this.fileModel.findOne(data).exec();
    }

    async deleteFile(data: any) {
        return await this.fileModel.deleteOne(data)
    }
}
