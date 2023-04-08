import { Transform, Type } from "class-transformer";
import { IsString, IsNotEmpty, IsMongoId, IsObject, ValidateNested, IsDateString, IsOptional, IsArray } from "class-validator";
import * as moment from "moment";

class MemberInfo {
    @IsString()
    @IsNotEmpty({ message: 'Name is required' })
    name: string;

    @IsString()
    @IsNotEmpty({ message: 'Email is required' })
    email: string;
}

export class InvitePropMembersDto {

    @IsString()
    @IsNotEmpty({ message: 'PropId is required' })
    @IsMongoId()
    propId: string;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(()=> MemberInfo)
    addMembers: MemberInfo[]

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(()=> MemberInfo)
    removeMembers: MemberInfo[]

};