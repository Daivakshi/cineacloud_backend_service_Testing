import { Injectable } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { UsersDocument, User } from './model/users.schema';
import { CreateUsertDto } from './dtos/create-user.dto';
import { ProjectDocument, UserProjects } from './model/project.schema';
import { CreateProjectDto } from './dtos/create-project.dto';
import { CreateContractDto } from '../../src/contract/dtos/create-contract.dto';
import { PremiumUserDocument, PremiumUsers } from './model/premium-user.schema';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UsersDocument>,
        @InjectModel(UserProjects.name) private projectModel: Model<ProjectDocument>,
        @InjectModel(PremiumUsers.name) private premiumUser: Model<PremiumUserDocument>
    ) {}

    async findOneByEmail(email: string) {
        return this.userModel.findOne({ email }).exec()
    };

    async findAllProjects(createdBy: Types.ObjectId) {
        return this.projectModel.find({ createdBy, status: 1 }).exec();
    };

    async createProject(data: CreateProjectDto) {
        const project = new this.projectModel(data);
        return await project.save();
    };

    async findProjectByName(data: CreateProjectDto) {
        return await this.projectModel.findOne(data).exec();
    };

    async getProjectById(data: any) {
        return await this.projectModel.findOne(data).exec();
    };

    async createPremiumUser(data: any) {
        const user = new this.premiumUser(data);
        return await user.save();
    };

    async findOnePremiumUserByEmail(email: string) {
        return this.premiumUser.findOne({ email }).exec()
    };

    async deletePremiumUser(email: string) {
        return this.premiumUser.remove({ email });
    }
}
