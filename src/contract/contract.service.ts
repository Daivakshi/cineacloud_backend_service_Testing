import { Injectable, NotFoundException } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ContractDocument, Contracts } from './models/contract.schema';
import { CreateContractDto } from './dtos/create-contract.dto';
import { ContractForm, ContractFormDoc } from './models/contract-form.schema';
import { CreateFormDto } from './dtos/create-form.dto';
import { ContractSigners, InviteSignersDocs } from './models/contract-signer.schema';
import { ContractSigns, SignsDocument } from './models/contract-signs.schema';
import { MediaDocument, Medias } from './models/media.schema';
import { ContractPdf, ContractPdfDoc } from './models/contract-pdf-data.schema';

@Injectable()
export class ContractService {
    constructor(
        @InjectModel(Contracts.name) private contractModel: Model<ContractDocument>,
        @InjectModel(ContractForm.name) private formModel: Model<ContractFormDoc>,
        @InjectModel(ContractSigners.name) private signersModel: Model<InviteSignersDocs>,
        @InjectModel(ContractSigns.name) private signModel: Model<SignsDocument>,
        @InjectModel(Medias.name) private mediaModel: Model<MediaDocument>,
        @InjectModel(ContractPdf.name) private pdfModel: Model<ContractPdfDoc>
    ) { }

    async createContract(data: CreateContractDto) {
        const contract = new this.contractModel(data);
        return await contract.save();
    };

    async getSingleContract(id: string, userId: string) {
        if (!id) return null;
        return this.contractModel.findOne({ _id: Types.ObjectId(id), status: 1, userId }).exec();
    };

    async findOneContract(id: string) {
        return this.contractModel.findOne({ _id: Types.ObjectId(id), status: 1 }).exec();
    };

    async findOneUpdate(id: string, data: any) {
        const contract = await this.getSingleContract(id, data.userId);
        if (!contract) throw new NotFoundException('Contract Not found');
        Object.assign(contract, data);
        return contract.save()
    };

    async updateContractName(id: string, data: Partial<CreateContractDto>) {
        const contract = await this.findOneUpdate(id, data);
        return contract;
    };

    async updateSingleSigner(id: string, data: any) {
        const contract = await this.findOneContract(id);
        if (!contract) throw new NotFoundException('Contract Not found');
        Object.assign(contract, data);
        return contract.save()
    }

    async getFormData(id: string, userId: string) {
        if (!id) return null;
        return await this.formModel.findOne({ contractId: Types.ObjectId(id), userId: Types.ObjectId(userId), status: 1 }).exec();
    };

    async createFormData(data: CreateFormDto) {
        const form = new this.formModel(data);
        return await form.save();
    }

    async findOneFormAndUpdate(id: string, data: any) {
        const form = await this.getFormData(id, data.userId);
        if (!form) throw new NotFoundException('Form Not found');
        Object.assign(form, data);
        return form.save()
    };

    async updateContractForm(id: string, data: Partial<CreateFormDto>) {
        const form = await this.findOneFormAndUpdate(id, data);
        return form;
    };

    async deleteContractById(id: string, userId: string) {
        return await this.contractModel.deleteOne({
            _id: Types.ObjectId(id),
            userId: Types.ObjectId(userId),
            status: 1
        });
    };

    async deleteMediaByContractId(id: string, userId: string) {
        return await this.mediaModel.deleteMany({
            contractId: Types.ObjectId(id),
            userId: Types.ObjectId(userId),
            status: 1
        });
    };

    async deleteSignersByContractId(id: string, userId: string) {
        return await this.signersModel.deleteMany({
            contractId: Types.ObjectId(id),
            createdBy: Types.ObjectId(userId),
            status: 1
        });
    };

    async deleteContractFormByContractId(id: string, userId: string) {
        return await this.formModel.deleteMany({
            contractId: Types.ObjectId(id),
            userId: Types.ObjectId(userId),
            status: 1
        });
    };

    async contractAccess(contractId: Types.ObjectId, createdBy: Types.ObjectId) {
        return this.signersModel.findOne({ contractId, _id: createdBy, status: 1 }).exec();
    };

    async viewContractById(contractId: string) {
        const contract = await this.contractModel.aggregate([
            {
                $match: {
                    _id: Types.ObjectId(contractId),
                    status: 1
                }
            },
            {
                $lookup: {
                    from: "contractpdfs",
                    localField: "_id",
                    foreignField: "contractId",
                    as: "formData",
                },
            },
            { $unwind: { path: "$formData", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "medias",
                    localField: "_id",
                    foreignField: "contractId",
                    as: "Files",
                },
            },
            { $unwind: { path: "$Files", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "contractsigners",
                    localField: "_id",
                    foreignField: "contractId",
                    as: "Signers",
                },
            },
            { $unwind: { path: "$Signers", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    "_id": 1,
                    "status": 1,
                    "isSingleSigner": 1,
                    "documentStatus": 1,
                    "name": 1,
                    "userId": 1,
                    "createdAt": 1,
                    "updatedAt": 1,
                    "formData": {
                        "_id": "$formData._id",
                        "status": "$formData.status",
                        "formData": "$formData.formData",
                        "contractId": "$formData.contractId",
                        "userId": "$formData.userId",
                        "createdAt": "$formData.createdAt",
                        "updatedAt": "$formData.updatedAt",
                    },
                    "Files": {
                        "_id": "$Files._id",
                        "status": "$Files.status",
                        "fileName": "$Files.fileName",
                        "mimeType": "$Files.mimeType",
                        "key": "$Files.key",
                        "userId": "$Files.userId",
                        "fileId": "$Files.fileId",
                        "contractId": "$Files.contractId",
                        "sequence": "$Files.sequence",
                        "createdAt": "$Files.createdAt",
                        "updatedAt": "$Files.updatedAt",
                        "conversionStatus": "$Files.conversionStatus"
                    },
                    "Signers": {
                        "_id": "$Signers._id",
                        "status": "$Signers.status",
                        "emailsent": "$Signers.emailsent",
                        "contractId": "$Signers.contractId",
                        "name": "$Signers.name",
                        "email": "$Signers.email",
                        "createdBy": "$Signers.createdBy",
                        "createdAt": "$Signers.createdAt",
                        "updatedAt": "$Signers.updatedAt",
                        "action": "$Signers.action"
                    }
                }
            },
            {
                $group: {
                    _id: "$_id",
                    "createdAt": { $first: "$createdAt" },
                    "status": { $first: "$status" },
                    "isSingleSigner": { $first: "$isSingleSigner" },
                    "documentStatus": { $first: "$documentStatus" },
                    "name": { $first: "$name" },
                    "userId": { $first: "$userId" },
                    "updatedAt": { $first: "$updatedAt" },
                    "formData": { $first: "$formData" },
                    "Signers": {
                        $addToSet: {
                            "_id": "$Signers._id",
                            "status": "$Signers.status",
                            "emailsent": "$Signers.emailsent",
                            "contractId": "$Signers.contractId",
                            "name": "$Signers.name",
                            "email": "$Signers.email",
                            "createdBy": "$Signers.createdBy",
                            "createdAt": "$Signers.createdAt",
                            "updatedAt": "$Signers.updatedAt",
                            "action": "$Signers.action"
                        }
                    },
                    "Files": {
                        $addToSet: {
                            "_id": "$Files._id",
                            "status": "$Files.status",
                            "fileName": "$Files.fileName",
                            "mimeType": "$Files.mimeType",
                            "key": "$Files.key",
                            "userId": "$Files.userId",
                            "fileId": "$Files.fileId",
                            "contractId": "$Files.contractId",
                            "sequence": "$Files.sequence",
                            "createdAt": "$Files.createdAt",
                            "updatedAt": "$Files.updatedAt",
                            "url": "",
                            "conversionStatus": "$Files.conversionStatus"
                        }
                    }
                },
            }
        ]);

        return contract[0];
    };

    async findOneAndUpdateSigner(id: string, data: any) {
        const signer = await this.contractAccess(data.contractId, data.userId);
        if (!signer) throw new NotFoundException('Signer Not found');
        Object.assign(signer, data);
        return signer.save()
    };

    async updateDocumentStatus(id: string, data: Partial<any>) {
        const signer = await this.findOneFormAndUpdate(id, data);
        return signer;
    };

    async getContractsByUserId(user: any, projectId: string) {
        const contracts = await this.contractModel.aggregate([
            {
                $lookup: {
                    from: "contractsigners",
                    localField: "_id",
                    foreignField: "contractId",
                    as: "contractsigners",
                },
            },
            {
                $match: {
                    projectId: Types.ObjectId(projectId),
                    $or: [
                        { userId: Types.ObjectId(user._id) },
                        // { "contractsigners.email": user.email }
                    ],
                    status: 1
                }
            },
            {
                $lookup: {
                    from: "contractpdfs",
                    localField: "_id",
                    foreignField: "contractId",
                    as: "formData",
                },
            },
            { $unwind: { path: "$formData", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "medias",
                    localField: "_id",
                    foreignField: "contractId",
                    as: "Files",
                },
            },
            { $unwind: { path: "$Files", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "contractsigners",
                    localField: "_id",
                    foreignField: "contractId",
                    as: "Signers",
                },
            },
            { $unwind: { path: "$Signers", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    "_id": 1,
                    "status": 1,
                    "isSingleSigner": 1,
                    "documentStatus": 1,
                    "name": 1,
                    "userId": 1,
                    "createdAt": 1,
                    "updatedAt": 1,
                    "formData": {
                        "_id": "$formData._id",
                        "status": "$formData.status",
                        "formData": "$formData.formData",
                        "contractId": "$formData.contractId",
                        "userId": "$formData.userId",
                        "createdAt": "$formData.createdAt",
                        "updatedAt": "$formData.updatedAt",
                    },
                    "Files": {
                        $cond: {
                            if: { $gte: [Object.keys("$Files"), 0] }, then: {
                                "_id": "$Files._id",
                                "status": "$Files.status",
                                "fileName": "$Files.fileName",
                                "mimeType": "$Files.mimeType",
                                "key": "$Files.key",
                                "userId": "$Files.userId",
                                "fileId": "$Files.fileId",
                                "contractId": "$Files.contractId",
                                "sequence": "$Files.sequence",
                                "createdAt": "$Files.createdAt",
                                "updatedAt": "$Files.updatedAt",
                                "conversionStatus": "$Files.conversionStatus"
                            }, else: {}
                        }
                    },
                    "Signers": {
                        $cond: {
                            if: { $gte: [Object.keys("$Files"), 0] }, then: {
                                "_id": "$Signers._id",
                                "status": "$Signers.status",
                                "emailsent": "$Signers.emailsent",
                                "contractId": "$Signers.contractId",
                                "name": "$Signers.name",
                                "email": "$Signers.email",
                                "documentStatus": "$Signers.documentStatus",
                                "createdBy": "$Signers.createdBy",
                                "createdAt": "$Signers.createdAt",
                                "updatedAt": "$Signers.updatedAt",
                                "action": "$Signers.action"
                            }, else: {}
                        }
                    }
                }
            },
            {
                $group: {
                    _id: "$_id",
                    "createdAt": { $first: "$createdAt" },
                    "status": { $first: "$status" },
                    "isSingleSigner": { $first: "$isSingleSigner" },
                    "documentStatus": { $first: "$documentStatus" },
                    "name": { $first: "$name" },
                    "userId": { $first: "$userId" },
                    "updatedAt": { $first: "$updatedAt" },
                    "formData": { $first: "$formData" },
                    "Signers": {
                        $addToSet: {
                            "_id": "$Signers._id",
                            "status": "$Signers.status",
                            "emailsent": "$Signers.emailsent",
                            "contractId": "$Signers.contractId",
                            "name": "$Signers.name",
                            "email": "$Signers.email",
                            "documentStatus": "$Signers.documentStatus",
                            "createdBy": "$Signers.createdBy",
                            "createdAt": "$Signers.createdAt",
                            "updatedAt": "$Signers.updatedAt",
                            "action": "$Signers.action"
                        }
                    },
                    "Files": {
                        $addToSet: {
                            "_id": "$Files._id",
                            "status": "$Files.status",
                            "fileName": "$Files.fileName",
                            "mimeType": "$Files.mimeType",
                            "key": "$Files.key",
                            "userId": "$Files.userId",
                            "fileId": "$Files.fileId",
                            "contractId": "$Files.contractId",
                            "sequence": "$Files.sequence",
                            "createdAt": "$Files.createdAt",
                            "updatedAt": "$Files.updatedAt",
                            "url": "",
                            "conversionStatus": "$Files.conversionStatus"
                        }
                    }
                },
            },
            {
                $sort: {
                    "createdAt": -1
                }
            }
        ]);

        return contracts
    };

    async getFormDataById(contractId: string, id: string) {
        if (!id) return null;
        return await this.formModel.findOne({ contractId: Types.ObjectId(contractId), _id: Types.ObjectId(id), status: 1 }).exec();
    };

    async getContractId(id: string) {
        if (!id) return null;
        return this.contractModel.findOne({ _id: Types.ObjectId(id), status: 1 }).exec();
    };

    async findOneFormAndSign(id: string, data: any) {
        const form = await this.getFormDataById(data.contractId, id);
        if (!form) throw new NotFoundException('Form Not found');
        Object.assign(form, data);
        return form.save()
    };

    async getAllContracts(data: any) {
        let contracts = await this.contractModel.aggregate([
            {
                $lookup: {
                    from: "contractsigners",
                    localField: "_id",
                    foreignField: "contractId",
                    as: "contractsigners",
                },
            },
            {
                $match: data
            }
        ]);

        return contracts;
    };

    async contractFiles(contractId: string) {
        return await this.mediaModel.find({
            contractId: Types.ObjectId(contractId),
            status: 1
        });
    };

    async getSigners(contractId: string) {
        return this.signersModel.find({ contractId: Types.ObjectId(contractId), status: 1 }).exec();
    };

    async getFileByKey(data: any) {
        return this.mediaModel.findOne(data).exec()
    }

    async getPdfFormData(id: string, userId: string) {
        if (!id) return null;
        return await this.pdfModel.findOne({ contractId: Types.ObjectId(id), userId: Types.ObjectId(userId), status: 1 }).exec();
    };

    async createPdfFormData(data: any) {
        const form = new this.pdfModel(data);
        return await form.save();
    }

    async findOnePdfFormAndUpdate(id: string, data: any) {
        const form = await this.getPdfFormData(id, data.userId);
        if (!form) throw new NotFoundException('Form Not found');
        Object.assign(form, data);
        return form.save()
    };

    async updateContractPdfForm(id: string, data: Partial<any>) {
        const form = await this.findOnePdfFormAndUpdate(id, data);
        return form;
    };

    async deleteContractPdfFormByContractId(id: string, userId: string) {
        return await this.pdfModel.deleteMany({
            contractId: Types.ObjectId(id),
            userId: Types.ObjectId(userId),
            status: 1
        });
    };

    async getPdfFormDataById(contractId: string, id: string) {
        if (!id) return null;
        return await this.pdfModel.findOne({ contractId: Types.ObjectId(contractId), _id: Types.ObjectId(id), status: 1 }).exec();
    };

    async findOnePdfFormAndSign(id: string, data: any) {
        const form = await this.getPdfFormDataById(data.contractId, id);
        if (!form) throw new NotFoundException('Form Not found');
        Object.assign(form, data);
        return form.save()
    };

}
