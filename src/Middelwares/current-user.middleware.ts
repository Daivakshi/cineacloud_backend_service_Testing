import { Injectable, NestMiddleware, UnauthorizedException } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { AuthService } from "../../src/users/auth.service";
import { ErrorHandler } from "../../src/utils/error.handler";
import * as jwt from 'jsonwebtoken';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User, UsersDocument } from "../../src/users/model/users.schema"
import { InviteSignersDocs, ContractSigners } from "../../src/contract/models/contract-signer.schema"

declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

class TokenPayload {
    email: string 
    _id: string 
    name: string 
    lastLoggedIn: number 
    createdBy: string 
    contractId: string
}

// declare module "jsonwebtoken" {
//     export function verify(
//         token: string,
//         secretOrPublicKey: string | Buffer,
//         options?: VerifyOptions
//     ): { email: string, _id: string, name: string, lastLoggedIn: number, createdBy: string, contractId: string };
// }

@Injectable()
export class CurrentUserMiddleware implements NestMiddleware {
    constructor(
        private auth: AuthService, 
        private error: ErrorHandler,
        @InjectModel(User.name) private userModel: Model<UsersDocument>,
        @InjectModel(ContractSigners.name) private signersModel: Model<InviteSignersDocs>
    ) { }

    async use(req: Request, res: Response, next: NextFunction) {

        const headers = req.headers || {};

        let token = headers.authorization;

        try {
            const decoded = await jwt.verify(token, process.env.JWT_SECRET) as TokenPayload;

            let userData = await this.userModel.findOne({
                _id: decoded._id,
                email: decoded.email,
                lastLoggedIn: decoded.lastLoggedIn
            }).lean();

            if (userData) {
                delete userData.password;
                delete userData.verificationtoken;
                
                req.user = userData;
                next();

            } else {
                userData = await this.signersModel.findOne({
                    _id: decoded._id,
                    email: decoded.email,
                    name: decoded.name,
                    createdBy: decoded.createdBy,
                    contractId: decoded.contractId
                }).select('-token').lean();

                if(userData == null) {
                   throw new UnauthorizedException("Session Expired. Please Log in again");
                };
                
                req.user = userData;
                next();

            }

        } catch (error) {
            return this.error.commonHandler(error)
        }
    }
}


// if (headers.hasOwnProperty('authorization')) {
//     let token = headers.authorization;

//     const headersRequest = {
//         'Content-Type': 'application/json',
//         'Authorization': token,
//     };

//     try {
//         const decoded = await jwt.verify(token, process.env.JWT_SECRET);

//         let response = await this.auth.getUserDetails(headersRequest);
//         req.user = response.data.data;
//     } catch (error) {
//         this.error.commonHandler(error)
//     }

// } else if (headers.hasOwnProperty('cookie')) {

//     const headersRequest = {
//         'Content-Type': 'application/json',
//         'Cookie': headers.cookie,
//     };

//     try {
//         let response = await this.auth.checkSessionPromise(headersRequest);
//         req.user = response.data.data;
//     } catch (error) {
//         this.error.commonHandler(error)
//     }
// }

// next();