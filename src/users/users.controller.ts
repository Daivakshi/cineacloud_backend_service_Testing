import { Controller, Post, Get, Body, UseGuards, Req, Patch, Param, Res, UnauthorizedException, BadRequestException, InternalServerErrorException, Query } from '@nestjs/common';
import { AuthGuard } from '../Guards/auth.guard';
import { Request, Response } from 'express';
import { Serialize } from '../interceptors/serialize.interceptor';
import { UserDto } from './dtos/user-dto';
import { SignInUserDto } from './dtos/signin-user.dto';
import { UsersService } from './users.service';
import { ResponseHandler } from '../utils/response.handler';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken'
import { CreateProjectDto } from './dtos/create-project.dto';
import * as randomstring from 'randomstring'
import { Mailer } from '../utils/mailService';

@Controller('users')
@Serialize(UserDto)
export class UsersController {
    constructor(
        private userService: UsersService,
        private response: ResponseHandler,
        private mailer: Mailer
    ) { }

    @Get('/profile')
    @UseGuards(AuthGuard)
    userProfile(@Req() req: Request, @Res() res: Response) {
        try {
            this.userService.findOneByEmail(req.user.email).then(data => {
                delete data.password;
                delete data.verificationtoken;
                delete data.onboardingToken;
                return this.response.success(res, data, "User profile fetched successfully")
            }).catch(err => {
                return this.response.error(res, 400, err)
            });
        } catch (e) {
            return this.response.errorInternal(e, res)
        }
    };

    @Post('/login')
    async login(@Req() req: Request, @Res() res: Response, @Body() body: SignInUserDto) {
        try {
            const { email, password } = body;

            const user = await this.userService.findOneByEmail(email);
            if (!user) {
                return this.response.error(res, 400, `User does not exsist`);
            };

            if (!user.isVerified) {
                return this.response.error(res, 400, `Please verify your email before logging In`);
            };

            bcrypt.compare(password, user.password, async (err, isMatch) => {
                if (err) return this.response.error(res, 400, err);
                if (!isMatch) return this.response.error(res, 400, "The username or password entered is invalid");
                if (!user.isVerified) return this.response.error(res, 400, "Your account has not been verified. Please check inbox/spam folder for the verification email");

                user.lastLoggedIn = Date.now();
                await user.save();

                delete user.password;

                const { _id, email, firstName, lastName, lastLoggedIn } = user.toObject(),
                    tokenData = { _id, email, firstName, lastName, lastLoggedIn };

                let token = jwt.sign(tokenData, process.env.JWT_SECRET, {
                    expiresIn: 60 * 60 * 24
                });

                let lObjResponse = {
                    token: token,
                    data: user
                }

                return this.response.success(res, lObjResponse, 'Logged in successfully')
            });
        } catch (err) {
            return this.response.errorInternal(err, res)
        }
    };

    @Get('/projects')
    @UseGuards(AuthGuard)
    async getUserProjects(@Req() req: Request, @Res() res: Response) {
        try {
            this.userService.findAllProjects(req.user._id).then(data => {
                return this.response.success(res, data, "User Projects")
            }).catch(err => {
                return this.response.error(res, 400, err)
            });
        } catch (e) {
            return this.response.errorInternal(e, res)
        };
    };

    @Get('/projects/:projectId')
    @UseGuards(AuthGuard)
    async getUserProjectById(@Req() req: Request, @Res() res: Response) {
        try {

            if(req.params.projectId == undefined) {
                return this.response.error(res, 400, 'Project Id is mandatory')
            }

            this.userService.getProjectById({ _id: req.params.projectId, status: 1, createdBy: req.user._id }).then(data => {
                return this.response.success(res, data, "User Projects")
            }).catch(err => {
                return this.response.error(res, 400, err)
            });
        } catch (e) {
            return this.response.errorInternal(e, res)
        };
    };

    @Post('/projects')
    @UseGuards(AuthGuard)
    async createProject(@Req() req: Request, @Res() res: Response, @Body() body: CreateProjectDto) {
        try {
            const { projName } = body;

            let ifProjectExsist = await this.userService.findProjectByName({ projName, createdBy: req.user._id, status: 1 })

            if(ifProjectExsist !== null) {
                return this.response.error(res, 400, "Project already exsist under the same name")
            };

            this.userService.createProject({
                projName,
                createdBy: req.user._id
            }).then(data => {
                return this.response.success(res, data, "Project created successfully")
            }).catch(err => {
                return this.response.error(res, 400, err)
            });
        } catch (e) {
            return this.response.errorInternal(e, res)
        };
    };

    @Get('/extend-session')
    async getEncryptedKeyForAuth(@Req() req: Request, @Res() res: Response, @Query() query: any) {
        try {
            const { email } = query;
            let userData = await this.userService.findOneByEmail(email);
            let authKey = randomstring.generate({
                length: 12,
            });
            userData.authKey = authKey
            userData.save();
            return this.response.success(res, { authKey }, "Login session extended successfully")
    
        } catch (err) {
            return this.response.errorInternal(err, res)
        }
    };


    /**
     * Premium User concept
     */
    @Post('/add-premium-user')
    async addPremiumUser(@Req() req: Request, @Res() res: Response, @Body() body: { email : string }) {
        try {
            const { email } = body;

            let userData = await this.userService.findOneByEmail(email);

            if(userData) {
                return this.response.error(res, 400, "User already exsist. Please check with the admin")
            };

            let premiumUser = await this.userService.findOnePremiumUserByEmail(email);

            if(premiumUser) {
                return this.response.error(res, 400, "User with same email has been given access to premium account")
            };

            this.userService.createPremiumUser({ email, addedDate: Date.now() })
                .then(user => {
                    const { createdBy, addedDate } = user;

                    let token = jwt.sign({ email, createdBy, addedDate }, process.env.P_USER_SECRET, {
                        expiresIn: 60 * 60 * 24
                    });

                    // need to add mailer functionality
                    this.mailer.sendInvitationToPremiumUser({
                        email: email,
                        link: process.env.NODE_URL_1 + '/users/registernew/premium/annual?token=' + Buffer.from(token).toString('base64')
                    }).then(async (resp) => {
                        user.verificationtoken = token;
                        await user.save()

                        return this.response.success(res, '', 'Mail sent to the user')
                    }).catch(err => {
                        this.userService.deletePremiumUser(email)
                        return this.response.error(res, 400, "Error occured while sending mail to premium user")
                    });
                })
                .catch(async err => {
                    await this.userService.deletePremiumUser(email)
                    return this.response.error(res, 400, "Error occured during while adding a user to premium account")
                }) 
        } catch (err) {
            return this.response.errorInternal(err, res)
        }
    }
}
