import { Types } from 'mongoose'
import { Transform, Type } from "class-transformer";
import { IsString, IsNotEmpty, IsMongoId, IsObject, ValidateNested, IsDateString, IsOptional, IsArray, IsBoolean, IsNumber } from "class-validator";
import * as moment from "moment";

export class AddSignersDto {

    @IsString()
    @IsNotEmpty({ message: 'ContractId is required' })
    @IsMongoId()
    contractId: string;

    @IsString()
    @IsNotEmpty({ message: 'Name is required' })
    name: string;

    @IsString()
    @IsNotEmpty({ message: 'Email is required' })
    email: string;

    @IsString()
    @IsNotEmpty({ message: 'Action is required' })
    action: string;

    @IsString()
    @IsNotEmpty({ message: 'userId is required' })
    @IsMongoId()
    createdBy: Types.ObjectId;

    @IsBoolean()
    @IsOptional()
    emailsent?: boolean

    @IsObject()
    @IsOptional()
    emailData?: object

    @IsString()
    @IsOptional()
    token?: string

    @IsNumber()
    @IsOptional()
    documentStatus?: number

};