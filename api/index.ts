import { serve } from "@hono/node-server";
import { createClient } from "@supabase/supabase-js";
import { zValidator } from '@hono/zod-validator';
import { Hono } from "hono";
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';

import { JobRepository } from "./job-repository";
import { Service } from "./service";
import { ErrorResponse, ImportRequest, ImportRequestSchema,  ImportResponse } from "./types";
import { WorkerService } from "./worker-service";

const app = new Hono();
app.use(logger(), prettyJSON());

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

const workerService = new WorkerService({
	connectionString
});
const service = new Service(jobRepository, workerService);

app.post(
	"/import",
	zValidator('json', ImportRequestSchema, (result, c) => {
		if (!result.success) {
			return c.json({
				message: 'Invalid request body',
				error: result.error
			} satisfies ErrorResponse);
		}
	}),
	async (c) => {
		const request = await c.req.json<ImportRequest>();

		const result = await service.import(request.source, request.data);

		return c.json({
			jobId: result.id 
		} satisfies ImportResponse, 201);
	}
);

app.get("/health", async (c) => {
	return c.text("OK", 200);
});

const port = parseInt(process.env.PORT || "3000");

console.log(`Server is running on port ${port}`);

serve({
	fetch: app.fetch,
	port,
});

export default app;
