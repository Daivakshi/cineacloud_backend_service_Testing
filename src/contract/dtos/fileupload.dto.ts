import { IsString, IsNotEmpty, IsMongoId, IsOptional } from "class-validator";

import { Types } from "mongoose";

export class InsertFileDto {
    @IsString()
    @IsNotEmpty()
    @IsMongoId()
    userId: Types.ObjectId;

    @IsString()
    @IsNotEmpty()
    fileId: string;

    @IsString()
    @IsNotEmpty()
    key: string;

    @IsString()
    @IsNotEmpty()
    mimeType: string;

    @IsString()
    @IsNotEmpty()
    fileName: string;

    @IsString()
    @IsOptional()
    url?: string
}
