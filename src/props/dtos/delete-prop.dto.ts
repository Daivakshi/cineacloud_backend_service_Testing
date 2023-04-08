import { Transform, Type } from "class-transformer";
import { IsString, IsNotEmpty, IsMongoId, IsObject, ValidateNested, IsDateString, IsOptional, IsArray } from "class-validator";
import * as moment from "moment";
import { Props } from "../models/props.schema"

export class DeletePropDto {

    @IsOptional()
    @IsArray()
    @IsNotEmpty()
    @IsMongoId({ each: true})
    deleteIds: Props[]

};