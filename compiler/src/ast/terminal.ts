import { AST } from "./ast";
import { IVisitor } from "./visitor";

export abstract class Terminal extends AST {
    constructor(spelling: string) {
        super();
    }

    abstract accept(visitor: IVisitor, arg: any): any;
}
