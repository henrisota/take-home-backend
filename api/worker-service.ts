import { makeWorkerUtils, WorkerUtils } from "graphile-worker";
import { WorkerPayload } from "./types";

export interface WorkerServiceConfiguration {
    connectionString: string;
}

export class WorkerService {
    private worker: WorkerUtils | undefined;

    constructor(private readonly configuration: WorkerServiceConfiguration) {}

    async addJob(payload: WorkerPayload) {
        const worker = await this.initializeWorker();
        const { id } = payload;

        console.info(`Queueing job ${id}`)
        
        await worker.addJob('import', payload);

        console.info(`Queued job ${id}`);
    }

    private async initializeWorker(): Promise<WorkerUtils> {
        if (!this.worker) {
            this.worker = await makeWorkerUtils({
                connectionString: this.configuration.connectionString
            });
        }

        return this.worker;
    }
}
