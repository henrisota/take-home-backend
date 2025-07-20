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
            throw new Error(`Failed to save contact ${contact}: ${String(error)}`);
        }

        return {
            id: data.id,
            name: data.name,
            email: data.email,
            source: data.source,
            imported_at: data.imported_at
        } satisfies ProcessedContact;
    }

    async batchSave(contacts: Contact[]): Promise<ProcessedContact[]> {
        if (!contacts.length) {
            return [];
        }

        const { data, error } = await this.supabase.from('contacts').insert(contacts).select();

        if (error) {
            throw new Error(`Failed to save contacts: ${String(error)}`);
        }

        return data.map((item: any) => ({
            id: item.id,
            name: item.name,
            email: item.email,
            source: item.source,
            imported_at: item.imported_at
        })) satisfies ProcessedContact[];
    }
}
