import { Controller, Post, Get, Body, Req, Res, Query, UseInterceptors, UseGuards, Param, Put } from '@nestjs/common';
import { Request, Response } from 'express';
import { ResponseHandler } from '../../utils/response.handler';
import { AuthGuard } from '../../Guards/auth.guard';
import { SignersService } from './signers.service';
import { InviteSignersDto } from '../dtos/invite-signers.dto';
import { Types } from 'mongoose';
import { AddSignFontDto } from '../dtos/add-sign-font.dto';
import { AddDrawSignDto } from '../dtos/add-draw-sign.dto';
import { EnableSingleUserDto } from '../dtos/enable-signer.dto';
import { AddEmailNotificationDto } from '../dtos/add-email-notification.dto';
import { Mailer } from '../../utils/mailService';
import * as jwt from 'jsonwebtoken'
import { VerifySignersDto } from '../dtos/verify-signers.dto';
import { SubmitSignDto } from '../dtos/submit-sign.dto';
@Controller('signs')
export class SignersController {
    constructor(
        private response: ResponseHandler,
        private signers: SignersService,
        private mailer: Mailer
    ) { };

    @Post('/invite-signers')
    @UseGuards(AuthGuard)
    async inviteSigners(@Req() req: Request, @Res() res: Response, @Body() body: InviteSignersDto) {
        try {
            const { contractId, addMembers, removeMembers } = body;

            let ifContractExsist = await this.signers.getContractById(contractId, req.user._id);

            if (ifContractExsist == null) {
                return this.response.error(res, 400, 'Contract dont exsist please check')
            };

            if (addMembers.length > 0) {
                for (let member of addMembers) {
                    if (member.email == req.user.email) {
                        return this.response.error(res, 400, 'You cant add yourself as signers')
                    };

                    let checkMemberAlreadyExsist = await this.signers.checkSigners({
                        contractId,
                        email: member.email,
                        createdBy: req.user._id,
                        status: 1
                    });

                    if (checkMemberAlreadyExsist) {
                        return this.response.error(res, 400, `${member.name} already added to the contract`)
                    };

                    await this.signers.createSigners({
                        contractId,
                        name: member.name || '',
                        email: member.email,
                        action: member.action,
                        createdBy: Types.ObjectId(req.user._id)
                    })
                }
            }

            if (removeMembers.length > 0) {
                for (let member of removeMembers) {
                    let checkSigners = await this.signers.checkSigners({
                        contractId,
                        email: member.email,
                        createdBy: req.user._id,
                        status: 1
                    });

                    if (checkSigners) {
                        await this.signers.deleteSigners({
                            contractId,
                            email: member.email,
                            createdBy: req.user._id,
                            status: 1
                        })
                    }
                }
            }

            let signers = await this.signers.getAllSignersByContract(contractId)

            return this.response.success(res, signers, 'Contract signers updated successfully')
        } catch (e) {
            return this.response.errorInternal(e, res)
        }
    };

    @Get('/all')
    @UseGuards(AuthGuard)
    async getAllSigns(@Req() req: Request, @Res() res: Response) {
        try {
            this.signers.getAllSigns(req.user._id).then(async data => {
                return this.response.success(res, data, "Signature listed")
            }).catch(err => {
                return this.response.error(res, 400, err)
            });
        } catch (e) {
            return this.response.errorInternal(e, res)
        }
    };

    @Post('/add-sign')
    @UseGuards(AuthGuard)
    async addSign(@Req() req: Request, @Res() res: Response, @Body() body: AddSignFontDto) {
        try {
            const { pubKeyFingerprint, styling, signatureText, signatureId = '' } = body;

            if (signatureId && signatureId.toString().length > 0) {
                this.signers.updateSign(signatureId.toString(), {
                    pubKeyFingerprint,
                    styling,
                    signatureText,
                    userId: req.user._id,
                    imageData: null
                }).then(async data => {
                    return this.response.success(res, data, "Signature font has been added successfully")
                }).catch(err => {
                    return this.response.error(res, 400, err)
                });
            } else {
                this.signers.addSign({
                    pubKeyFingerprint,
                    styling,
                    signatureText,
                    userId: req.user._id
                }).then(async data => {
                    return this.response.success(res, data, "Signature font has been added successfully")
                }).catch(err => {
                    return this.response.error(res, 400, err)
                });
            }
        } catch (e) {
            return this.response.errorInternal(e, res)
        }
    };

    @Post('/sign-image')
    @UseGuards(AuthGuard)
    async addImageSign(@Req() req: Request, @Res() res: Response, @Body() body: AddDrawSignDto) {
        try {
            const { image, signatureId = '' } = body;

            if (signatureId && signatureId.toString().length > 0) {
                this.signers.updateSign(signatureId.toString(), {
                    imageData: image,
                    userId: req.user._id,
                    pubKeyFingerprint: null,
                    styling: null
                }).then(async data => {
                    return this.response.success(res, data, "Signature font has been added successfully")
                }).catch(err => {
                    return this.response.error(res, 400, err)
                });
            } else {
                this.signers.addDrawSign({
                    imageData: image,
                    userId: req.user._id
                }).then(async data => {
                    return this.response.success(res, data, "Signature font has been added successfully")
                }).catch(err => {
                    return this.response.error(res, 400, err)
                });
            }
        } catch (e) {
            return this.response.errorInternal(e, res)
        }
    };

    @Post('/single-signer')
    @UseGuards(AuthGuard)
    async enableSingleSigner(@Req() req: Request, @Res() res: Response, @Body() body: EnableSingleUserDto) {
        try {
            const { contractId, enableSingleUser } = body;

            if (contractId && contractId.toString().length < 0) {
                return this.response.error(res, 400, "Please provide contractId")
            }

            let ifContractExsist = await this.signers.getContractById(contractId.toString(), req.user._id);

            if (ifContractExsist == null) {
                return this.response.error(res, 400, "COntract does not exsist")
            };

            this.signers.updateContract(contractId.toString(), {
                isSingleSigner: enableSingleUser,
                userId: req.user._id
            }).then(async data => {
                return this.response.success(res, data, "Contract has been updated successfully")
            }).catch(err => {
                return this.response.error(res, 400, err)
            });
        } catch (e) {
            return this.response.errorInternal(e, res)
        }
    };

    @Get('/signers')
    @UseGuards(AuthGuard)
    async getAllSigners(@Req() req: Request, @Res() res: Response, @Query('id') id: string) {
        try {
            this.signers.getMembers(id, req.user._id).then(async data => {
                return this.response.success(res, data, "Members listed")
            }).catch(err => {
                return this.response.error(res, 400, err)
            });
        } catch (e) {
            return this.response.errorInternal(e, res)
        }
    };

    @Post('/email-notification')
    @UseGuards(AuthGuard)
    async sendMailToSigners(@Req() req: Request, @Res() res: Response, @Body() body: AddEmailNotificationDto) {
        try {
            const { contractId, emailSub, emailMsg = "Please sign the document", expiry = 7 } = body;

            let ifContractExsist = await this.signers.getContractById(contractId.toString(), req.user._id.toString());

            if (ifContractExsist == null) {
                return this.response.error(res, 400, 'Contract does not exsist');
            };

            let members = await this.signers.getAllSignersByContract(contractId.toString());

            for (let member of members) {
                if (member && 'emailsent' in member && !member.emailsent) {

                    let updateData = {
                        emailData: {
                            emailSub,
                            emailMsg,
                            email: member.email
                        },
                        createdBy: req.user._id
                    };

                    let tokenData = {
                        _id: member._id,
                        name: member.name,
                        email: member.email,
                        contractId: member.contractId,
                        invitedBy: member.createdBy
                    };

                    let token = jwt.sign(tokenData, process.env.JWT_SECRET, {
                        expiresIn: expiry + 'd'
                    });

                    // need to add mailer functionality
                    this.mailer.contractInvitation({
                        email: member.email,
                        emailSub,
                        emailMsg,
                        userEmail: req.user.email,
                        userName: req.user.firstName,
                        signerName: member.name,
                        contractName: ifContractExsist.name,
                        inviteLink: process.env.FRONT_END_URL + '/app/contract/view/' + Buffer.from(contractId.toString()).toString('base64') + '/sign?token=' + Buffer.from(token).toString('base64')
                    }).then(async (resp) => {
                        updateData["emailsent"] = true
                        updateData["token"] = token
                        await this.signers.updateSigners(contractId, updateData)

                        return this.response.success(res, '', 'Email Notifcation Sent')
                    
                    }).catch(err => {
                        console.log("Failed", err)
                    });
                }
            };
        } catch (e) {
            console.log(e)
            return this.response.errorInternal(e, res)
        }
    };

    @Post('/verify')
    async verifySigners(@Req() req: Request, @Res() res: Response, @Body() body: VerifySignersDto) {
        try {
            const { token } = body;

            let ifContractExsist = await this.signers.checkContractById(body.contractId);

            if (ifContractExsist == null) {
                return this.response.error(res, 400, 'Contract does not exsist');
            };

            let ifMemberExsist = await this.signers.checkSignerByToken({ token, status: 1, emailsent: true });

            if (ifMemberExsist == null) {
                return this.response.error(res, 400, 'Signer does not exsist in contract');
            };

            const { _id, email, name, createdBy, emailsent, contractId } = ifMemberExsist.toObject(),
                tokenData = { _id, email, name, createdBy, emailsent, contractId };

            let tokenStr = jwt.sign(tokenData, process.env.JWT_SECRET, {
                expiresIn: '1d'
            });

            ifMemberExsist["token"] = null
            await ifMemberExsist.save()

            return this.response.success(res, { token: tokenStr, userData: ifMemberExsist }, 'User authenticated successfully')

        } catch (e) {
            console.log(e)
            return this.response.errorInternal(e, res)
        }
    };

    @Post('/submitted')
    @UseGuards(AuthGuard)
    async submitSign(@Req() req: Request, @Res() res: Response, @Body() body: SubmitSignDto) {
        try {
            const { contractId } = body;

            let ifContractExsist = await this.signers.checkContractById(contractId);

            if (ifContractExsist == null) {
                return this.response.error(res, 400, 'Contract does not exsist');
            };

            let ifMemberExsist = await this.signers.checkSignerByToken({ _id: req.user._id, status: 1, emailsent: true });

            if (ifMemberExsist == null) {
                return this.response.error(res, 400, 'Signer does not exsist in contract');
            };

            this.signers.updateDocStatus(contractId, req.user._id).then(async data => {
                return this.response.success(res, data, "Document Signed successfully")
            }).catch(err => {
                return this.response.error(res, 400, err)
            });

        } catch (e) {
            console.log(e)
            return this.response.errorInternal(e, res)
        }
    }

    @Post('/agree')
    @UseGuards(AuthGuard)
    async AgreeSigner(@Req() req: Request, @Res() res: Response, @Body() body: any) {
        try {
            const { contractId, agree } = body;

            let ifContractExsist = await this.signers.checkContractById(contractId);

            if (ifContractExsist == null) {
                return this.response.error(res, 400, 'Contract does not exsist');
            };

            let ifMemberExsist = await this.signers.checkSignerByToken({ email: req.user.email, status: 1 });

            if (ifMemberExsist == null) {
                return this.response.error(res, 400, 'Signer does not exsist in contract');
            };

            ifMemberExsist['isAgreed'] = agree;
            await ifMemberExsist.save()

            return this.response.success(res, ifMemberExsist, 'Signer agreed to sign the contract')

        } catch (e) {
            console.log(e)
            return this.response.errorInternal(e, res)
        }
    };

    @Post('/declined')
    @UseGuards(AuthGuard)
    async declineSigning(@Req() req: Request, @Res() res: Response, @Body() body: any) {
        try {
            const { contractId } = body;

            let ifContractExsist = await this.signers.checkContractById(contractId);

            if (ifContractExsist == null) {
                return this.response.error(res, 400, 'Contract does not exsist');
            };

            let ifMemberExsist = await this.signers.checkSignerByToken({ email: req.user.email, status: 1 });

            if (ifMemberExsist == null) {
                return this.response.error(res, 400, 'Signer does not exsist in contract');
            };

            ifMemberExsist['isAgreed'] = false;
            ifMemberExsist['documentStatus'] =  0;

            await ifMemberExsist.save()

            return this.response.success(res, ifMemberExsist, 'Signer declined to sign the contract')

        } catch (e) {
            console.log(e)
            return this.response.errorInternal(e, res)
        }
    };


}
