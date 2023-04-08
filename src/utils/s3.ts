import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { ConfigService } from '@nestjs/config';
import { Types } from "mongoose";
@Injectable()
export class S3FileUpload {
    constructor(private config: ConfigService) { }

    randomString(len) {
        const charSet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let randomString = "";
        for (let i = 0; i < len; i++) {
            const randomPoz = Math.floor(Math.random() * charSet.length);
            randomString += charSet.substring(randomPoz, randomPoz + 1);
        }
        return randomString;
    };

    getUrl = (key) => {
        return `https://${this.config.get('AWS_S3_BUCKET')}.s3.amazonaws.com/${key}`;
    };

    getObjects = async (key) => {
        const s3 = new S3();
        let params: any = {
            Bucket: process.env.AWS_S3_BUCKET,
            Prefix: `${key}/`
        };

        const listOfObjects: any = await s3.listObjectsV2(params).promise().catch(e => console.log(e));

        if (listOfObjects?.IsTruncated) {
            params.ContinuationToken = listOfObjects.NextContinuationToken;
            this.getObjects(key);
        };

        return listOfObjects;
    }

    async uploadFileToS3(file) {
        let rs = this.randomString(12)
        const params = {
            Bucket: this.config.get('AWS_S3_BUCKET'),
            Key: rs,
            Body: file.buffer,
            ACL: "private",
            ContentType: file.mimetype,
        };

        const s3 = new S3();
        return new Promise((resolve, reject) =>
            s3.putObject(params, async (err, res) => {
                if (err) {
                    return reject(err);
                };

                return resolve({
                    key: rs,
                    fileName: file.originalname,
                    mimeType: file.mimetype,
                    // url: await this.s3GetSignedURL(rs),
                });
            })
        );
    }

    async uploadFileToS3WithUserId(file, userId) {
        let rs = this.randomString(12)
        const params = {
            Bucket: this.config.get('AWS_S3_BUCKET'),
            Key: `${userId}/` + rs + '_' + file.originalname.replace(/ /g, '').replace(/[()]/g, ''),
            Body: file.buffer,
            ACL: "private",
            ContentType: file.mimetype,
        };

        const s3 = new S3();
        return new Promise((resolve, reject) =>
            s3.putObject(params, async (err, res) => {
                if (err) {
                    return reject(err);
                };

                return resolve({
                    fileName: file.originalname.replace(/ /g, '').replace(/[()]/g, ''),
                    mimeType: file.mimetype,
                    key: `${userId}/` + rs + '_' + file.originalname.replace(/ /g, '').replace(/[()]/g, ''),
                    userId: Types.ObjectId(userId),
                    fileId: this.randomString(16),
                    url: await this.s3GetSignedURL(`${userId}/` + rs + '_' + file.originalname.replace(/ /g, '').replace(/[()]/g, '')),
                });
            })
        );
    }

    async uploadMultipleFilesToS3(files, userId) {
        try {
            let uploadedFiles = [];
            const s3 = new S3();
            return new Promise(async (resolve, reject) => {
                for (let [i, file] of files.entries()) {
                    const params = {
                        Bucket: this.config.get('AWS_S3_BUCKET'),
                        Key: `${userId}/` + file.originalname.replace(/ /g, ''),
                        Body: file.buffer,
                        ACL: "private",
                        ContentType: file.mimetype,
                    };

                    let uploadDone = await s3.putObject(params).promise();

                    if (uploadDone) {
                        uploadedFiles.push({
                            fileName: file.originalname,
                            mimeType: file.mimetype,
                            key: `${userId}/` + file.originalname.replace(/ /g, ''),
                            userId: Types.ObjectId(userId),
                            fileId: this.randomString(16),
                            url: await this.s3GetSignedURL(`${userId}/` + file.originalname.replace(/ /g, ''))
                        });
                    }

                    if (files.length == uploadedFiles.length) {
                        return resolve(uploadedFiles)
                    }
                }
            });
        } catch (e) {
            return e;
        }
    };

    getUniqueFilename() {
        const timestamp = new Date().getTime();
        const randomInteger = Math.floor(Math.random() * 1000000 + 1);
        return timestamp + "_" + randomInteger + ".png";
    }

    async uploadBufferImgae(base64EncodedImage: string, userId) {
        const buffer = Buffer.from(base64EncodedImage.replace(/^data:image\/\w+;base64,/, ""), "base64");
        const fileKey = `${userId}/` + this.getUniqueFilename();

        const params = {
            Bucket: this.config.get('AWS_S3_BUCKET'),
            Key: fileKey,
            Body: buffer,
            ACL: "private",
            ContentType: "image/png",
            ContentEncoding: "base64",
        };

        const s3 = new S3();
        return new Promise((resolve, reject) =>
            s3.putObject(params, async (err, res) => {
                if (err) {
                    return reject(err);
                };

                return resolve({
                    key: fileKey
                });
            })
        );
    }

    async s3GetSignedURL(key) {
        try {
            const s3 = new S3();
            const signedURL = await s3.getSignedUrl("getObject", {
                Bucket: `${this.config.get('AWS_S3_BUCKET')}`,
                Key: key,
                Expires: 14400,
            });
            return signedURL;
        } catch (e) {
            return e;
        }
    }

    /**
     * delete S3 file
     * @param  {String/Array}   key filename
     * @param  {Function} cb
     * @return {Promise}
     */
    async deleteFile(key) {
        try {
            const s3 = new S3();
            const keys = !Array.isArray(key) ? [key] : key;

            const params = {
                Bucket: this.config.get('AWS_S3_BUCKET'),
                Delete: {
                    Objects: keys.map((k) => ({ Key: k })),
                },
            };

            return new Promise((resolve, reject) => {
                s3.deleteObjects(params, (err, data) => {
                    if (err) {
                        return reject(err);
                    }
                    return resolve(data);
                });
            });
        } catch (e) {
            throw e;
        }
    }
}