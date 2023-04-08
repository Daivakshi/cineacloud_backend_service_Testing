import { Controller, Post, Get, Body, Req, Res, Query, UseInterceptors, UseGuards, Param, UploadedFiles } from '@nestjs/common';
import { query, Request, Response } from 'express';
import { ResponseHandler } from '../../src/utils/response.handler';
import { AuthGuard } from '../../src/Guards/auth.guard';
import { ContractService } from './contract.service';
import { CreateFormDto } from './dtos/create-form.dto';
import { DiscordContractDto } from './dtos/discord-contract.dto';
import { ViewContractParamDto } from './dtos/view-contract.dto';
import { S3FileUpload } from '../../src/utils/s3';
@Controller('contract')
export class ContractController {
    constructor(
        private response: ResponseHandler,
        private contract: ContractService,
        private s3: S3FileUpload
    ) { };

    @Get('/create')
    @UseGuards(AuthGuard)
    async getAllEvents(@Req() req: Request, @Res() res: Response, @Query() query: any) {
        try {
            const { projectId } = query

            if(projectId == null) {
                return this.response.error(res, 400, "Please provide project_id")
            }

            this.contract.createContract({ userId: req.user._id, projectId }).then(async data => {
                return this.response.success(res, data, "contract created successfully")
            }).catch(err => {
                return this.response.error(res, 400, err)
            });
        } catch (e) {
            return this.response.errorInternal(e, res)
        }
    };

    @Get('/:id')
    @UseGuards(AuthGuard)
    async getContractId(@Req() req: Request, @Res() res: Response, @Param('id') id: string) {
        try {
            this.contract.getSingleContract(id, req.user._id).then(async data => {
                return this.response.success(res, data, "contract created successfully")
            }).catch(err => {
                return this.response.error(res, 400, err)
            });
        } catch (e) {
            return this.response.errorInternal(e, res)
        }
    };

    @Post('/render-form')
    @UseGuards(AuthGuard)
    async renderForm(@Req() req: Request, @Res() res: Response, @Body() body: CreateFormDto) {
        try {
            const { contractId, formData } = body;

            let ifContractExsist = await this.contract.findOneContract(contractId.toString());

            if (ifContractExsist == null) {
                return this.response.error(res, 400, 'Contract does not exsist')
            };

            let ifFormExsist = await this.contract.getFormData(contractId.toString(), req.user._id.toString());

            if (ifFormExsist !== null) {
                this.contract.updateContractForm(contractId.toString(), {
                    formData,
                    userId: req.user._id
                }).then(async data => {

                    if (ifContractExsist.isSingleSigner) {
                        await this.contract.updateSingleSigner(contractId.toString(), { documentStatus: 4 })
                    };

                    return this.response.success(res, data, "contract form updated successfully")
                }).catch(err => {
                    return this.response.error(res, 400, err)
                });
            } else {
                this.contract.createFormData({
                    formData,
                    contractId,
                    userId: req.user._id
                }).then(async data => {

                    if (ifContractExsist.isSingleSigner) {
                        await this.contract.updateSingleSigner(contractId.toString(), { documentStatus: 4 })
                    };

                    return this.response.success(res, data, "contract form created successfully")
                }).catch(err => {
                    return this.response.error(res, 400, err)
                });
            }
        } catch (e) {
            return this.response.errorInternal(e, res)
        }
    };

    @Post('/discord-contract')
    @UseGuards(AuthGuard)
    async discordContract(@Req() req: Request, @Res() res: Response, @Body() body: DiscordContractDto) {
        try {
            const contractId = body.contractId.toString(),
                userId = req.user._id.toString();

            await Promise.all([
                this.contract.deleteContractById(contractId, userId),
                this.contract.deleteContractFormByContractId(contractId, userId),
                this.contract.deleteMediaByContractId(contractId, userId),
                this.contract.deleteSignersByContractId(contractId, userId),
            ]);

            return this.response.success(res, '', 'Contract has been removed successfully');
        } catch (e) {
            return this.response.errorInternal(e, res)
        }
    };

    @Get('/view/:contractId')
    @UseGuards(AuthGuard)
    async viewContractById(@Req() req: Request, @Res() res: Response, @Param() viewParam: ViewContractParamDto) {
        try {
            const { contractId } = viewParam,
                userId = req.user._id;

            let isAccessGiven = await this.contract.getSingleContract(contractId.toString(), userId.toString()),
                accessForSigners;

            if (isAccessGiven == null) {
                accessForSigners = await this.contract.contractAccess(contractId, userId);

                if (accessForSigners == null) {
                    return this.response.noAccess(res, "You don't have access to view this contract")
                };
            };

            this.contract.viewContractById(contractId.toString()).then(async data => {

                for (let [index, file] of data["Files"].entries()) {
                    if (file.key) file.url = await this.s3.s3GetSignedURL(file.key);
                    else data["Files"].splice(index, 1);
                };

                for(let [index, signers] of data["Signers"].entries()) {
                    if(Object.keys(signers).length == 0) data["Signers"].splice(index, 1);
                }

                return this.response.success(res, data, "View contract fetched successfully")
            }).catch(err => {
                return this.response.error(res, 400, err)
            });
        } catch (e) {
            return this.response.errorInternal(e, res)
        }
    };

    @Post('/all')
    @UseGuards(AuthGuard)
    async getAllContracts(@Req() req: Request, @Res() res: Response, @Query() query: any) {
        try {
            const { projectId } = query;

            if(projectId == null) {
                return this.response.error(res, 400, "Please provide project_id")
            }

            const userId = req.user._id;

            this.contract.getContractsByUserId(req.user, projectId).then(async data => {

                for (let file of data) {
                    for (let [index, x] of file["Files"].entries()) {
                        if (x.key) x.url = await this.s3.s3GetSignedURL(x.key);
                        else file["Files"].splice(index, 1);
                    }
                };

                return this.response.success(res, data, "Contracts fetched successfully")
            }).catch(err => {
                console.log(err)
                return this.response.error(res, 400, err)
            });
        } catch (e) {
            console.log(e)
            return this.response.errorInternal(e, res)
        }
    };

    @Post('/sign-form')
    @UseGuards(AuthGuard)
    async signForm(@Req() req: Request, @Res() res: Response, @Body() body: CreateFormDto) {
        try {
            const { contractId, formData, _id } = body;

            let ifContractExsist = await this.contract.getContractId(contractId.toString());

            if (ifContractExsist == null) {
                return this.response.error(res, 400, "Contract doesn't exsist");
            };

            let ifFormExsist = await this.contract.getFormDataById(contractId.toString(), _id.toString());

            if (ifFormExsist == null) {
                return this.response.error(res, 400, "Form Data doesn't exsist");
            };

            let accessForSigners = await this.contract.contractAccess(contractId, req.user._id);

            if (accessForSigners == null) {
                return this.response.noAccess(res, "You don't have access to sign this contract")
            };

            this.contract.findOneFormAndSign(_id.toString(), {
                formData,
                contractId
            }).then(async data => {
                return this.response.success(res, data, "Form signed successfully")
            }).catch(err => {
                return this.response.error(res, 400, err)
            });

        } catch (e) {
            return this.response.errorInternal(e, res)
        }
    };

    @Post('/count')
    @UseGuards(AuthGuard)
    async contractCount(@Req() req: Request, @Res() res: Response, @Query() query: any) {
        try {

            const { projectId } = query;

            if(projectId == null) {
                return this.response.error(res, 400, "Please provide project_id")
            }

            const userId = req.user._id;

            const allContracts = await this.contract.getAllContracts({ userId, status: 1, projectId }),
                singleSignedContract = await this.contract.getAllContracts({ userId, status: 1, documentStatus: 4, isSingleSigner: true, projectId }),
                signedContract = await this.contract.getAllContracts({ "contractsigners.documentStatus": 4, "contractsigners.status": 1, "contractsigners.createdBy": userId, projectId }),
                pendingContract = allContracts.length - (singleSignedContract.length + signedContract.length);

            return this.response.success(res, {
                allContracts: allContracts.length,
                signedContract: singleSignedContract.length + signedContract.length,
                pendingContract
            }, 'Contract count');
        } catch (e) {
            console.log(e, "error")
            return this.response.errorInternal(e, res)
        }
    };

    @Post('/update-name')
    @UseGuards(AuthGuard)
    async updateContractName(@Req() req: Request, @Res() res: Response, @Body() body: { contractId: string, name: string }) {
        try {
            const { contractId, name } = body;

            if (contractId == undefined || name == undefined) {
                return this.response.error(res, 400, "There are missing required fields, please check")
            }

            await this.contract.updateContractName(contractId.toString(), { name, userId: req.user._id })

            return this.response.success(res, '', 'Contract updated');
        } catch (e) {
            console.log(e, "error")
            return this.response.errorInternal(e, res)
        }
    }

    @Post('/update-status')
    @UseGuards(AuthGuard)
    async updateContractStatus(@Req() req: Request, @Res() res: Response, @Body() body: any) {
        try {
            const { contractId } = body;

            if (contractId == undefined) {
                return this.response.error(res, 400, "There are missing required fields, please check")
            }

            let files = await this.contract.contractFiles(contractId),
                getContract = await this.contract.findOneContract(contractId),
                signers = await this.contract.getSigners(contractId);

            if (files.length > 0 && (getContract.isSingleSigner || signers.length > 0)) {
                await this.contract.updateContractName(contractId.toString(), { documentStatus: 2, userId: req.user._id })
            } else {
                await this.contract.updateContractName(contractId.toString(), { documentStatus: 1, userId: req.user._id })
            }

            let contractInfo = await this.contract.viewContractById(contractId.toString())

            for (let [index, file] of contractInfo["Files"].entries()) {
                if (file.key) file.url = await this.s3.s3GetSignedURL(file.key);
                else contractInfo["Files"].splice(index, 1);
            };

            for(let [index, signers] of contractInfo["Signers"].entries()) {
                if(Object.keys(signers).length == 0) contractInfo["Signers"].splice(index, 1);
            }

            return this.response.success(res, contractInfo, 'Contract updated');
        } catch (e) {
            console.log(e)
            return this.response.errorInternal(e, res)
        }
    }

    @Post('/conversion-status')
    async imageConversionStatus(@Req() req: Request, @Res() res: Response, @Body() body: any) {
        try {
            const { key } = body;

            if (key == undefined) {
                return this.response.error(res, 400, "There are missing required fields, please check")
            }

            let files = await this.contract.getFileByKey({
                key,
                status: 1
            });

            if(files == null) return this.response.error(res, 400, "Media does not exist")

            files["conversionStatus"] = true;
            await files.save();
           
            return this.response.success(res, '', 'Contract updated');
        } catch (e) {
            console.log(e)
            return this.response.errorInternal(e, res)
        }
    }

    @Post('/file-status')
    async getContractFilesById(@Req() req: Request, @Res() res: Response, @Body() body: any) {
        try {
            const { key } = body;

            if (key == undefined) {
                return this.response.error(res, 400, "There are missing required fields, please check")
            }

            let files = await this.contract.getFileByKey({
                key,
                status: 1
            });

            if(files == null) return this.response.error(res, 400, "Media does not exist", null)
           
            return this.response.success(res, files, 'Contract File');
        } catch (e) {
            console.log(e)
            return this.response.errorInternal(e, res)
        }
    }

    @Post('/pdf-form')
    @UseGuards(AuthGuard)
    async storePdfFormData(@Req() req: Request, @Res() res: Response, @Body() body: any) {
        try {
            const { contractId, formData } = body;

            let ifContractExsist = await this.contract.findOneContract(contractId.toString());

            if (ifContractExsist == null) {
                return this.response.error(res, 400, 'Contract does not exsist')
            };

            let ifFormExsist = await this.contract.getPdfFormData(contractId.toString(), req.user._id.toString());

            if (ifFormExsist !== null) {
                this.contract.updateContractPdfForm(contractId.toString(), {
                    formData,
                    userId: req.user._id
                }).then(async data => {

                    if (ifContractExsist.isSingleSigner) {
                        await this.contract.updateSingleSigner(contractId.toString(), { documentStatus: 4 })
                    };

                    return this.response.success(res, data, "contract form updated successfully")
                }).catch(err => {
                    return this.response.error(res, 400, err)
                });
            } else {
                this.contract.createPdfFormData({
                    formData,
                    contractId,
                    userId: req.user._id
                }).then(async data => {

                    if (ifContractExsist.isSingleSigner) {
                        await this.contract.updateSingleSigner(contractId.toString(), { documentStatus: 4 })
                    };

                    return this.response.success(res, data, "contract form created successfully")
                }).catch(err => {
                    return this.response.error(res, 400, err)
                });
            }
        } catch (e) {
            return this.response.errorInternal(e, res)
        }
    };
}
