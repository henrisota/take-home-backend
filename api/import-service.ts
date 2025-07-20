import { customAlphabet } from "nanoid";
import { JobRepository } from "./job-repository";
import { Job, Payload, Result } from "./types";
import { ImportWorkerService } from "./import-worker-service";

export class ImportService {
    private idGenerator: ReturnType<typeof customAlphabet>;

    constructor(
        private readonly jobRepository: JobRepository,
        private readonly importWorkerService: ImportWorkerService
    ) {
        this.idGenerator = customAlphabet('1234567890abcdef', 10);
    }

    async import(source: string, payload: Payload): Promise<Result> {
        const id = this.idGenerator();

        const job = new Job(
            `import-${id}`,
            source,
            payload
        );

        const savedJob = await this.jobRepository.save(job);

        await this.importWorkerService.addJob({
            id: savedJob.id,
            source
        });

        return {
            id: job.id
        };
    }
}
