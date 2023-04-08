import { Types } from "mongoose"
import { IsString, IsNotEmpty, IsOptional, IsMongoId, IsBoolean, IsNumber } from "class-validator";

export class AddEmailNotificationDto {

    @IsString()
    @IsMongoId()
    @IsNotEmpty()
    contractId: Types.ObjectId

    @IsString()
    @IsNotEmpty({ message: 'Email subject is mandatory' })
    emailSub: string

    @IsOptional()
    @IsString()
    emailMsg: string

    @IsNumber()
    @IsNotEmpty({ message: 'Expiry is mandatory' })
    expiry: number

};