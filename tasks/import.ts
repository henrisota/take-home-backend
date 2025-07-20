import { JobRepository } from "@/api/job-repository";
import { WorkerPayload } from "@/api/types";
import { ImportWorkerService } from "@/api/import-worker-service";
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

const jobRepository = new JobRepository(
	supabase,
	{
		url: process.env.SUPABASE_URL!,
		key: process.env.SUPABASE_SERVICE_ROLE_KEY!,
		bucket: process.env.JOB_BUCKET ?? 'imports',
	}
);
const importWorkerService = new ImportWorkerService(
	jobRepository,
	{
		connectionString	
	}
);

const processImportJob: Task<'import'> = async (payload) => {
	await importWorkerService.processJob(payload);
};

export default processImportJob;
