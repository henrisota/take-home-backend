import { SupabaseClient } from "@supabase/supabase-js";
import { Contact, ProcessedContact } from "./types";

export interface ContactRepositoryConfiguration {}

export class ContactRepository {
    constructor(
        private readonly supabase: SupabaseClient,
        private readonly configuration: ContactRepositoryConfiguration
    ) {}

    async save(contact: Contact): Promise<ProcessedContact> {
        const { data, error } = await this.supabase.from('contacts').insert([contact]).select().single();

        if (error) {
            throw new Error(`Failed to save contact ${contact}`);
        }

        return {
            id: data.id,
            name: data.name,
            email: data.email,
            source: data.source,
            imported_at: data.imported_at
        } satisfies ProcessedContact;
    }
}
