import type { SupabaseClient } from "@supabase/supabase-js";
import type { Contact, ProcessedContact } from "./types";

export type ContactRepositoryConfiguration = {};

export class ContactRepository {
	constructor(
		private readonly supabase: SupabaseClient,
		private readonly configuration: ContactRepositoryConfiguration,
	) {}

	async batchSave(contacts: Contact[]): Promise<ProcessedContact[]> {
		if (!contacts.length) {
			return [];
		}

		const { data, error } = await this.supabase
			.from("contacts")
			.insert(contacts)
			.select();

		if (error) {
			throw new Error(`Failed to save contacts: ${String(error)}`);
		}

		return data.map((item: any) => ({
			id: item.id,
			name: item.name,
			email: item.email,
			source: item.source,
			imported_at: item.imported_at,
		})) satisfies ProcessedContact[];
	}
}
