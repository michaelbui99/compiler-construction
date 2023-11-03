import { Terminal } from "./terminal";
import { IVisitor } from "./visitor";

export class Identifier extends Terminal {
    constructor(public spelling: string) {
        super(spelling);
    }

    accept(visitor: IVisitor, arg: any): any {
        visitor.visitIdentifier(this, arg);
    }
}
