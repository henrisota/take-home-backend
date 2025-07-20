import crypto from 'crypto';
import tus from 'tus-js-client';
import { Job, Payload } from "./types";

export interface JobRepositoryConfiguration {
    url: string;
    key: string;
    bucket: string;
}

export class JobRepository {
    constructor(
        private readonly configuration: JobRepositoryConfiguration
    ) {}

    async save(job: Job): Promise<Job> {
        await this.upload(job);
        return job;
    }

    private hashSource(source: string): string {
        const hash = crypto.createHash('sha256');
        hash.update(source);
        return hash.digest('hex');
    }

    private hashPayload(payload: Payload): string {
        const hash = crypto.createHash('sha256');
        hash.update(JSON.stringify(payload));
        return hash.digest('hex')
    }

    private async upload(job: Job): Promise<boolean> {
        const { source, payload } = job;

        const name = [this.hashSource(source), this.hashPayload(payload)].join('/');
        const buffer = Buffer.from(JSON.stringify(payload), 'utf-8');

        return new Promise<boolean>((resolve, reject) => {
            var upload = new tus.Upload(buffer, {
                endpoint: `${this.configuration.url}/storage/v1/upload/resumable`,
                retryDelays: [0, 3000, 5000, 10000, 20000],
                headers: {
                    authorization: `Bearer ${this.configuration.key}`,
                    'x-upsert': 'true',
                },
                uploadDataDuringCreation: true,
                removeFingerprintOnSuccess: true,
                metadata: {
                    bucketName: this.configuration.bucket,
                    objectName: name,
                    contentType: 'application/json'
                },
                chunkSize: 6 * 1024 * 1024,
                onError: function (error) {
                    console.debug(`Upload failed: ${String(error)}`);
                    reject(error);
                },
                onProgress: function (bytesUploaded, bytesTotal) {
                    var percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
                    console.debug('Uploading', {
                        bytesUploaded,
                        bytesTotal,
                        percentage: percentage + '%'
                    });
                },
                onSuccess: function () {
                    console.debug(`Uploaded ${name} to ${upload.url}`);
                    resolve(true);
                },
            })

            return upload.findPreviousUploads().then(function (previousUploads) {
                if (previousUploads.length) {
                    upload.resumeFromPreviousUpload(previousUploads[0]);
                }

                upload.start();
            })
        })
    }
}
