import { JobRepository } from "./job-repository";
import { Job, Payload, Result } from "./types";

export class Service {
    constructor(private readonly jobRepository: JobRepository) {}

    async import(source: string, payload: Payload): Promise<Result> {
        const job = {
            source,
            payload
        } satisfies Job;

        const savedJob = await this.jobRepository.save(job);

        return {
            jobId: 0
        };
    }
}
