import { AST } from "./ast";
import { IVisitor } from "./visitor";

export class Block extends AST {
    constructor() {
        super();
    }

    accept(visitor: IVisitor, arg: any): void {
        throw new Error("Method not implemented.");
    }
}
