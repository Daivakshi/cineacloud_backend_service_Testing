import { IsEmail, IsString, IsOptional, IsNotEmpty } from "class-validator";

export class SignInUserDto {
    @IsEmail()
    @IsNotEmpty({ message: "Please provide email" })
    email: string;

    @IsString()
    @IsNotEmpty({ message: "Please provide password" })
    password: string;
}