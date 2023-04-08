import { Expose } from "class-transformer";

export class UserDto {
    @Expose()
    _id: string;

    @Expose()
    email: string;

    @Expose()
    firstName: string;

    @Expose()
    lastName: string;

    @Expose()
    loginAttempts: number;

    @Expose()
    isVerified: boolean;

    @Expose()
    role: string;

    @Expose()
    isCouponApplied: boolean

    @Expose()
    isFestivalManager: boolean

    @Expose()
    date: string

    @Expose()
    lastLoggedIn: string
}