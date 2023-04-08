import { Injectable, NotFoundException } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ContractSigners, InviteSignersDocs } from '../models/contract-signer.schema';
import { Contracts, ContractDocument } from '../models/contract.schema';
import { AddSignersDto } from '../dtos/add-user.dto';
import { RemoveSignersDto } from '../dtos/remove-user.dto';
import { ContractSigns, SignsDocument } from '../models/contract-signs.schema';
import { AddSignFontDto } from '../dtos/add-sign-font.dto';
import { CreateContractDto } from '../dtos/create-contract.dto';
@Injectable()
export class SignersService {
    constructor(
        @InjectModel(Contracts.name) private contractModel: Model<ContractDocument>,
        @InjectModel(ContractSigners.name) private signersModel: Model<InviteSignersDocs>,
        @InjectModel(ContractSigns.name) private signModel: Model<SignsDocument>
    ) { }

    async getContractById (id: string, userId: string) {
        if (!id) return null;
        return this.contractModel.findOne({ _id: Types.ObjectId(id), status: 1, userId }).exec();
    };

    async checkSigners (data: any) {
        return this.signersModel.findOne(data).exec();
    };

    async createSigners (data: AddSignersDto) {
        const signers = new this.signersModel(data);
        return await signers.save();
    };

    async getAllSignersByContract(contractId: string) {
        return await this.signersModel.find({ contractId, status: 1 }).exec()
    };

    async deleteSigners(data: RemoveSignersDto) {
        return await this.signersModel.deleteOne(data);
    };

    async getSignersId(contractId: Types.ObjectId, userId: Types.ObjectId, data: any) {
        return await this.signersModel.findOne({
            email: data.email,
            contractId,
            createdBy: userId
        }).exec()
    };

    async signerFindOneUpdate(contractId: Types.ObjectId, data: any) {
        const signer = await this.getSignersId(contractId, data.createdBy, data.emailData);
        if (!signer) throw new NotFoundException('Signer Not found');
        Object.assign(signer, data);
        return signer.save()
    };

    async updateSigners(contractId: Types.ObjectId, data: Partial<AddSignersDto>) {
        const signer = await this.signerFindOneUpdate(contractId, data);
        return signer;
    }

    async addDrawSign(data: any) {
        const signs = new this.signModel(data);
        return await signs.save()
    };

    async addSign(data: AddSignFontDto) {
        const signs = new this.signModel(data);
        return await signs.save()
    };

    async getSignById (id: string, userId: string) {
        if (!id) return null;
        return this.signModel.findOne({ _id: Types.ObjectId(id), status: 1, userId }).exec();
    };

    async signFindOneUpdate(id: string, data: any) {
        const sign = await this.getSignById(id, data.userId);
        if (!sign) throw new NotFoundException('Sign Not found');
        Object.assign(sign, data);
        return sign.save()
    };

    async updateSign(id: string, data: Partial<AddSignFontDto>) {
        const sign = await this.signFindOneUpdate(id, data);
        return sign;
    };

    async getAllSigns(userId: string) {
        return await this.signModel.find({ userId, status: 1 }).exec()
    };

    async contractFindOneUpdate(id: string, data: any) {
        const contract = await this.getContractById(id, data.userId);
        if (!contract) throw new NotFoundException('Contract Not found');
        Object.assign(contract, data);
        return contract.save()
    };

    async updateContract(id: string, data: Partial<CreateContractDto>) {
        const sign = await this.contractFindOneUpdate(id, data);
        return sign;
    };

    async getMembers(id: string, userId: string) {
        return await this.signersModel.find({ status: 1, contractId: Types.ObjectId(id), createdBy: Types.ObjectId(userId) }).exec();
    };

    async checkContractById(contractId: Types.ObjectId) {
        return await this.contractModel.findOne({ _id: contractId, status: 1 }).exec();
    };

    async checkSignerByToken(data: any) {
        return await this.signersModel.findOne(data).select('-token').exec();
    };

    async updateDocStatus(contractId: Types.ObjectId, userId: Types.ObjectId) {
        const signer = await this.signersModel.findOne({ contractId, _id: userId, status: 1 });
        if (!signer) throw new NotFoundException('Signer Not found');
        Object.assign(signer, { "documentStatus": 4 });
        return signer.save()
    };
}
