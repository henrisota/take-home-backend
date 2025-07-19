export type ImportEntity = {
    name: string;
    email: string;
}

export type Payload = ImportEntity[];

export interface Result {
    jobId: number;
}

export class Service {
    constructor() {}

    async import(source: string, payload: Payload): Promise<Result> {
        return {
            jobId: 0
        };
    }
}