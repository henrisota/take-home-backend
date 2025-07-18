import { z } from "zod";

const ImportRequestDataItemSchema = z.object({
  name: z.string(),
  email: z.string(),
});

export const ImportRequestSchema = z.object({
  source: z.string(),
  data: z.array(ImportRequestDataItemSchema),
});

export type ImportRequestDataItem = {
	name: string;
	email: string;
}

export interface ImportRequest {
	source: string;
	data: ImportRequestDataItem[];
}

export interface ImportResponse {
	jobId: number;
}

export interface ErrorResponse {
	message: string;
	error: object;
}
