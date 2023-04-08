import { IsString, IsNotEmpty, IsOptional, IsMongoId, IsNumber, IsArray, IsDefined, ValidateNested, ArrayNotEmpty, IsObject, IsNotEmptyObject } from "class-validator";
import { Type } from 'class-transformer';

class MetaData {
    @IsString()
    @IsNotEmpty()
    preview: string

    @IsArray()
    @IsNotEmpty()
    value: []
}

export class CreateElementDto {
    @IsNumber()
    @IsNotEmpty()
    left: number

    @IsNumber()
    @IsNotEmpty()
    top: number

    @IsNumber()
    @IsNotEmpty()
    width: number

    @IsNumber()
    @IsNotEmpty()
    height: number

    @IsString()
    @IsNotEmpty()
    originX: string

    @IsString()
    @IsNotEmpty()
    originY: string

    @IsNumber()
    @IsNotEmpty()
    scaleX: number

    @IsNumber()
    @IsNotEmpty()
    scaleY: number

    @IsString()
    @IsNotEmpty()
    type: string

    @IsObject()
    @IsDefined()
    @IsNotEmptyObject()
    @ValidateNested()
    @Type(()=> MetaData)
    metadata: MetaData
}