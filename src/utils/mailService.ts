import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as Mailgun from 'mailgun-js'

@Injectable()
export class Mailer {
    private mg;

    constructor( 
        private config: ConfigService
    ) { 
        this.mg = Mailgun({
            apiKey: this.config.get<string>('MAILGUN_API_KEY'), 
            domain: this.config.get<string>('MAILGUN_DOMAIN'),
            host: this.config.get<string>('MAILGUN_HOST')
        });
    };

    welcomeInvitation(userDoc) {
        let mailOptions = {
            from: this.config.get<string>('ADMIN_EMAIL'),
            to: userDoc.email,
            subject: `cineacloud.com | Test Mail`,
            template: 'testing_template',
            'h:X-Mailgun-Variables': JSON.stringify({
                "userName": userDoc.userName
            })
        };
        this.send(mailOptions, false);
    }

    contractInvitation(userDoc) {
        let mailOptions = {
            from: this.config.get<string>('ADMIN_EMAIL'),
            to: userDoc.email,
            subject: `${userDoc.emailSub} | Contract App Cineacloud`,
            template: 'contract_invitation',
            'h:X-Mailgun-Variables': JSON.stringify({
                "signerName": userDoc.signerName,
                "userName": userDoc.userName,
                "userEmail": userDoc.userEmail,
                "contractName": userDoc.contractName,
                "emailMsg": userDoc.emailMsg,
                "inviteLink": userDoc.inviteLink
            })
        };
        return this.send(mailOptions, false);
    }

    sendInvitationToPremiumUser(userDoc) {
        let mailOptions = {
            from: this.config.get<string>('ADMIN_EMAIL'),
            to: userDoc.email,
            subject: `Welcome to Cineacloud`,
            template: 'premium_user',
            'h:X-Mailgun-Variables': JSON.stringify({
                "email": userDoc.email,
                "link": userDoc.link
            })
        };
        return this.send(mailOptions, false);
    }

    bulkMail() {
        let mailOptions = {
            from: this.config.get<string>('ADMIN_EMAIL'),
            to: "my_testing_list@mg.cineacloud.com",
            subject: `Thank you for choosing CineaCloud`,
            template: 'news_letter'
        };
        return this.send(mailOptions, false);
    }

    async send(mailOptions, withTemplate = true) {
        return await this.mg.messages().send(mailOptions);
    }
};