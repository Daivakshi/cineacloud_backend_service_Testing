import { IsString, IsEmail, IsNotEmpty, IsBoolean } from "class-validator";

export class CreateUsertDto {
    @IsString()
    firstName: string;

    @IsString()
    lastName: string;

    @IsEmail()
    @IsString()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsString()
    @IsNotEmpty()
    password2: string;

    @IsBoolean()
    isFestivalManager: boolean;
}