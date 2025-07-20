import { JobRepository } from "@/api/job-repository";
import { WorkerPayload } from "@/api/types";
import { WorkerService } from "@/api/worker-service";
import { createClient } from "@supabase/supabase-js";
import type { Task } from "graphile-worker";

declare global {
	namespace GraphileWorker {
		interface Tasks {
			import: WorkerPayload;
		}
	}
}

const supabase = createClient(
	process.env.SUPABASE_URL!,
	process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const connectionString = process.env.DATABASE_URL!;

const jobRepository = new JobRepository({
	url: process.env.SUPABASE_URL!,
	key: process.env.SUPABASE_SERVICE_ROLE_KEY!,
	bucket: process.env.JOB_BUCKET ?? 'imports',
});
const workerService = new WorkerService(
	jobRepository,
	{
		connectionString	
	}
);

const processImportJob: Task<'import'> = async (payload) => {
	await workerService.processJob(payload);
};

export default processImportJob;
