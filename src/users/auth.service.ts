import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { HttpService } from '@nestjs/axios';

@Injectable()
export class AuthService {
    constructor(private configSer: ConfigService, private http: HttpService) { }

    async getUserDetails(headers) {
        return await this.http
            .get(`${this.configSer.get<string>('NODE_URL_1')}/users/festival`, { headers })
            .toPromise();
    }

    async checkSessionPromise(headers) {
        return await this.http
            .get(`${this.configSer.get<string>('NODE_URL_1')}/users/session-check`, { headers })
            .toPromise();
    };
}