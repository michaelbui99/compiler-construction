import { AST } from "./ast";
import { Block } from "./block";
import { IVisitor } from "./visitor";

export class Program extends AST {
    constructor(public block: Block) {
        super();
    }

    accept(visitor: IVisitor, arg: any): void {
        return visitor.visitProgram(this, arg);
    }
}
