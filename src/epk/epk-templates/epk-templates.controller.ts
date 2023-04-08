import { Controller, Post, Get, Body, Req, Res, UseGuards, Query, Param, Delete } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthGuard } from '../../Guards/auth.guard';
import { ResponseHandler } from '../../utils/response.handler';
import { EpkService } from '../epk.service';
import { Model, Types } from 'mongoose';
import { CreateTemplateDto } from '../dtos/create-template.dto';
import { EpkTemplatesService } from './epk-templates.service';
import designManager from "../uibox/designManager";
import { S3FileUpload } from '../../utils/s3';
@Controller('epk-templates')
export class EpkTemplatesController {
    constructor(
        private response: ResponseHandler,
        private template: EpkTemplatesService,
        private epk: EpkService,
        private s3: S3FileUpload
    ) { };

    @Post('/add')
    @UseGuards(AuthGuard)
    async addTemplatesToEpk(@Req() req: Request, @Res() res: Response, @Body() body: CreateTemplateDto) {
        try {
            let imageURL;
            let ifepKExsist = await this.epk.findOneEpk({ _id: Types.ObjectId(req.body.epkId), userId: Types.ObjectId(req.user._id), status: 1 })

            if (ifepKExsist == null) {
                return this.response.error(res, 400, "EpK does not exsist")
            };

            let matchQuery = {
                epkId: req.body.epkId,
                userId: req.user._id,
                status: 1
            };

            if (req.body.templateId !== undefined) {
                matchQuery["_id"] = req.body.templateId;
            };

            if(req.body.preview == undefined) {
                await designManager.loadTemplate({
                name: req.body.name,
                objects: req.body.objects,
                background: req.body.background,
                frame: req.body.frame,
                });
                const base64Image = await designManager.downloadTemplate();
                imageURL = await this.s3.uploadBufferImgae(base64Image, req.user._id);
            } else {
                imageURL = await this.s3.uploadBufferImgae(req.body.preview, req.user._id);
            }

            let ifTemplateExsist = await this.template.findOneTemplate(matchQuery);

            if (ifTemplateExsist == null || req.body.templateId == undefined) {
                this.template.createTemplate({
                    name: req.body.name,
                    objects: req.body.objects,
                    background: req.body.background,
                    frame: req.body.frame,
                    preview: imageURL.key,
                    epkId: Types.ObjectId(req.body.epkId),
                    userId: Types.ObjectId(req.user._id)
                }).then(async data => {
                    data["preview"] = await this.s3.s3GetSignedURL(imageURL.key);
                    return this.response.success(res, data, "Template created successfully")
                }).catch(err => {
                    return this.response.error(res, 400, err)
                });
            }

            if (ifTemplateExsist !== null && req.body.templateId !== undefined) {
                if('preview' in ifTemplateExsist && ifTemplateExsist.preview != undefined) {
                    await this.s3.deleteFile(ifTemplateExsist.preview);
                }

                this.template.updateTemplate(req.body.epkId.toString(), {
                    name: req.body.name,
                    objects: req.body.objects,
                    templateId: Types.ObjectId(req.body.templateId),
                    background: req.body.background,
                    frame: req.body.frame,
                    preview: imageURL.key,
                    userId: Types.ObjectId(req.user._id)
                }).then(async data => {
                    data["preview"] = await this.s3.s3GetSignedURL(imageURL.key);
                    return this.response.success(res, data, "Epk created successfully")
                }).catch(err => {
                    return this.response.error(res, 400, err)
                });
            }
        } catch (e) {
            return this.response.errorInternal(e, res)
        }
    };

    @Get("/:epkId")
    @UseGuards(AuthGuard)
    async getEpkById(@Req() req: Request, @Res() res: Response, @Param('epkId') epkId: string) {
        try {
            this.template.getTemplateByEpkId({
                status: 1,
                epkId: Types.ObjectId(epkId),
                $or: [
                    { userId: req.user._id },
                    { "invitemembers.email": { $in: [req.user.email] } }
                ]
            }).then(async data => {
                for(let x of data) {
                    x["preview"] = await this.s3.s3GetSignedURL(x.preview);
                }
                return this.response.success(res, data, "Epk Fetched successfully")
            }).catch(err => {
                return this.response.error(res, 400, err)
            });

        } catch (e) {
            return this.response.errorInternal(e, res)
        }
    };


    @Delete("/:templateId")
    @UseGuards(AuthGuard)
    async deleteEpkTempById(@Req() req: Request, @Res() res: Response, @Param('templateId') templateId: string) {
        try {
            let ifTempExsist = await this.template.findOneTemplate({
                status: 1,
                _id: Types.ObjectId(templateId),
                userId: req.user._id
            });

            if (ifTempExsist == null) {
                return this.response.error(res, 400, "Template does'nt exsist, please try again");
            };

            this.template.removeTemp(Types.ObjectId(templateId), Types.ObjectId(req.user._id)).then(data => {
                return this.response.success(res, '', "Template deleted successfully")
            }).catch(err => {
                return this.response.error(res, 400, err)
            });

        } catch (e) {
            return this.response.errorInternal(e, res)
        }
    }
}
