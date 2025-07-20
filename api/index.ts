import { serve } from "@hono/node-server";
import { prometheus } from "@hono/prometheus";
import { zValidator } from "@hono/zod-validator";
import { createClient } from "@supabase/supabase-js";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { Registry } from "prom-client";
import { ContactRepository } from "./contact-repository";
import { ImportService } from "./import-service";
import { ImportWorkerService } from "./import-worker-service";
import { JobRepository } from "./job-repository";
import {
	type ErrorResponse,
	type ImportRequest,
	ImportRequestSchema,
	type ImportResponse,
} from "./types";

const app = new Hono();

const registry = new Registry();
const { printMetrics } = prometheus({ registry });

app.use(logger(), prettyJSON());

const supabase = createClient(
	process.env.SUPABASE_URL!,
	process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const connectionString = process.env.DATABASE_URL!;

const contactRepository = new ContactRepository(supabase, {});
const jobRepository = new JobRepository(supabase, {
	url: process.env.SUPABASE_URL!,
	key: process.env.SUPABASE_SERVICE_ROLE_KEY!,
	bucket: process.env.JOB_BUCKET ?? "imports",
});

const importWorkerService = new ImportWorkerService(
	contactRepository,
	jobRepository,
	{
		connectionString,
	},
);
const importService = new ImportService(
	jobRepository,
	importWorkerService,
	registry,
);

app.post(
	"/import",
	zValidator("json", ImportRequestSchema, (result, c) => {
		if (!result.success) {
			return c.json({
				message: "Invalid request body",
				error: result.error,
			} satisfies ErrorResponse);
		}
	}),
	async (c) => {
		const request = await c.req.json<ImportRequest>();

		const result = await importService.import(request.source, request.data);

		return c.json(
			{
				jobId: result.id,
			} satisfies ImportResponse,
			201,
		);
	},
);

app.get("/metrics", printMetrics);

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
