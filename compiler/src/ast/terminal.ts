import { AST } from "./ast";
import { IVisitor } from "./visitor";

export class Terminal extends AST {
    constructor(spelling: string) {
        super();
    }

    accept(visitor: IVisitor, arg: any): void {
        throw new Error("Method not implemented.");
    }
}
