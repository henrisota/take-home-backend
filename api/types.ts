import { z } from "zod";

export const ImportRequestSchema = z.object({
  source: z.string(),
  data: z.array(z.record(z.string(), z.unknown()))
});

export interface ImportRequest {
	source: string;
	data: Record<string, unknown>[];
}

export interface ImportResponse {
	jobId: number;
}

export interface ErrorResponse {
	message: string;
	error: object;
}
