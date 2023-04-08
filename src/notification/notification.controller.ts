import { Controller, Post, Get, Body, Req, Res, Query, UseInterceptors, UseGuards, Param, UploadedFiles, UploadedFile } from '@nestjs/common';
import { Request, Response } from 'express';
import { ResponseHandler } from '../../src/utils/response.handler';
import { AuthGuard } from '../../src/Guards/auth.guard';
import { Types } from "mongoose";
import { NotificationService } from './notification.service';
let gIntDataPerPage = 8;

@Controller('notification')
export class NotificationController {
    constructor(
        private response: ResponseHandler,
        private notify: NotificationService
    ) { };

    @Get('/listAllNotifications')
    @UseGuards(AuthGuard)
    async listAllNotifications(@Req() req: Request, @Res() res: Response, @Query() query: any) {
        try {

            gIntDataPerPage = 8;

            let page = Number(req.query.page) || 1;
            let skipRec = page - 1;
            skipRec = skipRec * gIntDataPerPage;

            let lAryNotificationData = await this.notify.getAllNotifications(req.user, skipRec, gIntDataPerPage)
            let lIntNoOfNotifications = await this.notify.getNotificationCount({ userId: req.user._id, isDeleted: false });
            let lIntNoOfUnreadNotifications = await this.notify.getNotificationCount({ userId: req.user._id, isDeleted: false, isSeen: false });

            let lObjNotification = {
                unreadCount: lIntNoOfUnreadNotifications.length,
                notificationList: lAryNotificationData,
                total: Math.ceil(lIntNoOfNotifications.length / gIntDataPerPage),
                per_page: gIntDataPerPage,
                currentPage: page
            }

            return this.response.success(res, lObjNotification, "Notification list");
        } catch (err) {
            console.log(err, "error")
            return this.response.errorInternal(err, res);
        }
    };

    @Get('/update')
    @UseGuards(AuthGuard)
    async updateViewStatus(@Req() req: Request, @Res() res: Response, @Query() query: any) {
        try {

            await this.notify.updateMany({ "userId": req.user._id });
            let lIntNoOfUnreadNotifications = await this.notify.getNotificationCount({ userId: req.user._id, isDeleted: false, isSeen: false });
            let lObjNotification = {
                unreadCount: lIntNoOfUnreadNotifications.length
            }
            return this.response.success(res, lObjNotification, "Notification viewed.");

        } catch (err) {
            return this.response.errorInternal(err, res);
        }
    };
}
