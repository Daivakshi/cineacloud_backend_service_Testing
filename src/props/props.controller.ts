import { Controller, Post, Get, Body, Req, Res, UseGuards, Query, Param, Delete, Put } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { Request, Response } from 'express';
import { AuthGuard } from '../../src/Guards/auth.guard';
import { ResponseHandler } from '../../src/utils/response.handler';
import { S3FileUpload } from '../../src/utils/s3';
import { CreatePropsDto } from './dtos/create-prop.dto';
import { PropsService } from './props.service'
import { InvitePropMembersDto } from './dtos/invite-member.dto';
import { DeletePropDto } from './dtos/delete-prop.dto';
import { Mailer } from '../../src/utils/mailService';
let gIntDataPerPage = 10;

@Controller('props')
export class PropsController {
    constructor(
        private response: ResponseHandler,
        private props: PropsService,
        private s3: S3FileUpload,
        private mailer: Mailer
    ) { };


    @Post('/create')
    @UseGuards(AuthGuard)
    async createProps(@Req() req: Request, @Res() res: Response, @Body() body: CreatePropsDto) {
        try {
            const { image, item, sceneHeading, sceneNumber, cast, approved, acquired, projectId, notes, shootDate } = body;

            let searchObj = {
                item,
                status: 1
            };

            if (projectId !== undefined) {
                searchObj["projectId"] = Types.ObjectId(projectId.toString());;
            }

            let ifPropsExsist = await this.props.findOneProps(searchObj);

            if (ifPropsExsist !== null) {
                return this.response.error(res, 400, "Props already exsist under the same name")
            };

            let lObj = {
                "item": item,
                "userId": req.user._id,
            }

            if(sceneNumber) {
                lObj["sceneNumber"] = sceneNumber
            }
    
            if(sceneHeading) {
                lObj["sceneHeading"] = sceneHeading
            }
    
            if(shootDate) {
                lObj["shootDate"] = new Date(shootDate)
            }
    
            if(cast) {
                lObj["cast"] = cast
            }
    
            if(approved) {
                lObj["approved"] = approved
            }
    
            if(acquired) {
                lObj["acquired"] = acquired
            }
    
            if(notes) {
                lObj["notes"] = notes
            }

            if(image?.length > 0) {
                lObj["image"] = image
            }

            if (projectId !== undefined) {
                lObj["projectId"] = projectId;
            }

            this.props.createProps(lObj).then(data => {
                return this.response.success(res, data, "Props created successfully")
            }).catch(err => {
                return this.response.error(res, 400, err)
            });

        } catch (e) {
            return this.response.errorInternal(e, res)
        }
    };

    @Put('/update')
    @UseGuards(AuthGuard)
    async updateProps(@Req() req: Request, @Res() res: Response, @Body() body: CreatePropsDto) {
        try {
            const { image, item, sceneHeading, sceneNumber, cast, approved, acquired, projectId, propsId, shootDate, notes } = body;

            let searchObj = {
                _id: propsId,
                status: 1
            };

            if (projectId !== undefined) {
                searchObj["projectId"] = Types.ObjectId(projectId.toString());
            }

            let ifPropsExsist = await this.props.findOneProps(searchObj);

            if (ifPropsExsist == null) {
                return this.response.error(res, 400, "Props does not exsist")
            };

            let lObj = {
                "item": item,
                // "userId": req.user._id,
            }

            if(sceneNumber) {
                lObj["sceneNumber"] = sceneNumber
            }
    
            if(sceneHeading) {
                lObj["sceneHeading"] = sceneHeading
            }
    
            if(shootDate) {
                lObj["shootDate"] = new Date(shootDate)
            }
    
            if(cast) {
                lObj["cast"] = cast
            }
    
            if(approved) {
                lObj["approved"] = approved
            }
    
            if(acquired) {
                lObj["acquired"] = acquired
            }
    
            if(notes) {
                lObj["notes"] = notes
            }

            if(image?.length > 0) {
                lObj["image"] = image
            }

            if (projectId !== undefined) {
                lObj["projectId"] = projectId;
            }

            this.props.updateProps(propsId, lObj).then(data => {
                return this.response.success(res, data, "Props updated successfully")
            }).catch(err => {
                return this.response.error(res, 400, err)
            });

        } catch (e) {
            return this.response.errorInternal(e, res)
        }
    };

    @Get()
    @UseGuards(AuthGuard)
    async getAll(@Req() req: Request, @Res() res: Response, @Query() query: any) {
        try {

            gIntDataPerPage = req.query.offset ? Number(req.query.offset) : 15

            //Pagination
            let page = Number(req.query.page) || 1;
            let skipRec = page - 1;
            skipRec = skipRec * gIntDataPerPage;

            let limit = Number(req.query.limit);
            let pageLimit;

            if (limit) {
                pageLimit = limit;
            } else {
                pageLimit = gIntDataPerPage;
            };

            let searchObj = {
                status: 1,
                $and: [
                    {
                        $or: [
                            { userId: req.user._id },
                            { "propsmembers.email": { $in: [req.user.email] } },
                        ]
                    }
                ]
            };

            let sortObj = {};
            sortObj = { 'createdAt': -1 };

            if (req.query.projectId !== undefined) {
                searchObj["projectId"] = Types.ObjectId(req.query.projectId.toString());
            };

            if (req.query.q !== undefined) {
                searchObj["$or"] = [
                    { "cast": { $regex: req.query.q, "$options": "i" } },
                    { "sceneHeading": { $regex: req.query.q, "$options": "i" } },
                    { "item": { $regex: req.query.q, "$options": "i" } }
                ]
            };

            if (req.query.sort !== undefined && req.query.type !== undefined) {
                if (req.query.type == 'asc') {
                    switch (req.query.sort) {
                        case 'sceneNumber':
                            sortObj = { 'sceneNumber': 1 };
                            break;

                        case 'cast':
                            sortObj = { 'cast': 1 };
                            break;

                        case 'item':
                            sortObj = { 'item': 1 };
                            break;
                    }
                } else {
                    switch (req.query.sort) {
                        case 'sceneNumber':
                            sortObj = { 'sceneNumber': -1 };
                            break;

                        case 'cast':
                            sortObj = { 'cast': -1 };
                            break;

                        case 'item':
                            sortObj = { 'item': -1 };
                            break;
                    }
                }

            };

            let count = await this.props.getTotalCount(searchObj)

            this.props.getAllProps(searchObj, skipRec, pageLimit, sortObj).then(async data => {
                for (let prop of data) {
                    for (let [i, x] of prop?.image?.entries()) {
                        if(Object.keys(x).length > 1) {
                            let sUrl = await this.s3.s3GetSignedURL(x.key)
                            x["url"] = sUrl
                        } else {
                            prop?.image?.splice(i, 1)
                        }
                    }
                };

                let lObjPropsData = {
                    props: data,
                    total: Math.round(count.length / (limit ? limit : gIntDataPerPage)),
                    per_page: limit ? limit : gIntDataPerPage,
                    currentPage: page,
                    count: count.length
                }

                return this.response.success(res, lObjPropsData, "Props fetched successfully")
            }).catch(err => {
                console.log(err)
                return this.response.error(res, 400, err)
            });

        } catch (e) {
            return this.response.errorInternal(e, res)
        }
    };

    @Get('/:id')
    @UseGuards(AuthGuard)
    async getPropById(@Req() req: Request, @Res() res: Response, @Query('projectId') projectId: string, @Param('id') id: string) {
        try {

            if (req.params.id == undefined) {
                return this.response.error(res, 400, "Props id is mandatory")
            };

            let ifUhaveAccess = await this.props.checkAccess({
                status: 1,
                _id: Types.ObjectId(req.params.id),
                $or: [
                    { userId: req.user._id },
                    { "propsmembers.email": { $in: [req.user.email] } },
                ]
            });

            if (ifUhaveAccess == null) return this.response.noAccess(res, 'You dont have access to view the app')

            let searchObj = {
                _id: Types.ObjectId(req.params.id),
                status: 1
            };

            if (req.query.projectId !== undefined) {
                searchObj["projectId"] = Types.ObjectId(req.query.projectId.toString());;
            }

            this.props.findOnePropsWithImage(searchObj).then(async data => {
                for (let [i, prop] of data.image.entries()) {
                    if(Object.keys(prop).length > 1) {
                        let sUrl = await this.s3.s3GetSignedURL(prop.key)
                        prop["url"] = sUrl
                    } else {
                        data?.image?.splice(i, 1)
                    }
                };
                return this.response.success(res, data, "Props fetched successfully")
            }).catch(err => {
                return this.response.error(res, 400, err)
            });

        } catch (e) {
            return this.response.errorInternal(e, res)
        }
    };

    @Delete('/remove/:id')
    @UseGuards(AuthGuard)
    async deleteProps(@Req() req: Request, @Res() res: Response, Response, @Param('id') id: string) {
        try {

            if (req.params.id == undefined) {
                return this.response.error(res, 400, "Props id is mandatory")
            };

            let searchObj = {
                _id: req.params.id,
                userId: req.user._id,
                status: 1
            };

            this.props.deleteProps(searchObj).then(async data => {
                return this.response.success(res, '', "Props deleted successfully")
            }).catch(err => {
                return this.response.error(res, 400, err)
            });

        } catch (e) {
            return this.response.errorInternal(e, res)
        }
    };

    @Post('/remove-many')
    @UseGuards(AuthGuard)
    async deleteManyProps(@Req() req: Request, @Res() res: Response, Response, @Body() body: DeletePropDto) {
        try {

            const { deleteIds } = body;

            let searchObj = {
                _id: { $in: deleteIds },
                userId: req.user._id,
                status: 1
            };

            this.props.deleteManyProps(searchObj).then(async data => {
                return this.response.success(res, '', "Props deleted successfully")
            }).catch(err => {
                return this.response.error(res, 400, err)
            });

        } catch (e) {
            return this.response.errorInternal(e, res)
        }
    };

    @Post('/invite')
    @UseGuards(AuthGuard)
    async inviteSigners(@Req() req: Request, @Res() res: Response, @Body() body: InvitePropMembersDto) {
        try {
            const { propId, addMembers, removeMembers } = body;

            let searchObj = {
                status: 1,
                _id: Types.ObjectId(propId.toString()),
                $or: [
                    { userId: req.user._id },
                    { "propsmembers.email": req.user.email }
                ]
            };

            console.log(searchObj, "searchObj")

            let ifPropsExsist = await this.props.findPropMember(searchObj);

            if (ifPropsExsist == null) {
                return this.response.error(res, 400, 'Prop dont exsist please check')
            };

            if (addMembers.length > 0) {
                for (let member of addMembers) {
                    if (member.email == req.user.email) {
                        return this.response.error(res, 400, 'You cant add yourself as members')
                    };

                    let checkMemberAlreadyExsist = await this.props.checkMembers({
                        propId,
                        email: member.email,
                        userId: req.user._id,
                        status: 1
                    });


                    if (checkMemberAlreadyExsist) {
                        return this.response.error(res, 400, `${member.name} already added to the contract`)
                    };

                    await this.props.inviteMembers({
                        propId,
                        name: member.name || '',
                        email: member.email,
                        userId: Types.ObjectId(req.user._id)
                    });

                    const mailOptions = {
                        from: process.env.ADMIN_EMAIL,
                        to: member.email, // list of receivers
                        subject: `Cineacloud | Props Invite`, // Subject line
                        template: 'individual_invite',
                        'h:X-Mailgun-Variables': JSON.stringify({
                            "userName": `${member.name}`,
                            "app": "props",
                            "appName": `${ifPropsExsist.item}`,
                            "inviter_name": req.user.firstName,
                            "verifyLink": `${process.env.NODE_URL_1}/users/loginnew`,
                            "function": "invited to"
                        })
                    };
    
                    await this.mailer.send(mailOptions)
                }

                let signers = await this.props.getAllMembersByProp({ propId: Types.ObjectId(propId), status: 1 })

                return this.response.success(res, signers, 'Prop Member added successfully')
            }

            if (removeMembers.length > 0) {
                for (let member of removeMembers) {
                    let checkSigners = await this.props.checkMembers({
                        propId,
                        email: member.email,
                        userId: req.user._id,
                        status: 1
                    });

                    if (checkSigners) {
                        await this.props.removeMembers({
                            propId,
                            email: member.email,
                            userId: req.user._id,
                            status: 1
                        });

                        const mailOptions = {
                            from: process.env.ADMIN_EMAIL,
                            to: member.email, // list of receivers
                            subject: `Cineacloud | Props Invite`, // Subject line
                            template: 'individual_invite',
                            'h:X-Mailgun-Variables': JSON.stringify({
                                "userName": `${member.name}`,
                                "app": "props",
                                "appName": `${ifPropsExsist.item}`,
                                "inviter_name": req.user.firstName,
                                "verifyLink": `${process.env.NODE_URL_1}/users/loginnew`,
                                "function": "removed from"
                            })
                        };
        
                        await this.mailer.send(mailOptions)
                    }
                }

                let signers = await this.props.getAllMembersByProp({ propId: Types.ObjectId(propId), status: 1 })

                return this.response.success(res, signers, 'Prop Member removed successfully')
            }
        } catch (e) {
            console.log(e, "error")
            return this.response.errorInternal(e, res)
        }
    };

    @Get('/list-members/:id')
    @UseGuards(AuthGuard)
    async listMembers(@Req() req: Request, @Res() res: Response, @Param('id') id: string) {
        try {

            if (req.params.id == undefined) {
                return this.response.error(res, 400, "Props id is mandatory")
            };

            let searchObj = {
                propId: Types.ObjectId(req.params.id),
                status: 1
            };

            let ifPropExsist = await this.props.findPropMember({ status: 1, _id: Types.ObjectId(req.params.id) })

            if (ifPropExsist == null) {
                return this.response.error(res, 400, 'Equipment not found')
            }

            this.props.getAllMembersByProp(searchObj).then(async data => {
                data = [...data, ifPropExsist.userId]
                return this.response.success(res, data, "Props members fetched successfully")
            }).catch(err => {
                return this.response.error(res, 400, err)
            });

        } catch (e) {
            return this.response.errorInternal(e, res)
        }
    };
}
