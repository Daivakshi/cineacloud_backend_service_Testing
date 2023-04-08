import { IsString, IsNotEmpty, IsMongoId, IsOptional, IsBoolean, IsNumber } from "class-validator";
import { Types } from "mongoose";

export class CreateContractDto {
    @IsString()
    @IsNotEmpty()
    @IsMongoId()
    userId: Types.ObjectId;

    @IsString()
    @IsOptional()
    name?: string

    @IsOptional()
    @IsString()
    projectId?: Types.ObjectId;

    @IsNumber()
    @IsOptional()
    documentStatus?: number

    @IsBoolean()
    @IsOptional()
    isSingleSigner?: boolean
}
