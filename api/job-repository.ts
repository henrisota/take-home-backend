import crypto from 'crypto';
import tus from 'tus-js-client';
import { Job, Payload } from "./types";
import { SupabaseClient } from '@supabase/supabase-js';

export interface JobRepositoryConfiguration {
    url: string;
    key: string;
    bucket: string;
}

export class JobRepository {
    constructor(
        private readonly supabase: SupabaseClient,
        private readonly configuration: JobRepositoryConfiguration
    ) {}

    async get(id: string): Promise<Job> {
        const { data: _, error: existsError } = await this.supabase.storage.from(this.configuration.bucket).exists(id);
        
        if (existsError) {
            throw new Error(`Failed to check existence of job ${id}: ${String(existsError)}`);
        }
        
        const { data, error } = await this.supabase.storage.from(this.configuration.bucket).download(id);

        if (error) {
            throw new Error(`Failed to get payload of job ${id}: ${String(error)}`);
        }

        const content = await data.text();
        
        return Job.fromPersistence(JSON.parse(content));
    }

    async save(job: Job): Promise<Job> {
        await this.upload(job);
        return job;
    }

    private async upload(job: Job): Promise<boolean> {
        const { id } = job;

        const buffer = Buffer.from(JSON.stringify(job.toPersistence()), 'utf-8');

        return new Promise<boolean>((resolve, reject) => {
            const upload = new tus.Upload(buffer, {
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
                    objectName: id,
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
                    console.debug(`Upload complete for ${id}`);
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
