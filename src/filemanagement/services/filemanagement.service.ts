/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import * as accents from "remove-accents";

// const AWS_S3_DEFAULT_URL = process.env.AWS_S3_DEFAULT_URL;
// const AWS_S3_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;
const s3 = new AWS.S3();
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

@Injectable()
export class FileManagementService {

    MAX_FILE_UPLOAD = 10;

    constructor() { }

    async singleFileUpload(file: any, destinationPath: string) {

        const normalizedFileName = accents.remove(file.originalname).replace(/[ ]/g, '_');

        const params = {
            Body: file.buffer,
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: `${destinationPath}/${Date.now().toString()}_${normalizedFileName}`,
            ACL: 'public-read'
        };
        return new Promise((resolve, reject) => {
            s3.upload(params, function (err, data) {
                if (err) {
                    console.log(err, err.stack); // an error occurred
                    resolve(false);
                }
                else {
                    if (data.Location) {
                        data.Location = data.Location.replace(process.env.AWS_S3_DEFAULT_URL, process.env.AWS_S3_DEFAULT_CDN_URL);
                    }
                    resolve(data);
                }
            });
        });

    }

    async byteFileUpload(file: any, destinationPath: string, filename: string) {

        const params = {
            Body: file,
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: `${destinationPath}/${Date.now().toString()}_${filename}`,
            ACL: 'public-read'
        };
        return new Promise((resolve, reject) => {
            s3.upload(params, function (err, data) {
                if (err) {
                    console.log(err, err.stack); // an error occurred
                    resolve(false);
                }
                else {
                    if (data.Location) {
                        data.Location = data.Location.replace(process.env.AWS_S3_DEFAULT_URL, process.env.AWS_S3_DEFAULT_CDN_URL);
                    }
                    resolve(data);
                }
            });
        });

    }

    async deleteFile(filePath: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            const defaultUrl = process.env.AWS_S3_DEFAULT_CDN_URL;
            s3.deleteObject({
                Bucket: process.env.AWS_S3_BUCKET_NAME,
                Key: filePath.replace(defaultUrl, '')
            }, function (err, data) {
                if (err) {
                    console.log(err);
                    resolve(false);
                }
                resolve(true);
            })
        });
    }

    async moveFileFromTempPath(originalFilePath: string, newFilePath: string,
        deleteOrigial = true): Promise<boolean> {

        const defaultUrl = process.env.AWS_S3_DEFAULT_CDN_URL;
        originalFilePath = originalFilePath.replace(defaultUrl, '');
        newFilePath = newFilePath.replace(defaultUrl, '');

        return new Promise((resolve, reject) => {

            const deleteFunction = this.deleteFile;

            s3.copyObject({
                Bucket: process.env.AWS_S3_BUCKET_NAME,
                CopySource: `${process.env.AWS_S3_BUCKET_NAME}/${originalFilePath.replace(process.env.AWS_S3_DEFAULT_CDN_URL, process.env.AWS_S3_DEFAULT_URL)}`,  // old file path prefixed with bucket [!important]
                Key: newFilePath.replace(process.env.AWS_S3_DEFAULT_CDN_URL, process.env.AWS_S3_DEFAULT_URL), // new file path
                ACL: 'public-read'
            }, function (err, data) {
                if (err) {
                    console.log(err, err.stack); // an error occurred
                }
                else {
                    if (deleteOrigial) {
                        resolve(deleteFunction(originalFilePath));
                    } else {
                        resolve(!!data);
                    }
                }
            });

        });

    }

}
