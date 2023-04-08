import {
    CanActivate,
    ExecutionContext
} from '@nestjs/common';

export class AuthGuard implements CanActivate {
    canActivate(context: ExecutionContext) {

        const request = context.switchToHttp().getRequest();
        let headers = request.headers;

        return headers.hasOwnProperty('authorization') || headers.hasOwnProperty('x-access-token') || headers.hasOwnProperty('cookie');
    }

}