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

const workerService = new WorkerService({
	connectionString	
});

const processImportJob: Task<'import'> = async (payload) => {
	await workerService.processJob(payload);
};

export default processImportJob;
