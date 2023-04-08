import { Types } from "mongoose"
import { IsString, IsNotEmpty, IsOptional, IsMongoId, IsBoolean } from "class-validator";

export class CreateCommentDto {

    @IsString()
    @IsNotEmpty()
    appId: Types.ObjectId

    @IsString()
    @IsMongoId()
    screenId: Types.ObjectId

    @IsString()
    @IsNotEmpty({ message: 'comment is mandatory' })
    comment: string

    @IsString()
    @IsNotEmpty({ message: 'type is mandatory' })
    type: string

    @IsOptional()
    @IsString()
    userId?: Types.ObjectId

};