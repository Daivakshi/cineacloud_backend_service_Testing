import { Controller, Post, Get, Body, Req, Res, Query, UseInterceptors, UseGuards, Param, UploadedFiles, UploadedFile } from '@nestjs/common';
import { Request, Response } from 'express';
import { ResponseHandler } from '../../src/utils/response.handler';
import { AuthGuard } from '../../src/Guards/auth.guard';
import { S3FileUpload } from '../../src/utils/s3';
import { Types } from "mongoose";
import { MediasService } from './medias.service';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { MediaUploadDto } from './dtos/media-upload.dto';

interface responseObj {
    url?: any
}

@Controller('media')
export class MediasController {
    constructor(
        private response: ResponseHandler,
        private s3Upload: S3FileUpload,
        private media: MediasService,
    ) { };

    @Post('/upload')
    @UseGuards(AuthGuard)
    @UseInterceptors(FileInterceptor('file'))
    async uploadMedia(@UploadedFile() file: Express.Multer.File, @Req() req: Request, @Res() res: Response, @Body() body: MediaUploadDto) {
        try {
            this.s3Upload.uploadFileToS3(file).then((data: any) => {
                let lObj = {
                    fileName: data.fileName,
                    mimeType: data.mimeType,
                    key: data.key,
                    type: body.type,
                    userId: req.user._id
                };

                this.media.storeFile(lObj).then(async (data) => {
                    return this.response.success(res, data, `File has been uploaded succesfully`);
                }).catch(err => {
                    return this.response.error(res, 400, err)
                });
            }).catch(err => {
                return this.response.error(res, 400, err)
            });
        } catch (err) {
            return this.response.errorInternal(err, res)
        }
    };

    @Post('/upload/docs')
    @UseGuards(AuthGuard)
    @UseInterceptors(FileInterceptor('file'))
    async uploadDocuments(@UploadedFile() file: Express.Multer.File, @Req() req: Request, @Res() res: Response, @Body() body: { contractId: string }) {
        try {
            const { contractId } = body;

            this.s3Upload.uploadFileToS3WithUserId(file, req.user._id).then((data: any) => {
                let lObj = {
                    fileName: data.fileName,
                    mimeType: data.mimeType,
                    key: data.key,
                    contractId: Types.ObjectId(contractId),
                    fileId: data.fileId,
                    userId: req.user._id
                };

                this.media.storeFile(lObj).then(async (data) => {
                    return this.response.success(res, data, `File has been uploaded succesfully`);
                }).catch(err => {
                    return this.response.error(res, 400, err)
                });
            }).catch(err => {
                return this.response.error(res, 400, err)
            });
        } catch (err) {
            return this.response.errorInternal(err, res)
        }
    };

    @Post('/delete')
    @UseGuards(AuthGuard)
    async removeMedia(@Req() req: Request, @Res() res: Response, @Body() body: { fileId: string }) {
        try {
            const { fileId } = req.body;

            if(fileId == undefined) {
                return this.response.error(res, 400, 'File Id is mandatory')
            };

            let fileInfo = await this.media.getFile({ _id: Types.ObjectId(fileId), status: 1 }) 

            await this.s3Upload.deleteFile(fileInfo?.key);
            await this.media.deleteFile({ _id: Types.ObjectId(fileId), status: 1 })

            return this.response.success(res, '', `File has been deleted succesfully`);

        } catch (err) {
            console.log(err)
            return this.response.errorInternal(err, res)
        }
    }

    @Post('/upload/multiple')
    @UseGuards(AuthGuard)
    @UseInterceptors(FilesInterceptor('files'))
    async uploadMultipleMedia(@UploadedFiles() files: Array<Express.Multer.File>, @Req() req: Request, @Res() res: Response, @Body() body: MediaUploadDto) {
        try {
            if (files == undefined) {
                return this.response.error(res, 400, 'Please select files')
            };

            this.s3Upload.uploadMultipleFilesToS3(files, req.user._id).then(async (data: any) => {
                let insertObj = data.map((item) => {
                    return {
                        fileName: item.fileName,
                        mimeType: item.mimeType,
                        key: item.key,
                        userId: item.userId,
                        type: body.type,
                        fileId: item.fileId,
                        sequence: data.indexOf(item)
                    }
                });

                let uploadImg = await this.media.insertMultiple(insertObj)
            
                for(let x of uploadImg) {
                    x["key"] = await this.s3Upload.s3GetSignedURL(x.key)
                };

                return this.response.success(res, uploadImg, "Files uploaded succesfully files")
                
            }).catch(err => {
                return this.response.error(res, 400, err)
            });
        } catch (err) {
            console.log(err)
            return this.response.errorInternal(err, res)
        }
    };

    @Get('/all')
    @UseGuards(AuthGuard)
    async getAllMediaByType(@Req() req: Request, @Res() res: Response, @Query() query: any) {
        try {
            const { type, q = "" } = query;

            let queryObj = {
                status: 1,
                userId: req.user._id
            };

            if(q && q.length>0) {
                queryObj["fileName"] = { $regex: q, $options: "si" }
            }

            if(type == undefined) {
                return this.response.error(res, 400, 'Type is required')
            } else {
                queryObj["type"] = type;
            };

            this.media.getAll(queryObj).then(async (data) => {
                for(let x of data) {
                    x["key"] = await this.s3Upload.s3GetSignedURL(x.key)
                }
                return this.response.success(res, data, `File has been uploaded succesfully`);
            }).catch(err => {
                return this.response.error(res, 400, err)
            });

        } catch (err) {
            return this.response.errorInternal(err, res)
        }
    };
}
