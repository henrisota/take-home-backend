import { WorkerPayload } from "@/api/types";
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

const processImportJob: Task<'import'> = async (payload, { logger }) => {
	const { id, source } = payload;

	logger.info(`Starting import job ${id} from source ${source}`);
};

export default processImportJob;
