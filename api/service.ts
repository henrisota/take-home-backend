export type Payload = Record<string, unknown>[];

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