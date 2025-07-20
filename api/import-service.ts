import { customAlphabet } from "nanoid";
import type { ImportWorkerService } from "./import-worker-service";
import type { JobRepository } from "./job-repository";
import { type ImportPayload, type ImportResult, Job } from "./types";

export class ImportService {
	private idGenerator: ReturnType<typeof customAlphabet>;

	constructor(
		private readonly jobRepository: JobRepository,
		private readonly importWorkerService: ImportWorkerService,
	) {
		this.idGenerator = customAlphabet("1234567890abcdef", 10);
	}

	async import(source: string, payload: ImportPayload): Promise<ImportResult> {
		const id = this.idGenerator();

		const job = new Job(`import-${id}`, source, payload);

		const savedJob = await this.jobRepository.save(job);

		await this.importWorkerService.addJob({
			id: savedJob.id,
			source,
		});

		return {
			id: job.id,
		};
	}
}
