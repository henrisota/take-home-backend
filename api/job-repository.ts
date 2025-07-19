import { SupabaseClient } from "@supabase/supabase-js";

export interface JobRepositoryConfiguration {
    bucket: string;
}

export class JobRepository {
    constructor(private readonly supabase: SupabaseClient, private readonly configuration: JobRepositoryConfiguration) {}

    async save() {}
}