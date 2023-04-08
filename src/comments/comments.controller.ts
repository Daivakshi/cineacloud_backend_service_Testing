import { Controller, Post, Get, Body, Req, Res, Query, UseInterceptors, UseGuards, Param, UploadedFiles } from '@nestjs/common';
import { Request, Response } from 'express';
import { ResponseHandler } from '../../src/utils/response.handler';
import { AuthGuard } from '../../src/Guards/auth.guard';
import { CommentsService } from './comments.service';
import { PusherService } from '../../src/utils/pusher';
import { CreateCommentDto } from './dtos/create-comment.dto';
import { PropsService } from '../../src/props/props.service';
import { Types } from 'mongoose';
import { MediasService } from '../../src/medias/medias.service';

@Controller()
export class CommentsController {
    constructor(
        private response: ResponseHandler,
        private comment: CommentsService,
        private props: PropsService,
        private pusher: PusherService,
        private media: MediasService
    ) { };

    @Post('/pusher/auth')
    @UseGuards(AuthGuard)
    async pusherAuth(@Req() req: Request, @Res() res: Response) {
        try {
            const socketId = req.body.socket_id;
            const channelName = req.body.channel_name;

            let user = await this.comment.findUser({
                _id: req.user._id,
            });

            if (!user) {
                return this.response.badValues(res, "User does not exsist");
            }

            const channelData = {
                user_id: req.user._id,
                user_info: {
                    firstName: req.user.firstName,
                    userName: req.user.firstName + " " + req.user.lastName,
                    lastName: req.user.lastName,
                    channelName: "ch-" + req.user._id,
                    email: req.user.email,
                    userId: req.user._id,
                },
            };

            const auth = await this.pusher.authenticate(
                socketId,
                channelName,
                channelData
            );

            res.status(200).send(auth)

        } catch (err) {
            return this.response.errorInternal(err, res)
        }
    };

    @Post('/comment/create')
    @UseGuards(AuthGuard)
    async createComment(@Req() req: Request, @Res() res: Response, @Body() body: CreateCommentDto) {
        try {
            const { appId, screenId, comment, type } = body;

            let ifAppExsist = await this.props.findOneProps({
                _id: appId,
                status: 1
            });

            if (ifAppExsist == null) {
                return this.response.forbiddenError(
                    res,
                    "You can't comment on the Deleted Prop!!"
                )
            };

            let ifFileExsist = await this.media.getFile({
                _id: screenId,
                status: 1
            });

            if (ifFileExsist == null) {
                return this.response.forbiddenError(
                    res,
                    "You can't comment on the Deleted screen!!"
                )
            };

            let memberCount = await this.props.getMembersPropId({
                propId: Types.ObjectId(appId.toString()),
                status: 1
            });

            let createComment = {
                appId,
                screenId,
                comment,
                type,
                userId: req.user._id
            };

            let commentObj = await this.comment.createComment(createComment);

            let lObjResp = await this.comment.getCommentsById({
                _id: commentObj._id,
                status: 1
            }, type);

            let members = memberCount.map(item => 'ch-' + item._id);

            members = [...members, 'ch-' + ifAppExsist.userId]

            this.pusher.onScreenComment("presence-" + appId, lObjResp);

            return this.response.success(res, lObjResp, 'Comment added successfully')


        } catch (err) {
            return this.response.errorInternal(err, res)
        }
    };

    @Get('/comments/:id')
    @UseGuards(AuthGuard)
    async listMembers(@Req() req: Request, @Res() res: Response, @Param('id') id: string, @Query() query: any) {
        try {

            if (req.params.id == undefined) {
                return this.response.error(res, 400, "screenId is mandatory")
            };

            if (req.query.appId == undefined) {
                return this.response.error(res, 400, "Prop Id is mandatory")
            };

            if (req.query.type == undefined) {
                return this.response.error(res, 400, "Type is mandatory")
            };

            let queryObj = {
                screenId: Types.ObjectId(req.params.id),
                appId: Types.ObjectId(query.appId),
                status: 1
            };

            this.comment.getAllComments(queryObj, query.type).then(async data => {
                return this.response.success(res, data, "Props members fetched successfully")
            }).catch(err => {
                return this.response.error(res, 400, err)
            });

        } catch (e) {
            return this.response.errorInternal(e, res)
        }
    };


}
