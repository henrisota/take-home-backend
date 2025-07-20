import { makeWorkerUtils, type WorkerUtils } from "graphile-worker";
import type { ContactRepository } from "./contact-repository";
import { ImportWorkerService } from "./import-worker-service";
import type { JobRepository } from "./job-repository";
import { Job, type ProcessedContact, type WorkerPayload } from "./types";

jest.mock("graphile-worker");

describe("ImportWorkerService", () => {
	let contactRepositoryMock: jest.Mocked<ContactRepository>;
	let jobRepositoryMock: jest.Mocked<JobRepository>;
	let workerUtilsMock: jest.Mocked<WorkerUtils>;
	let importWorkerService: ImportWorkerService;

	const workerPayload = {
		id: "id",
		source: "source",
	} satisfies WorkerPayload;

	const configuration = {
		connectionString: "postgres://user:pass@localhost:5432/mydb",
	};

	beforeAll(() => {
		workerUtilsMock = {
			addJob: jest.fn(),
		} as unknown as jest.Mocked<WorkerUtils>;

		(makeWorkerUtils as jest.Mock).mockResolvedValue(workerUtilsMock);
	});

	beforeEach(() => {
		contactRepositoryMock = {
			batchSave: jest.fn(),
		} as unknown as jest.Mocked<ContactRepository>;
		jobRepositoryMock = {
			get: jest.fn(),
		} as unknown as jest.Mocked<JobRepository>;

		importWorkerService = new ImportWorkerService(
			contactRepositoryMock,
			jobRepositoryMock,
			configuration,
		);
	});

	describe("addJob", () => {
		it("should queue a job", async () => {
			await importWorkerService.addJob(workerPayload);

			expect(workerUtilsMock.addJob).toHaveBeenCalledWith(
				"import",
				workerPayload,
			);
		});
	});

	describe("processJob", () => {
		it("should process a job and save unique contacts", async () => {
			const contacts = [
				{
					name: "Alice Johnson",
					email: "alice@example.com",
				},
			];
			const job = new Job(workerPayload.id, workerPayload.source, contacts);

			jobRepositoryMock.get.mockResolvedValue(job);
			contactRepositoryMock.batchSave.mockResolvedValue(
				job.payload.map((_) => ({}) as unknown as ProcessedContact),
			);

			await importWorkerService.processJob(workerPayload);

			expect(jobRepositoryMock.get).toHaveBeenCalledWith(job.id);
			expect(contactRepositoryMock.batchSave).toHaveBeenCalledWith([
				{
					name: "Alice Johnson",
					email: "alice@example.com",
					source: job.source,
				},
			]);
		});
	});
});
