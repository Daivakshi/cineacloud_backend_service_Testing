import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Elements, ElementsDocument } from '../models/elements.schema';
import { CreateElementDto } from '../dtos/create-element.dto';

@Injectable()
export class EpkElementsService {
    constructor(
        @InjectModel(Elements.name) private elementModel: Model<ElementsDocument>
    ) { }

    async findAll() {
        return this.elementModel.find({ status: 1 });
    };

    async addElement(data: CreateElementDto) {
        const element = new this.elementModel(data);
        return element.save();
    }
}
