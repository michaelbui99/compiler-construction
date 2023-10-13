import { Terminal } from "./terminal";

export class Identifier extends Terminal {
    constructor(public spelling: string) {
        super(spelling);
    }
}
