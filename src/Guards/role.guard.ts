import {
    CanActivate,
    ExecutionContext
} from '@nestjs/common';

export class RoleGuard implements CanActivate {
    canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();
        let user = request.user;

        return request.hasOwnProperty('user') && ( !user.isFestivalManager || user.role == 'admin' );
    }

}