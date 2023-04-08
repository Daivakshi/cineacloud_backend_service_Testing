import { Types } from "mongoose"
import { IsString, IsNotEmpty, IsOptional } from "class-validator";

export class MediaUploadDto {
    @IsString()
    @IsNotEmpty({ message: 'type is required' })
    type: string;

    @IsOptional()
    userId?: Types.ObjectId
};