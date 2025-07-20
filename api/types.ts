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
	jobId: string;
}

export interface ErrorResponse {
	message: string;
	error: object;
}

export type ImportEntity = {
	name: string;
	email: string;
}

export type Payload = ImportEntity[];

export interface Result {
	id: string;
}

export interface Job {
	id: string;
	source: string;
	payload: Payload;
}

export interface WorkerPayload {
    id: string;
    source: string;
}

interface Contact {
	name: string;
	email: string;
	source: string;
}

interface ProcessedContact {
	id: string;
	name: string;
	email: string;
	source: string;
	imported_at: string;
}
