import { Types } from "mongoose"
import { Type } from "class-transformer";
import { IsString, IsNotEmpty, IsObject, ValidateNested, IsNotEmptyObject, IsOptional, IsMongoId, IsArray, ArrayNotEmpty, IsBoolean, IsNumber } from "class-validator";
import { Prop } from "@nestjs/mongoose";

class Bbox {
    @IsNotEmpty()
    @IsNumber()
    aspectRatio: string

    @IsNotEmpty()
    @IsNumber()
    height: number

    @IsNotEmpty()
    @IsBoolean()
    initial: boolean

    @IsNotEmpty()
    @IsNumber()
    left: number

    @IsNotEmpty()
    @IsNumber()
    page: number

    @IsNotEmpty()
    @IsNumber()
    top: number

    @IsNotEmpty()
    @IsNumber()
    width: number
    
    @IsNotEmpty()
    @IsNumber()
    widthPct: number

    @IsNotEmpty()
    @IsNumber()
    x: number

    @IsNotEmpty()
    @IsNumber()
    y: number
}

class FormDataObj {
    @IsMongoId()
    @IsNotEmpty()
    signatoryId: Types.ObjectId

    @IsNotEmpty()
    @IsString()
    type: string

    @IsNotEmptyObject()
    @IsObject({ message: 'Bbox is required' })
    @ValidateNested()
    @Type(() => Bbox)
    bbox: Bbox

    @IsBoolean()
    @IsNotEmpty()
    hideSourceOnDrag: boolean

    @IsOptional()
    @IsString()
    placeholder?: string

    @IsOptional()
    @IsString()
    textData?: string

    @IsOptional()
    @IsString()
    signatureText?: string

    @IsOptional()
    @IsObject()
    fontData?: object

    @IsOptional()
    @IsString()
    imageData?: string

    @IsNotEmpty()
    @IsString()
    id: string
}

export class CreateFormDto {

    @IsArray()
    @ArrayNotEmpty()
    @ValidateNested({ each: true })
    @Type(()=> FormDataObj)
    formData: FormDataObj

    @IsMongoId()
    @IsNotEmpty()
    contractId: Types.ObjectId

    @IsOptional()
    userId?: Types.ObjectId

    @IsOptional()
    _id?: Types.ObjectId

};