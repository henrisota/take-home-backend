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

export class Job {
    id: string;
    source: string;
    payload: Payload;

    constructor(id: string, source: string, payload: Payload) {
        this.id = id;
        this.source = source;
        this.payload = payload;
    }

    toPersistence(): Record<string, any> {
        return {
            id: this.id,
            source: this.source,
            payload: this.payload,
        };
    }

    static fromPersistence(data: Record<string, any>): Job {
        return new Job(data.id, data.source, data.payload);
    }
}

export interface WorkerPayload {
    id: string;
    source: string;
}

export interface Contact {
	name: string;
	email: string;
	source: string;
}

export interface ProcessedContact {
	id: string;
	name: string;
	email: string;
	source: string;
	imported_at: string;
}
