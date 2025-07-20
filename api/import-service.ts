import { customAlphabet } from "nanoid";
import { Counter, type Registry } from "prom-client";
import type { ImportWorkerService } from "./import-worker-service";
import type { JobRepository } from "./job-repository";
import { type ImportPayload, type ImportResult, Job } from "./types";

export class ImportService {
	private idGenerator: ReturnType<typeof customAlphabet>;
	private jobCreatedCounter: Counter;

	constructor(
		private readonly jobRepository: JobRepository,
		private readonly importWorkerService: ImportWorkerService,
		private readonly metricsRegistry: Registry,
	) {
		this.idGenerator = customAlphabet("1234567890abcdef", 10);

		this.jobCreatedCounter = new Counter({
			name: "import_jobs_created",
			help: "number of import jobs created",
			registers: [metricsRegistry],
		});
	}

	async import(source: string, payload: ImportPayload): Promise<ImportResult> {
		const id = this.idGenerator();

		const job = new Job(`import-${id}`, source, payload);

		const savedJob = await this.jobRepository.save(job);

		await this.importWorkerService.addJob({
			id: savedJob.id,
			source,
		});

		this.jobCreatedCounter.inc();

		return {
			id: job.id,
		};
	}
}
