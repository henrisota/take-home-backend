import { JobRepository } from "./job-repository";
import crypto from 'crypto';
import { Job, Payload, Result } from "./types";

export class Service {
    constructor(private readonly jobRepository: JobRepository) {}

    async import(source: string, payload: Payload): Promise<Result> {
        const job = {
            source,
            payload,
            digest: this.digest(payload)
        } satisfies Job;

        const savedJob = await this.jobRepository.save(job);

        return {
            jobId: 0
        };
    }

    private digest(payload: Payload) {
        const hash = crypto.createHash('sha256');
        hash.update(JSON.stringify(payload));
        return hash.digest('hex')
    }
}
