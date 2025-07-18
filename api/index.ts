import { serve } from "@hono/node-server";
import { createClient } from "@supabase/supabase-js";
import { Hono } from "hono";
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { zValidator } from '@hono/zod-validator'
import { ErrorResponse, ImportRequest, ImportRequestSchema,  ImportResponse } from "./types";

// import { quickAddJob } from "graphile-worker";

const app = new Hono();
app.use(logger(), prettyJSON());

const supabase = createClient(
	process.env.SUPABASE_URL!,
	process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const connectionString = process.env.DATABASE_URL!;

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
		return c.json({ message: "TODO" }, 501);
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
