import { SupabaseClient } from "@supabase/supabase-js";
import { Job } from "./types";

export interface JobRepositoryConfiguration {
    bucket: string;
}

export class JobRepository {
    constructor(private readonly supabase: SupabaseClient, private readonly configuration: JobRepositoryConfiguration) {}

    async save(job: Job): Promise<Job> {
        return job;
    }
}
