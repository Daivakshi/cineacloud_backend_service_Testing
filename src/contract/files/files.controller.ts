import { Controller, Post, Get, Body, Req, Res, Query, UseInterceptors, UseGuards, Param, UploadedFiles } from '@nestjs/common';
import { Request, Response } from 'express';
import { ResponseHandler } from '../../utils/response.handler';
import { AuthGuard } from '../../Guards/auth.guard';
import { S3FileUpload } from '../../utils/s3';
import { Types } from "mongoose";
import { FilesService } from './files.service';
import { ContractService } from '../contract.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UploadFileContractDto } from '../dtos/upload-file-contract.dto';

@Controller('files')
export class FilesController {
    constructor(
        private response: ResponseHandler,
        private s3Upload: S3FileUpload,
        private files: FilesService,
        private contracts: ContractService
    ) { };

    @Get('/all')
    @UseGuards(AuthGuard)
    async getAllEvents(@Req() req: Request, @Res() res: Response, @Query('id') id: string) {
        try {
            this.files.getAll(req.user._id, id).then(async data => {
                for (let x of data) {
                    x.url = await this.s3Upload.s3GetSignedURL(x.key)
                }
                return this.response.success(res, data, "contract files")
            }).catch(err => {
                return this.response.error(res, 400, err)
            });
        } catch (e) {
            return this.response.errorInternal(e, res)
        }
    };

    @Post('/upload')
    @UseGuards(AuthGuard)
    @UseInterceptors(FilesInterceptor('files'))
    async uploadMedia(@UploadedFiles() files: Array<Express.Multer.File>, @Req() req: Request, @Res() res: Response, @Body() body: UploadFileContractDto) {
        try {
            if (files == undefined) {
                return this.response.error(res, 400, 'Please select files')
            };

            this.s3Upload.uploadMultipleFilesToS3(files, req.user._id).then((data: any) => {
                let insertObj = data.map((item) => {
                    return {
                        fileName: item.fileName,
                        mimeType: item.mimeType,
                        key: item.key,
                        userId: item.userId,
                        fileId: item.fileId,
                        contractId: body.contractId,
                        sequence: data.indexOf(item)
                    }
                });

                this.files.insertMultiple(insertObj).then(resp => {
                    if (insertObj.length > 0) this.contracts.updateContractName(body.contractId.toString(), { name: insertObj[0].fileName, userId: req.user._id })
                    return this.response.success(res, data, "contract files")
                }).catch(err => {
                    return this.response.error(res, 400, err)
                });
            }).catch(err => {
                return this.response.error(res, 400, err)
            });
        } catch (err) {
            console.log(err)
            return this.response.errorInternal(err, res)
        }
    };

    @Post('/remove-file')
    @UseGuards(AuthGuard)
    async removeContractMedia(@Req() req: Request, @Res() res: Response, @Body() body: any) {
        try {
            if (req.body.fileId == undefined) {
                return this.response.error(res, 400, 'Please choose the file which you want to delete')
            };

            this.files.removeFiles({ _id: Types.ObjectId(req.body.fileId), status: 1 }).then(resp => {
                return this.response.success(res, "", "contract files removed successfully")
            }).catch(err => {
                return this.response.error(res, 400, err)
            });

        } catch (err) {
            console.log(err)
            return this.response.errorInternal(err, res)
        }
    }

    @Get('/images')
    @UseGuards(AuthGuard)
    async getAllImages(@Req() req: Request, @Res() res: Response, @Query() query: any) {
        try {
            const { contractId } = query;

            if (contractId == undefined) {
                return this.response.error(res, 400, 'Please provide the contractId which you want fetch images')
            };

            let contractFiles = await this.files.getFiles({
                contractId,
                status: 1
            }); 

            let s3PromiseArr = []

            for(let doc of contractFiles) {
                let images = await this.s3Upload.getObjects(`${doc?.key}-folder`);
                s3PromiseArr = [...s3PromiseArr, ...images["Contents"]]
            }

            return this.response.success(res, s3PromiseArr, "Contract Images fetched successfully")

        } catch (err) {
            console.log(err)
            return this.response.errorInternal(err, res)
        }
    }
}
