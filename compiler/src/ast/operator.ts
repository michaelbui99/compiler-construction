import { Terminal } from "./terminal";
import { IVisitor } from "./visitor";

export class Operator extends Terminal {
    constructor(public spelling: string) {
        super(spelling);
    }

    accept(visitor: IVisitor, arg: any): any {
        visitor.visitOperator(this, arg);
    }
}
