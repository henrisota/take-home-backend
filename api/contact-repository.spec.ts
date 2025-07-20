import type { SupabaseClient } from "@supabase/supabase-js";
import { ContactRepository } from "./contact-repository";
import type { Contact, ProcessedContact } from "./types";

describe("ContactRepository", () => {
	let supabaseMock: jest.Mocked<SupabaseClient>;
	let contactRepository: ContactRepository;

	beforeEach(() => {
		supabaseMock = {
			from: jest.fn(),
		} as unknown as jest.Mocked<SupabaseClient>;

		contactRepository = new ContactRepository(supabaseMock, {});
	});

	describe("batchSave", () => {
		it("should save no contacts if no contacts are provided", async () => {
			const contacts: Contact[] = [];

			const result = await contactRepository.batchSave(contacts);

			expect(result).toEqual([]);
			expect(supabaseMock.from).not.toHaveBeenCalled();
		});

		it("should save contacts if contacts are provided", async () => {
			const source = "source";
			const contacts: Contact[] = [
				{
					name: "Alice Johnson",
					email: "alice@example.com",
				},
				{
					name: "Bob Smith",
					email: "bob@example.com",
				},
				{
					name: "Charlie Brown",
					email: "charlie@example.com",
				},
			].map((contact) => ({ ...contact, source }));

			const imported_at = new Date().toISOString();
			const supabaseResponse = contacts.map(
				(contact, index) =>
					({
						...contact,
						id: index.toString(),
						imported_at,
					}) satisfies ProcessedContact,
			);

			supabaseMock.from.mockReturnValue({
				insert: jest.fn().mockReturnValue({
					select: jest
						.fn()
						.mockResolvedValue({ data: supabaseResponse, error: null }),
				}),
			} as any);

			const processedContacts = await contactRepository.batchSave(contacts);

			expect(processedContacts).toEqual([
				{
					id: "0",
					name: "Alice Johnson",
					email: "alice@example.com",
					source,
					imported_at,
				},
				{
					id: "1",
					name: "Bob Smith",
					email: "bob@example.com",
					source,
					imported_at,
				},
				{
					id: "2",
					name: "Charlie Brown",
					email: "charlie@example.com",
					source,
					imported_at,
				},
			]);
		});
	});
});
