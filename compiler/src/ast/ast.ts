import { IVisitor } from "./visitor";

export abstract class AST {
    constructor() {}

    abstract accept(visitor: IVisitor, arg: any): any;
}
