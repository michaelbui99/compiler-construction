import { Terminal } from "./terminal";

export class Type extends Terminal {
    constructor(public spelling: string) {
        super(spelling);
    }
}
