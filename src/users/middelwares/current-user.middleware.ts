import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { AuthService } from "../auth.service";
import { ErrorHandler } from '../../utils/error.handler'
declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

declare module "jsonwebtoken" {
    export function verify(
        token: string,
        secretOrPublicKey: string | Buffer,
        options?: VerifyOptions
    ): { email: string, _id: string, name: string, lastLoggedIn: number };
}

@Injectable()
export class CurrentUserMiddleware implements NestMiddleware {
    constructor(private auth: AuthService, private error: ErrorHandler) { }

    async use(req: Request, res: Response, next: NextFunction) {

        const headers = req.headers || {};

        if (headers.hasOwnProperty('authorization')) {
            let token = headers.authorization;

            const headersRequest = {
                'Content-Type': 'application/json',
                'Authorization': token,
            };

            try {
                let response = await this.auth.getUserDetails(headersRequest);
                req.user = response.data.data;
            } catch (error) {
                this.error.commonHandler(error)
            }

        } else if (headers.hasOwnProperty('cookie')) {

            const headersRequest = {
                'Content-Type': 'application/json',
                'Cookie': headers.cookie,
            };

            try {
                let response = await this.auth.checkSessionPromise(headersRequest);
                req.user = response.data.data;
            } catch (error) {
                this.error.commonHandler(error)
            }
        }

        next();
    }
}