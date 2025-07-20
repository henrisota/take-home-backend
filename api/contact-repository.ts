import { Contact, ProcessedContact } from "./types";

export interface ContactRepositoryConfiguration {}

export class ContactRepository {
    constructor(
        private readonly configuration: ContactRepositoryConfiguration
    ) {}

    async save(contact: Contact): Promise<ProcessedContact> {
        return {
            ...contact,
            id: 'id',
            imported_at: new Date().toISOString(),
        } satisfies ProcessedContact;
    }
}
