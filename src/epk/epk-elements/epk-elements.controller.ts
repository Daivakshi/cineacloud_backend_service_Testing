import { Controller, Post, Get, Body, Req, Res, UseGuards, Query, Param, Delete } from '@nestjs/common';
import { Request, Response } from 'express';
import { ResponseHandler } from '../../utils/response.handler';
import { CreateElementDto } from '../dtos/create-element.dto';
import { EpkElementsService } from './epk-elements.service';
import { S3FileUpload } from '../../utils/s3';

@Controller('epk')
export class EpkElementsController {
    constructor(
        private response: ResponseHandler,
        private element: EpkElementsService,
        private s3: S3FileUpload
    ) { };

    @Get('/elements')
    async getElements(@Req() req: Request, @Res() res: Response) {
        try {
            this.element.findAll().then(async data => {
                for(let x of data) {
                    x.metadata.preview = await this.s3.s3GetSignedURL(x.metadata.preview)
                };
                return this.response.success(res, data, "Epk Elements fetched successfully")
            }).catch(err => {
                return this.response.error(res, 400, err)
            });
        } catch (e) {
            return this.response.errorInternal(e, res)
        }
    };

    @Post('/elements')
    async addEpkElements(@Body() body: CreateElementDto, @Req() req: Request, @Res() res: Response) {
        try {
            this.element.addElement(body).then(data => {
                return this.response.success(res, data, "Epk Elements created successfully")
            }).catch(err => {
                return this.response.error(res, 400, err)
            });
        } catch (e) {
            return this.response.errorInternal(e, res)
        }
    }
}
