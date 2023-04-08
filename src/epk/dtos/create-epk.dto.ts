import { IsMongoId, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Types } from "mongoose";

export class CreateEpkDto {
    @IsString({ message: "Epk is mandatory" })
    epkName: string;

    @IsString({ message: "Width is mandatory" })
    width: string;

    @IsString({ message: "Height is mandatory" })
    height: string;

    userId?: Types.ObjectId

    @IsString()
    @IsNotEmpty({ message: 'userId is required' })
    @IsMongoId()
    projectId: Types.ObjectId

    @IsOptional()
    @IsMongoId()
    @IsString()
    epkId?: Types.ObjectId;
}