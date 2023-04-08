import { Types } from "mongoose"
import { IsString, IsNotEmpty, IsOptional, IsMongoId, IsBoolean } from "class-validator";

export class EnableSingleUserDto {

    @IsBoolean()
    @IsNotEmpty({ message: 'Enable single user is required' })
    enableSingleUser: boolean;

    @IsMongoId()
    @IsNotEmpty()
    contractId?: Types.ObjectId

};