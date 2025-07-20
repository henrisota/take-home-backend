import { customAlphabet } from "nanoid";
import { JobRepository } from "./job-repository";
import { Job, Payload, Result } from "./types";

export class Service {
    private idGenerator: ReturnType<typeof customAlphabet>;

    constructor(private readonly jobRepository: JobRepository) {
        this.idGenerator = customAlphabet('1234567890abcdef', 10);
    }

    async import(source: string, payload: Payload): Promise<Result> {
        const id = this.idGenerator();

        const job = {
            id: `import-${id}`,
            source,
            payload
        } satisfies Job;

        const savedJob = await this.jobRepository.save(job);

        return {
            id: job.id
        };
    }
}
