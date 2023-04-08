import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Pusher from 'pusher';

@Injectable()
export class PusherService {
    public pusherInstance: any;
    constructor(
        private config: ConfigService
    ) {
        this.initPusher();
    };

    initPusher() {
        if(!this.pusherInstance) {
            this.pusherInstance = new Pusher({
                appId: this.config.get('PUSHER_APP_ID'),
                key: this.config.get('PUSHER_APP_KEY'),
                secret: this.config.get('PUSHER_APP_SECRET'),
                cluster: this.config.get('PUSHER_APP_CLUSTER')
            });
        };

        return this.pusherInstance;
    };

    async onScreenComment(channels, data) {
        this.pusherInstance.trigger(channels, "on-screen-comment", data);
    };

    async sendComment(channels, data) {
        this.pusherInstance.trigger(channels, "comment-rl", data);
    };

    async sendNotification(channels, data) {
        this.pusherInstance.trigger(channels, 'my-notification', data);
    };

    async authenticate(socketId, channels, data) {
        try {
            const resultData = await this.pusherInstance.authenticate(socketId, channels, data);
            return resultData;
        } catch (err) {
            return err;
        }
    };

}