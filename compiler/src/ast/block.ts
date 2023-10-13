import { AST } from "./ast";
import { Statements } from "./statements";
import { IVisitor } from "./visitor";

export class Block extends AST {
    constructor(public statements: Statements) {
        super();
    }

    accept(visitor: IVisitor, arg: any): void {
        throw new Error("Method not implemented.");
    }
}
