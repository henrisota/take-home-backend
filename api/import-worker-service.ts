import { makeWorkerUtils, type WorkerUtils } from "graphile-worker";
import type { ContactRepository } from "./contact-repository";
import type { JobRepository } from "./job-repository";
import type { Contact, WorkerPayload } from "./types";

export interface WorkerServiceConfiguration {
	connectionString: string;
}

export class ImportWorkerService {
	private worker: WorkerUtils | undefined;

	constructor(
		private readonly contactRepository: ContactRepository,
		private readonly jobRepository: JobRepository,
		private readonly configuration: WorkerServiceConfiguration,
	) {}

	async addJob(payload: WorkerPayload) {
		const worker = await this.initializeWorker();
		const { id } = payload;

		console.info(`Queueing job ${id}`);

		await worker.addJob("import", payload);

		console.info(`Queued job ${id}`);
	}

	async processJob(payload: WorkerPayload) {
		const { id, source } = payload;

		console.info(`Starting import job ${id} from source ${source}`);

		const importJob = await this.jobRepository.get(id);

		const contacts = importJob.payload.map(
			(entity) =>
				({
					name: entity.name,
					email: entity.email,
					source: importJob.source,
				}) satisfies Contact,
		);

		const uniqueContacts = Array.from(
			new Map(contacts.map((contact) => [contact.email, contact])).values()
		);

		const processedContacts = await this.contactRepository.batchSave(uniqueContacts);

		console.info(
			`Completed import job ${id} by processing ${processedContacts.length} contacts`,
		);
	}

	private async initializeWorker(): Promise<WorkerUtils> {
		if (!this.worker) {
			this.worker = await makeWorkerUtils({
				connectionString: this.configuration.connectionString,
			});
		}

		return this.worker;
	}
}
