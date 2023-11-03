import { Terminal } from "./terminal";
import { IVisitor } from "./visitor";

export class Type extends Terminal {
    constructor(public spelling: string) {
        super(spelling);
    }

    accept(visitor: IVisitor, arg: any) {
        visitor.visitType(this, arg);
    }
}
