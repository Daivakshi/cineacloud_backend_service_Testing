import { IsString, IsEmail, IsNotEmpty, IsBoolean } from "class-validator";
import { Types } from "mongoose";

export class CreateProjectDto {
    @IsString()
    projName: string;

    createdBy?: Types.ObjectId

    status?: number
}