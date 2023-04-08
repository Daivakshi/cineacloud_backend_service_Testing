import { Transform, Type } from "class-transformer";
import { IsString, IsNotEmpty, IsMongoId, IsObject, ValidateNested, IsDateString, IsOptional, IsArray, IsNumber } from "class-validator";
import * as moment from "moment";

export class RemoveSignersDto {

    @IsString()
    @IsNotEmpty({ message: 'ContractId is required' })
    @IsMongoId()
    contractId: string;

    @IsString()
    @IsNotEmpty({ message: 'Email is required' })
    email: string;

    @IsString()
    @IsNotEmpty({ message: 'userId is required' })
    @IsMongoId()
    createdBy: string;

    @IsNumber()
    status: number;
};