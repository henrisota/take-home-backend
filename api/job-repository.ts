import type { SupabaseClient } from "@supabase/supabase-js";
import crypto from "crypto";
import tus from "tus-js-client";
import { ImportPayload, Job } from "./types";

export interface JobRepositoryConfiguration {
	url: string;
	key: string;
	bucket: string;
}

export class JobRepository {
	constructor(
		private readonly supabase: SupabaseClient,
		private readonly configuration: JobRepositoryConfiguration,
	) {}

	async get(id: string): Promise<Job> {
		const { data: _, error: existsError } = await this.supabase.storage
			.from(this.configuration.bucket)
			.exists(id);

		if (existsError) {
			throw new Error(
				`Failed to check existence of job ${id}: ${String(existsError)}`,
			);
		}

		const { data, error } = await this.supabase.storage
			.from(this.configuration.bucket)
			.download(id);

		if (error) {
			throw new Error(`Failed to get payload of job ${id}: ${String(error)}`);
		}

		const content = await data.text();

		return Job.fromPersistence(JSON.parse(content));
	}

	async save(job: Job): Promise<Job> {
		const { id } = job;

		const buffer = Buffer.from(JSON.stringify(job.toPersistence()), "utf-8");

		await new Promise<boolean>((resolve, reject) => {
			const upload = new tus.Upload(buffer, {
				endpoint: `${this.configuration.url}/storage/v1/upload/resumable`,
				retryDelays: [0, 3000, 5000, 10000, 20000],
				headers: {
					authorization: `Bearer ${this.configuration.key}`,
					"x-upsert": "true",
				},
				uploadDataDuringCreation: true,
				removeFingerprintOnSuccess: true,
				metadata: {
					bucketName: this.configuration.bucket,
					objectName: id,
					contentType: "application/json",
				},
				chunkSize: 6 * 1024 * 1024,
				onError: (error) => {
					console.debug(`Upload failed: ${String(error)}`);
					reject(error);
				},
				onProgress: (bytesUploaded, bytesTotal) => {
					var percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
					console.debug("Uploading", {
						bytesUploaded,
						bytesTotal,
						percentage: percentage + "%",
					});
				},
				onSuccess: () => {
					console.debug(`Upload complete for ${id}`);
					resolve(true);
				},
			});

			return upload.findPreviousUploads().then((previousUploads) => {
				if (previousUploads.length) {
					upload.resumeFromPreviousUpload(previousUploads[0]);
				}

				upload.start();
			});
		});

		return job;
	}
}
