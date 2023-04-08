import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from "@nestjs/common"

@Injectable()
export class ErrorHandler {

    commonHandler(err) {
        if (err.response) {
            if(err.response.statusCode == 401) {
                throw new UnauthorizedException(err.response.message)
            } else {
                throw new BadRequestException(err.response.message)
            }
        } else if (err.request) {
            throw new BadRequestException()
        } else {
            if(err.message == 'jwt expired') {
                throw new UnauthorizedException('Token expired')
            } else {
                throw new InternalServerErrorException(err)
            } 
        }
    };

}